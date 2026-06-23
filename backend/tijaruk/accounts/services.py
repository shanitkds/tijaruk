import hashlib
import hmac
import logging
import mimetypes
import secrets
import requests
from dataclasses import dataclass
from datetime import timedelta
from urllib.error import URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.text import slugify
from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from .models import EmailVerificationOTP, User

logger = logging.getLogger(__name__)

OTP_TTL = timedelta(minutes=10)
OTP_RESEND_COOLDOWN = timedelta(seconds=60)
OTP_MAX_ATTEMPTS = 5
VERIFICATION_TOKEN_MAX_AGE = 60 * 60
PASSWORD_RESET_TOKEN_MAX_AGE = 60 * 60
PASSWORD_RESET_SALT = "accounts.password-reset"
MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024


class GoogleAuthenticationError(Exception):
    pass


class GoogleVerificationUnavailableError(Exception):
    pass


class AccountConflictError(Exception):
    pass


class AccountUnavailableError(Exception):
    pass


class OTPError(Exception):
    pass


class OTPExpiredError(OTPError):
    pass


class OTPCooldownError(OTPError):
    def __init__(self, retry_after):
        self.retry_after = retry_after
        super().__init__("Please wait before requesting another code.")


class PasswordResetError(Exception):
    pass


@dataclass
class GoogleAccountResult:
    user: User
    created: bool


def verify_google_credential(credential):
    session = requests.Session()
    session.trust_env = settings.GOOGLE_AUTH_TRUST_ENV

    try:
        claims = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(session=session),
            audience=None,
            clock_skew_in_seconds=10,
        )
    except TransportError as exc:
        raise GoogleVerificationUnavailableError(
            "Google sign-in verification is temporarily unavailable."
        ) from exc
    except (ValueError, GoogleAuthError) as exc:
        logger.warning("Google credential verification failed: %s", exc)
        message = str(exc).lower()
        if "expired" in message:
            detail = "The Google sign-in credential has expired. Please try again."
        elif "too early" in message:
            detail = "The server clock is not synchronized. Please try again shortly."
        else:
            detail = "Google returned an invalid sign-in credential. Please try again."
        raise GoogleAuthenticationError(detail) from exc

    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise GoogleAuthenticationError("The Google credential issuer is invalid.")
    if claims.get("aud") != settings.GOOGLE_CLIENT_ID:
        logger.warning(
            "Google credential audience mismatch: received %r, expected %r",
            claims.get("aud"),
            settings.GOOGLE_CLIENT_ID,
        )
        raise GoogleAuthenticationError(
            "Google sign-in configuration does not match this application."
        )
    if (
        any(not claims.get(field) for field in ("sub", "email", "exp"))
        or claims.get("email_verified") is not True
    ):
        raise GoogleAuthenticationError(
            "Google did not provide a verified email address."
        )

    return {
        "google_id": str(claims["sub"]),
        "email": User.objects.normalize_email(claims["email"]).lower(),
        "full_name": (claims.get("name") or "").strip(),
        "picture": claims.get("picture") or "",
    }


def _unique_username(email, full_name):
    base = slugify(full_name) or slugify(email.split("@", 1)[0]) or "user"
    base = base[:140]
    candidate = base
    while User.objects.filter(username__iexact=candidate).exists():
        candidate = f"{base[:131]}-{secrets.token_hex(4)}"
    return candidate


def _save_profile_photo(user, picture_url):
    if not picture_url:
        return
    parsed = urlparse(picture_url)
    if parsed.scheme != "https" or not parsed.hostname:
        return

    try:
        request = Request(picture_url, headers={"User-Agent": "Tijaruk/1.0"})
        with urlopen(request, timeout=5) as response:
            content_type = response.headers.get_content_type()
            if content_type not in {"image/jpeg", "image/png", "image/webp"}:
                return
            content = response.read(MAX_PROFILE_PHOTO_BYTES + 1)
            if len(content) > MAX_PROFILE_PHOTO_BYTES:
                return
    except (OSError, URLError, ValueError):
        return

    extension = mimetypes.guess_extension(content_type) or ".jpg"
    user.photo.save(
        f"google-{user.pk}{extension}",
        ContentFile(content),
        save=True,
    )


