"""
In-memory OTP store (replaces Redis-backed store).
Keys:
  otp:{email}          — dict {code_hash, attempts, expires_at}
  otp_cooldown:{email} — expires_at timestamp
"""
import json
import threading
import time

_lock = threading.Lock()
_otp: dict[str, dict] = {}
_cooldown: dict[str, float] = {}

OTP_TTL = 600       # 10 minutes
COOLDOWN_TTL = 60   # 1 minute


def save_otp(email: str, code_hash: str) -> None:
    with _lock:
        _otp[email] = {
            "code_hash": code_hash,
            "attempts": 0,
            "expires_at": time.time() + OTP_TTL,
        }


def get_otp(email: str) -> dict | None:
    with _lock:
        entry = _otp.get(email)
        if entry is None:
            return None
        if time.time() > entry["expires_at"]:
            del _otp[email]
            return None
        return {"code_hash": entry["code_hash"], "attempts": entry["attempts"]}


def increment_attempts(email: str) -> int:
    with _lock:
        entry = _otp.get(email)
        if entry is None or time.time() > entry["expires_at"]:
            return 0
        entry["attempts"] += 1
        return entry["attempts"]


def delete_otp(email: str) -> None:
    with _lock:
        _otp.pop(email, None)


def set_cooldown(email: str, seconds: int = COOLDOWN_TTL) -> None:
    with _lock:
        _cooldown[email] = time.time() + seconds


def has_cooldown(email: str) -> bool:
    with _lock:
        expires_at = _cooldown.get(email)
        if expires_at is None:
            return False
        if time.time() > expires_at:
            del _cooldown[email]
            return False
        return True


def cooldown_ttl(email: str) -> int:
    """Return remaining cooldown seconds, or 0 if no cooldown."""
    with _lock:
        expires_at = _cooldown.get(email)
        if expires_at is None:
            return 0
        remaining = expires_at - time.time()
        return max(int(remaining), 0)
