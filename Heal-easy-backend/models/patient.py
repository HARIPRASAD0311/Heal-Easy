def patient_key(patient_id: str) -> dict:
    return {
        "PK": f"PATIENT#{patient_id}",
        "SK": "METADATA",
    }


def build_patient_item(
    patient_id: str,
    phone: str,
    age: int = None,
    gender: str = None,
    blood_group: str = None,
    name: str = None,
    preferred_language: str = "en",
    saved_hospital_ids: set = None,
) -> dict:

    item = {
        **patient_key(patient_id),
        "patientId": patient_id,
        "phone": phone,
        "name": name,
        "age": age,
        "gender": gender,
        "bloodGroup": blood_group,
        "preferredLanguage": preferred_language,
    }

    if saved_hospital_ids:
        item["savedHospitalIds"] = saved_hospital_ids

    return item