def resolve_google_account(claims):
    google_id = claims["google_id"]
    email = claims["email"]
    created = False

    with transaction.atomic():
        user = User.objects.select_for_update().filter(google_id=google_id).first()
        if user is not None:
            if user.email.lower() != email:
                raise AccountConflictError("Google account details conflict.")
        else:
            user = User.objects.select_for_update().filter(email__iexact=email).first()
            if user is not None:
                if user.google_id and user.google_id != google_id:
                    raise AccountConflictError("Google account details conflict.")
                user.google_id = google_id
                user.save(update_fields=["google_id", "updated_at"])
            else:
                try:
                    user = User.objects.create_user(
                        email=email,
                        username=_unique_username(email, claims["full_name"]),
                        password=None,
                        full_name=claims["full_name"],
                        google_id=google_id,
                        role=User.Role.BUSINESS,
                        role_type=User.RoleType.GUEST,
                        terms_accepted_at=timezone.now(),
                        is_verified=True,
                        is_active=True,
                    )
                    created = True
                except IntegrityError as exc:
                    raise AccountConflictError("Unable to create this account.") from exc

    if not user.photo:
        _save_profile_photo(user, claims["picture"])
    return GoogleAccountResult(user=user, created=created)


def ensure_dashboard_account(user, allow_pending=False):
    if user.is_archived:
        raise AccountUnavailableError("This account is unavailable.")
    if not allow_pending and (not user.is_active or not user.is_verified):
        raise AccountUnavailableError("This account is unavailable.")
    if user.role not in {
        User.Role.ADMIN,
        User.Role.INTERNAL_STAFF,
        User.Role.BUSINESS,
    }:
        raise AccountUnavailableError("This account does not have dashboard access.")


def _hash_otp(user_id, code, purpose=EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION):
    message = (
        f"{user_id}:{code}"
        if purpose == EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION
        else f"{user_id}:{purpose}:{code}"
    ).encode()
    return hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()


def _verification_token(user, purpose=EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION):
    return signing.dumps(
        {"user_id": user.pk, "purpose": purpose},
        salt="accounts.google-verification",
    )


def _password_reset_token(user):
    return signing.dumps(
        {"user_id": user.pk, "password": user.password},
        salt=PASSWORD_RESET_SALT,
    )


def verification_user(token):
    try:
        payload = signing.loads(
            token,
            salt="accounts.google-verification",
            max_age=VERIFICATION_TOKEN_MAX_AGE,
        )
        user = User.objects.get(pk=payload["user_id"])
        purpose = payload.get(
            "purpose", EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION
        )
        if purpose not in EmailVerificationOTP.Purpose.values:
            raise KeyError("purpose")
        return user, purpose
    except (signing.BadSignature, signing.SignatureExpired, KeyError, User.DoesNotExist):
        raise OTPExpiredError("Verification session is invalid or expired.")


def password_reset_user(token):
    try:
        payload = signing.loads(
            token,
            salt=PASSWORD_RESET_SALT,
            max_age=PASSWORD_RESET_TOKEN_MAX_AGE,
        )
        user = User.objects.get(pk=payload["user_id"], is_archived=False)
    except (signing.BadSignature, signing.SignatureExpired, KeyError, User.DoesNotExist):
        raise PasswordResetError("This password reset link is invalid or expired.")

    if payload.get("password") != user.password:
        raise PasswordResetError("This password reset link is invalid or expired.")
    return user


