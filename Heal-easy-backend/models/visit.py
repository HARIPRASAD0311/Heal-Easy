from datetime import datetime, timezone

VALID_STATUSES = (
    "waiting",
    "in_consult",
    "completed",
    "cancelled",
)


def visit_key(patient_id: str, visit_id: str)->dict:

    return {
        "PK": f"PATIENT#{patient_id}",
        "SK": f"VISIT#{visit_id}",
    }


def build_visit_item(
    patient_id: str,
    visit_id: str,
    hospital_id: str,
    department_id: str,
    status: str = "waiting",
    doctor_id: str = None,
    created_at: str = None,
)->dict:

    if status not in VALID_STATUSES:
        raise ValueError(
            f"Status must be one of {VALID_STATUSES}"
        )

    timestamp = created_at or datetime.now(timezone.utc).isoformat()

    item = {
        **visit_key(patient_id, visit_id),

        "patientId": patient_id,
        "visitId": visit_id,

        "hospitalId": hospital_id,
        "departmentId": department_id,

        "status": status,
        "createdAt": timestamp,

        "GSI2PK": f"HOSPITAL#{hospital_id}",
        "GSI2SK": f"VISIT#{status}#{timestamp}",
    }

    if doctor_id:

        item["doctorId"] = doctor_id

        item["GSI1PK"] = f"DOCTOR#{doctor_id}"
        item["GSI1SK"] = f"VISIT#{timestamp}"

    return item