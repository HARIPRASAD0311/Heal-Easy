def department_key(hospital_id: str, department_id: str) -> dict:
    return {
        "PK": f"HOSPITAL#{hospital_id}",
        "SK": f"DEPARTMENTID#{department_id}",
    }


def build_department_item(
    hospital_id: str,
    department_id: str,
    label: str,
    floor: str = None,
    room: str = None,
) -> dict:

    item = {
        **department_key(hospital_id, department_id),
        "hospitalId": hospital_id,
        "departmentId": department_id,
        "label": label,
        "floor": floor,
        "room": room,
    }

    return item