def doctor_key(hospital_id: str, doctor_id: str) -> dict:
    return {
        "PK": f"HOSPITAL#{hospital_id}",
        "SK": f"DOCTOR#{doctor_id}",
    }


def build_doctor_item(
    hospital_id: str,
    doctor_id: str,
    name: str,
    specialty: str,
    years_exp: int = None,
    avatar_url: str = None,
    status: str = "available",
) -> dict:

    item = {
        **doctor_key(hospital_id, doctor_id),
        "hospitalId": hospital_id,
        "doctorId": doctor_id,
        "name": name,
        "specialty": specialty,
        "yearsExperience": years_exp,
        "avatarUrl": avatar_url,
        "status": status,
    }

    return item