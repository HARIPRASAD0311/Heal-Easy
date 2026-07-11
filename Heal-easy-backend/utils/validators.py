
import re

PHONE_PATTERN = re.compile(r"^\+?[1-9]\d{7,14}$")  # loose E.164-style check
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def require_fields(body: dict, required: list):
    
    "Raises ValueError listing every missing field at once, "
    
    missing = [f for f in required if f not in body or body[f] in (None, "")]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")


def validate_phone(phone: str):
    "Raises ValueError if phone isn't a plausible number. Used by patient sign-up/profile."
    if not phone or not PHONE_PATTERN.match(phone):
        raise ValueError(f"'{phone}' is not a valid phone number")


def validate_email(email: str):
    """Raises ValueError if email doesn't look like an email."""
    if not email or not EMAIL_PATTERN.match(email):
        raise ValueError(f"'{email}' is not a valid email address")


def validate_enum(value, valid_values: tuple, field_name: str):
    """
    Generic "is this one of the allowed values" check — use this in
    handlers instead of letting models/*.py raise the ValueError deep
    inside app/, so bad input gets caught closer to the API boundary.

        validate_enum(body["status"], VALID_STATUSES, "status")
    """
    if value not in valid_values:
        raise ValueError(f"{field_name} must be one of {valid_values}, got {value!r}")


def validate_rating(rating):
    """Hospital rating should be a number between 0 and 5."""
    try:
        rating = float(rating)
    except (TypeError, ValueError):
        raise ValueError(f"rating must be a number, got {rating!r}")
    if not (0 <= rating <= 5):
        raise ValueError(f"rating must be between 0 and 5, got {rating}")


def validate_string_length(value: str, field_name: str, max_length: int = 2000):
    """
    Guards against absurdly long free-text fields (SOAP note sections,
    summaries, notification messages) blowing past DynamoDB's per-item
    size limits or just being obviously malformed input.
    """
    if value and len(value) > max_length:
        raise ValueError(f"{field_name} must be under {max_length} characters, got {len(value)}")


def validate_position_or_severity(value, field_name: str, min_value: int = 1, max_value: int = 100):
    """Used for queue position and visit severity — both should be small positive integers."""
    try:
        value = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an integer, got {value!r}")
    if not (min_value <= value <= max_value):
        raise ValueError(f"{field_name} must be between {min_value} and {max_value}, got {value}")