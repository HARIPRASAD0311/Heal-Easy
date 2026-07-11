from datetime import datetime, timezone

VALID_STATUSES = ("waiting", "called","done", "no_show",)


def queue_key(
    hospital_id: str,
    department_id: str,
    token_id: str,
) -> dict:

    return {
        "PK": f"HOSPITAL#{hospital_id}#DEPT#{department_id}",
        "SK": f"QUEUE#{token_id}",
    }


def build_queue_item(
    hospital_id: str,
    department_id: str,
    token_id: str,
    patient_id: str,
    visit_id: str,
    position: int,
    status: str = "waiting",
    created_at: str = None,
) -> dict:

    if status not in VALID_STATUSES:
        raise ValueError(
            f"Status must be one of {VALID_STATUSES}"
        )

    return {
        **queue_key(
            hospital_id,
            department_id,
            token_id,
        ),

        "tokenId": token_id,
        "patientId": patient_id,
        "visitId": visit_id,
        "position": position,
        "status": status,
        "createdAt": created_at or datetime.now(timezone.utc).isoformat(),
    }