def send_password_reset_email(user, reset_base_url):
    token = _password_reset_token(user)
    reset_url = f"{reset_base_url}?{urlencode({'token': token})}"
    send_mail(
        subject="Reset your Tijaruk password",
        message=(
            "Use this link to reset your Tijaruk password:\n\n"
            f"{reset_url}\n\n"
            "This link expires in 1 hour. If you did not request this, "
            "you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def request_password_reset(email, reset_base_url):
    normalized_email = User.objects.normalize_email(email)
    user = User.objects.filter(
        email__iexact=normalized_email,
        is_archived=False,
    ).first()
    if user is not None:
        send_password_reset_email(user, reset_base_url)


def confirm_password_reset(token, password):
    user = password_reset_user(token)
    validate_password(password, user)
    user.set_password(password)
    user.save(update_fields=["password", "updated_at"])
    return user


def mask_email(email):
    local, domain = email.split("@", 1)
    visible = local[:2] if len(local) > 2 else local[:1]
    return f"{visible}{'*' * max(1, len(local) - len(visible))}@{domain}"


def issue_otp(user, purpose=EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION):
    now = timezone.now()
    code = f"{secrets.randbelow(1_000_000):06d}"
    with transaction.atomic():
        EmailVerificationOTP.objects.filter(
            user=user,
            purpose=purpose,
            consumed_at__isnull=True,
        ).update(consumed_at=now)
        otp = EmailVerificationOTP.objects.create(
            user=user,
            purpose=purpose,
            code_hash=_hash_otp(user.pk, code, purpose),
            expires_at=now + OTP_TTL,
            resend_available_at=now + OTP_RESEND_COOLDOWN,
        )

    try:
        send_mail(
            subject=(
                "Your Tijaruk sign-in code"
                if purpose == EmailVerificationOTP.Purpose.LOGIN
                else "Verify your Tijaruk account"
            ),
            message=(
                f"Your Tijaruk {'sign-in' if purpose == EmailVerificationOTP.Purpose.LOGIN else 'verification'} code is {code}. "
                "It expires in 10 minutes."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception:
        otp.consumed_at = timezone.now()
        otp.save(update_fields=["consumed_at"])
        raise
    return otp, _verification_token(user, purpose)


def begin_verification(user):
    now = timezone.now()
    latest = user.email_verification_otps.filter(
        purpose=EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION,
        consumed_at__isnull=True,
    ).first()
    if latest and latest.expires_at > now:
        return latest, _verification_token(user)
    return issue_otp(user)


def begin_login_verification(user):
    ensure_dashboard_account(user)
    return issue_otp(user, EmailVerificationOTP.Purpose.LOGIN)


def resend_otp(token):
    user, purpose = verification_user(token)
    if purpose == EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION and user.is_verified:
        raise OTPError("This account is already verified.")
    if purpose == EmailVerificationOTP.Purpose.LOGIN:
        ensure_dashboard_account(user)
        business_settings = getattr(user, "business_settings", None)
        if user.role != User.Role.BUSINESS or not (
            business_settings and business_settings.two_factor_enabled
        ):
            raise OTPError("Two-factor authentication is no longer enabled.")

    latest = user.email_verification_otps.filter(
        purpose=purpose,
        consumed_at__isnull=True,
    ).first()
    now = timezone.now()
    if latest and latest.resend_available_at > now:
        retry_after = max(1, int((latest.resend_available_at - now).total_seconds()))
        raise OTPCooldownError(retry_after)
    return issue_otp(user, purpose)


def verify_otp(token, code):
    user, purpose = verification_user(token)
    ensure_dashboard_account(
        user,
        allow_pending=purpose == EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION,
    )
    if purpose == EmailVerificationOTP.Purpose.LOGIN:
        business_settings = getattr(user, "business_settings", None)
        if user.role != User.Role.BUSINESS or not (
            business_settings and business_settings.two_factor_enabled
        ):
            raise OTPError("Two-factor authentication is no longer enabled.")
    now = timezone.now()
    invalid_code = False

    with transaction.atomic():
        otp = (
            EmailVerificationOTP.objects.select_for_update()
            .filter(user=user, purpose=purpose, consumed_at__isnull=True)
            .first()
        )
        if otp is None or otp.expires_at <= now:
            raise OTPExpiredError("Verification code is invalid or expired.")
        if otp.failed_attempts >= OTP_MAX_ATTEMPTS:
            raise OTPExpiredError("Verification code is invalid or expired.")
        if not hmac.compare_digest(
            otp.code_hash, _hash_otp(user.pk, code, purpose)
        ):
            otp.failed_attempts += 1
            otp.save(update_fields=["failed_attempts"])
            invalid_code = True
        else:
            otp.consumed_at = now
            otp.save(update_fields=["consumed_at"])
            if purpose == EmailVerificationOTP.Purpose.ACCOUNT_VERIFICATION:
                user.is_verified = True
                user.is_active = True
                user.save(update_fields=["is_verified", "is_active", "updated_at"])

    if invalid_code:
        raise OTPError("Verification code is invalid or expired.")

    return user
