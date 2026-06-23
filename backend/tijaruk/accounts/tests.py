import re
from datetime import timedelta
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from google.auth.exceptions import TransportError
from rest_framework.test import APIClient
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from business.models import (
    Business,
    BusinessUserSettings,
)
from .models import EmailVerificationOTP, User
from .services import (
    GoogleAuthenticationError,
    GoogleVerificationUnavailableError,
    OTP_MAX_ATTEMPTS,
    begin_verification,
    verify_google_credential,
)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AuthenticationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="supplier@example.com",
            username="supplier",
            password="password",
            role=User.Role.SUPPLIER,
        )

    def registration_data(self, **overrides):
        return {
            "name": "Amina Saleh",
            "email": "amina@example.com",
            "username": "amina",
            "phone": "+966500000001",
            "password": "StrongPass!2026",
            "confirm_password": "StrongPass!2026",
            "accepted_terms": True,
            **overrides,
        }

    def test_archived_user_cannot_login(self):
        self.user.is_archived = True
        self.user.save(update_fields=["is_archived"])

        response = self.client.post(
            "/api/accounts/login/",
            {
                "email": self.user.email,
                "password": "password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_archived_user_cannot_refresh_access_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.user.is_archived = True
        self.user.save(update_fields=["is_archived"])
        self.client.cookies["refresh_token"] = str(refresh)

        response = self.client.post("/api/accounts/refresh/")

        self.assertEqual(response.status_code, 401)
        self.assertNotIn("access", response.data)

    def test_supplier_cannot_login_to_dashboard(self):
        response = self.client.post(
            "/api/accounts/login/",
            {
                "email": self.user.email,
                "password": "password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_business_user_can_login(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business@example.com",
            password="business-password",
            role=User.Role.BUSINESS,
        )

        response = self.client.post(
            "/api/accounts/login/",
            {
                "email": business_user.email,
                "password": "business-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], User.Role.BUSINESS)
        self.assertEqual(response.data["user"]["role_type"], User.RoleType.USER)
        self.assertIn("access", response.data)

    def test_business_user_with_two_factor_must_verify_email_otp(self):
        business_user = User.objects.create_user(
            email="secure-business@example.com",
            username="secure-business",
            password="business-password",
            role=User.Role.BUSINESS,
        )
        BusinessUserSettings.objects.create(
            user=business_user,
            two_factor_enabled=True,
        )

        response = self.client.post(
            "/api/accounts/login/",
            {
                "email": business_user.email,
                "password": "business-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 202, response.data)
        self.assertTrue(response.data["verification_required"])
        self.assertNotIn("access", response.data)
        self.assertEqual(len(mail.outbox), 1)

        code = re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)
        verify_response = self.client.post(
            "/api/accounts/verify-otp/",
            {
                "verification_token": response.data["verification_token"],
                "otp": code,
            },
            format="json",
        )

        self.assertEqual(verify_response.status_code, 200, verify_response.data)
        self.assertIn("access", verify_response.data)

    def test_business_user_can_update_two_factor_setting(self):
        business_user = User.objects.create_user(
            email="settings-business@example.com",
            username="settings-business",
            password="business-password",
            role=User.Role.BUSINESS,
        )
        self.client.force_authenticate(business_user)

        initial = self.client.get("/api/user-settings/")
        updated = self.client.patch(
            "/api/user-settings/",
            {
                "two_factor_enabled": True,
                "email_notifications": False,
                "new_rfq_responses": False,
                "order_status_updates": True,
            },
            format="json",
        )

        self.assertEqual(initial.status_code, 200, initial.data)
        self.assertFalse(initial.data["two_factor_enabled"])
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertTrue(updated.data["two_factor_enabled"])
        self.assertFalse(updated.data["email_notifications"])
        self.assertFalse(updated.data["new_rfq_responses"])
        self.assertTrue(updated.data["order_status_updates"])

    def test_authenticated_user_can_change_password(self):
        business_user = User.objects.create_user(
            email="password-business@example.com",
            username="password-business",
            password="OldPassword!2026",
            role=User.Role.BUSINESS,
        )
        self.client.force_authenticate(business_user)

        response = self.client.post(
            "/api/accounts/change-password/",
            {
                "current_password": "OldPassword!2026",
                "new_password": "NewPassword!2027",
                "confirm_password": "NewPassword!2027",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        business_user.refresh_from_db()
        self.assertTrue(business_user.check_password("NewPassword!2027"))

    def test_change_password_rejects_incorrect_current_password(self):
        business_user = User.objects.create_user(
            email="wrong-password-business@example.com",
            username="wrong-password-business",
            password="OldPassword!2026",
            role=User.Role.BUSINESS,
        )
        self.client.force_authenticate(business_user)

        response = self.client.post(
            "/api/accounts/change-password/",
            {
                "current_password": "IncorrectPassword!2026",
                "new_password": "NewPassword!2027",
                "confirm_password": "NewPassword!2027",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("current_password", response.data)

    def test_logout_blacklists_refresh_token_and_clears_auth_cookies(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="business-password",
            role=User.Role.BUSINESS,
        )
        refresh = RefreshToken.for_user(business_user)
        self.client.cookies["access_token"] = str(refresh.access_token)
        self.client.cookies["refresh_token"] = str(refresh)

        response = self.client.post("/api/accounts/logout/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.cookies["access_token"]["max-age"], 0)
        self.assertEqual(response.cookies["refresh_token"]["max-age"], 0)
        with self.assertRaises(TokenError):
            RefreshToken(str(refresh))

    def test_register_requires_otp_and_creates_only_user(self):
        response = self.client.post(
            "/api/accounts/register/",
            self.registration_data(),
            format="json",
        )

        self.assertEqual(response.status_code, 202, response.data)
        user = User.objects.get(email="amina@example.com")
        self.assertEqual(user.full_name, "Amina Saleh")
        self.assertEqual(user.username, "amina")
        self.assertEqual(user.phone, "+966500000001")
        self.assertEqual(user.role, User.Role.BUSINESS)
        self.assertEqual(user.role_type, User.RoleType.USER)
        self.assertIsNotNone(user.terms_accepted_at)
        self.assertTrue(user.check_password("StrongPass!2026"))
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_verified)
        self.assertNotIn("access", response.data)
        self.assertFalse(Business.objects.filter(user=user).exists())

        code = re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)
        verify_response = self.client.post(
            "/api/accounts/verify-otp/",
            {
                "verification_token": response.data["verification_token"],
                "otp": code,
            },
            format="json",
        )

        self.assertEqual(verify_response.status_code, 200, verify_response.data)
        self.assertIn("access", verify_response.data)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)
        self.assertFalse(Business.objects.filter(user=user).exists())

    def test_register_requires_matching_passwords(self):
        response = self.client.post(
            "/api/accounts/register/",
            self.registration_data(confirm_password="DifferentPass!2026"),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirm_password", response.data)

    def test_register_requires_terms_acceptance(self):
        response = self.client.post(
            "/api/accounts/register/",
            self.registration_data(accepted_terms=False),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("accepted_terms", response.data)

    def password_reset_token_from_email(self):
        reset_url = re.search(r"https?://\S+", mail.outbox[-1].body).group(0)
        return parse_qs(urlparse(reset_url).query)["token"][0]

    @override_settings(FRONTEND_URL="http://testserver")
    def test_password_reset_request_sends_email_for_existing_user(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="old-password",
            role=User.Role.BUSINESS,
        )

        response = self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": business_user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            response.data["detail"],
            "If an account exists, we sent a reset link.",
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/reset-password?token=", mail.outbox[0].body)

    def test_password_reset_request_unknown_email_returns_success_without_email(self):
        response = self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": "missing@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            response.data["detail"],
            "If an account exists, we sent a reset link.",
        )
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(FRONTEND_URL="http://testserver")
    def test_password_reset_confirm_with_valid_token_changes_password(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="old-password",
            role=User.Role.BUSINESS,
        )
        self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": business_user.email},
            format="json",
        )
        token = self.password_reset_token_from_email()

        response = self.client.post(
            "/api/accounts/password-reset/confirm/",
            {
                "token": token,
                "password": "NewPassword!2026",
                "confirm_password": "NewPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        business_user.refresh_from_db()
        self.assertTrue(business_user.check_password("NewPassword!2026"))

    def test_password_reset_confirm_rejects_invalid_token(self):
        response = self.client.post(
            "/api/accounts/password-reset/confirm/",
            {
                "token": "invalid-token",
                "password": "NewPassword!2026",
                "confirm_password": "NewPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    @override_settings(FRONTEND_URL="http://testserver")
    def test_password_reset_confirm_rejects_expired_token(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="old-password",
            role=User.Role.BUSINESS,
        )
        self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": business_user.email},
            format="json",
        )
        token = self.password_reset_token_from_email()

        with patch("accounts.services.PASSWORD_RESET_TOKEN_MAX_AGE", -1):
            response = self.client.post(
                "/api/accounts/password-reset/confirm/",
                {
                    "token": token,
                    "password": "NewPassword!2026",
                    "confirm_password": "NewPassword!2026",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    @override_settings(FRONTEND_URL="http://testserver")
    def test_password_reset_confirm_rejects_mismatched_passwords(self):
        business_user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="old-password",
            role=User.Role.BUSINESS,
        )
        self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": business_user.email},
            format="json",
        )
        token = self.password_reset_token_from_email()

        response = self.client.post(
            "/api/accounts/password-reset/confirm/",
            {
                "token": token,
                "password": "NewPassword!2026",
                "confirm_password": "DifferentPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirm_password", response.data)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    GOOGLE_CLIENT_ID="google-client-id",
)
class GoogleAuthenticationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.claims = {
            "google_id": "google-123",
            "email": "google@example.com",
            "full_name": "Google User",
            "picture": "",
        }

    def google_login(self, **claims):
        payload = {**self.claims, **claims}
        with patch("accounts.views.verify_google_credential", return_value=payload):
            return self.client.post(
                "/api/accounts/google/",
                {"credential": "credential"},
                format="json",
            )

    def otp_from_email(self):
        return re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)

    def pending_verification(self):
        user = User.objects.create_user(
            email="pending@example.com",
            username="pending",
            password="password",
            role=User.Role.BUSINESS,
            is_active=False,
            is_verified=False,
        )
        _, token = begin_verification(user)
        return user, token

    def test_new_google_user_receives_jwt_without_otp(self):
        response = self.google_login()

        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("access_token", response.cookies)
        user = User.objects.get(email="google@example.com")
        self.assertEqual(user.google_id, "google-123")
        self.assertEqual(user.role, User.Role.BUSINESS)
        self.assertEqual(user.role_type, User.RoleType.GUEST)
        self.assertEqual(response.data["user"]["role_type"], User.RoleType.GUEST)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)
        self.assertFalse(user.has_usable_password())
        self.assertFalse(EmailVerificationOTP.objects.filter(user=user).exists())

    def test_existing_email_is_linked_without_duplicate(self):
        user = User.objects.create_user(
            email="google@example.com",
            username="existing",
            password="password",
            role=User.Role.BUSINESS,
        )

        response = self.google_login()

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(User.objects.filter(email="google@example.com").count(), 1)
        user.refresh_from_db()
        self.assertEqual(user.google_id, "google-123")
        self.assertIn("access", response.data)

    def test_google_profile_photo_is_saved_for_existing_user_without_photo(self):
        user = User.objects.create_user(
            email="google@example.com",
            username="existing",
            password="password",
            role=User.Role.BUSINESS,
        )

        with patch("accounts.services._save_profile_photo") as save_photo:
            response = self.google_login(picture="https://example.com/photo.jpg")

        self.assertEqual(response.status_code, 200, response.data)
        save_photo.assert_called_once_with(user, "https://example.com/photo.jpg")

    def test_google_profile_photo_does_not_replace_existing_photo(self):
        user = User.objects.create_user(
            email="google@example.com",
            username="existing",
            password="password",
            role=User.Role.BUSINESS,
        )
        user.photo = "users/photos/current.jpg"
        user.save(update_fields=["photo"])

        with patch("accounts.services._save_profile_photo") as save_photo:
            response = self.google_login(picture="https://example.com/photo.jpg")

        self.assertEqual(response.status_code, 200, response.data)
        save_photo.assert_not_called()

    def test_conflicting_google_id_is_rejected(self):
        User.objects.create_user(
            email="google@example.com",
            username="existing",
            password="password",
            role=User.Role.BUSINESS,
            google_id="different-google-id",
        )

        response = self.google_login()

        self.assertEqual(response.status_code, 409)
        self.assertNotIn("access", response.data)

    def test_google_login_does_not_require_terms_acceptance(self):
        with patch("accounts.views.verify_google_credential", return_value=self.claims):
            response = self.client.post(
                "/api/accounts/google/",
                {"credential": "credential"},
                format="json",
            )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn("access", response.data)

    def test_correct_otp_verifies_user_and_returns_existing_session(self):
        _, token = self.pending_verification()
        code = self.otp_from_email()

        response = self.client.post(
            "/api/accounts/verify-otp/",
            {
                "verification_token": token,
                "otp": code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("access_token", response.cookies)
        user = User.objects.get(email="pending@example.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)

    def test_otp_cannot_be_replayed(self):
        _, token = self.pending_verification()
        payload = {
            "verification_token": token,
            "otp": self.otp_from_email(),
        }
        self.assertEqual(
            self.client.post("/api/accounts/verify-otp/", payload, format="json").status_code,
            200,
        )

        response = self.client.post(
            "/api/accounts/verify-otp/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_expired_otp_is_rejected(self):
        _, token = self.pending_verification()
        otp = EmailVerificationOTP.objects.get()
        otp.expires_at = timezone.now() - timedelta(seconds=1)
        otp.save(update_fields=["expires_at"])

        response = self.client.post(
            "/api/accounts/verify-otp/",
            {
                "verification_token": token,
                "otp": self.otp_from_email(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access", response.data)

    def test_failed_otp_attempts_are_counted_and_limited(self):
        _, token = self.pending_verification()
        payload = {
            "verification_token": token,
            "otp": "000000",
        }

        for _ in range(OTP_MAX_ATTEMPTS):
            response = self.client.post(
                "/api/accounts/verify-otp/",
                payload,
                format="json",
            )
            self.assertEqual(response.status_code, 400)

        otp = EmailVerificationOTP.objects.get()
        self.assertEqual(otp.failed_attempts, OTP_MAX_ATTEMPTS)
        payload["otp"] = self.otp_from_email()
        self.assertEqual(
            self.client.post(
                "/api/accounts/verify-otp/",
                payload,
                format="json",
            ).status_code,
            400,
        )

    def test_resend_enforces_cooldown_and_invalidates_old_code(self):
        _, token = self.pending_verification()
        old_code = self.otp_from_email()

        cooldown_response = self.client.post(
            "/api/accounts/resend-otp/",
            {"verification_token": token},
            format="json",
        )
        self.assertEqual(cooldown_response.status_code, 429)

        otp = EmailVerificationOTP.objects.get()
        otp.resend_available_at = timezone.now() - timedelta(seconds=1)
        otp.save(update_fields=["resend_available_at"])
        response = self.client.post(
            "/api/accounts/resend-otp/",
            {"verification_token": token},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        new_code = self.otp_from_email()
        self.assertNotEqual(old_code, new_code)
        self.assertEqual(
            self.client.post(
                "/api/accounts/verify-otp/",
                {"verification_token": token, "otp": old_code},
                format="json",
            ).status_code,
            400,
        )

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_google_claims_must_have_verified_email_and_valid_issuer(self, verifier):
        verifier.return_value = {
            "sub": "123",
            "email": "google@example.com",
            "email_verified": False,
            "exp": 9999999999,
            "iss": "https://accounts.google.com",
            "aud": "google-client-id",
        }
        with self.assertRaises(GoogleAuthenticationError):
            verify_google_credential("credential")

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_google_credential_must_match_configured_client_id(self, verifier):
        verifier.return_value = {
            "sub": "123",
            "email": "google@example.com",
            "email_verified": True,
            "exp": 9999999999,
            "iss": "https://accounts.google.com",
            "aud": "different-client-id",
        }

        with self.assertRaisesRegex(
            GoogleAuthenticationError,
            "configuration does not match",
        ):
            verify_google_credential("credential")

        verifier.return_value["email_verified"] = True
        verifier.return_value["iss"] = "https://attacker.example"
        with self.assertRaises(GoogleAuthenticationError):
            verify_google_credential("credential")

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_google_transport_failure_is_not_reported_as_invalid_token(self, verifier):
        verifier.side_effect = TransportError("Google is unavailable")

        with self.assertRaises(GoogleVerificationUnavailableError):
            verify_google_credential("credential")

    @patch(
        "accounts.views.verify_google_credential",
        side_effect=GoogleVerificationUnavailableError(
            "Google sign-in verification is temporarily unavailable."
        ),
    )
    def test_google_transport_failure_returns_service_unavailable(self, verifier):
        response = self.client.post(
            "/api/accounts/google/",
            {"credential": "credential", "accepted_terms": True},
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.data["error"],
            "Google sign-in verification is temporarily unavailable.",
        )
