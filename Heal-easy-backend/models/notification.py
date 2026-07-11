from datetime import datetime, timezone

VALID_TYPES = (
    "patient_arrived",
    "soap_ready",
    "emergency",
    "queue_update",
    "hospital",
)


def notification_key(doctor_id: str, sort_key_suffix: str) -> dict:
    return {
        "PK": f"DOCTOR#{doctor_id}",
        "SK": f"NOTIF#{sort_key_suffix}",
    }


def build_notification_item(
    doctor_id: str,
    notification_id: str,
    notif_type: str,
    title: str,
    message: str,
    read: bool = False,
    created_at: str = None,
) -> dict:

    if notif_type not in VALID_TYPES:
        raise ValueError(
            f"notif_type must be one of {VALID_TYPES}, got {notif_type!r}"
        )

    timestamp = created_at or datetime.now(timezone.utc).isoformat()

    item = {
        **notification_key(doctor_id, f"{timestamp}#{notification_id}"),
        "notificationId": notification_id,
        "notifType": notif_type,
        "title": title,
        "message": message,
        "read": read,
        "createdAt": timestamp,
    }

    return item