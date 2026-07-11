from datetime import datetime, timezone

VALID_SEVERITIES = ("critical","high","medium","low",)


def emergency_alert_key(doctor_id: str,sort_key_suffix: str,) -> dict:
    return {
        "PK": f"DOCTOR#{doctor_id}",
        "SK": f"ALERT#{sort_key_suffix}",
    }


def build_emergency_alert_item(
    doctor_id: str,
    alert_id: str,
    patient_id: str,
    visit_id: str,
    alert_type: str,
    severity: str,
    message: str,
    suggestions: list = None,
    acknowledged: bool = False,
    triggered_at: str = None,
) -> dict:

    if severity not in VALID_SEVERITIES:
        raise ValueError(f"severity must be one of {VALID_SEVERITIES}, got {severity!r}")

    timestamp = triggered_at or datetime.now(timezone.utc).isoformat()

    return {
        **emergency_alert_key(doctor_id,f"{timestamp}#{alert_id}",),

        "doctorId": doctor_id,
        "alertId": alert_id,
        "patientId": patient_id,
        "visitId": visit_id,
        "alertType": alert_type,
        "severity": severity,
        "message": message,
        "suggestions": suggestions or [],
        "acknowledged": acknowledged,
        "triggeredAt": timestamp,
    }