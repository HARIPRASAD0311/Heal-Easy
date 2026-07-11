from database.dynamodb import table
from models.patient import patient_key, build_patient_item


# CREATE


def create_patient(
    patient_id: str,
    phone: str,
    name: str = None,
    preferred_language: str = "en",
    age: int = None,
    gender: str = None,
    blood_group: str = None,
    saved_hospital_ids: set = None,
):

    item = build_patient_item(
        patient_id=patient_id,
        phone=phone,
        name=name,
        preferred_language=preferred_language,
        age=age,
        gender=gender,
        blood_group=blood_group,
        saved_hospital_ids=saved_hospital_ids,
    )

    table.put_item(Item=item)

    return item


# READ

def get_patient(patient_id: str):

    response = table.get_item(
        Key=patient_key(patient_id)
    )

    return response.get("Item")


def get_or_create_patient(
    patient_id: str,
    phone: str,
):

    patient = get_patient(patient_id)

    if patient:
        return patient, False

    patient = create_patient(
        patient_id=patient_id,
        phone=phone,
    )

    return patient, True


# UPDATE


def update_patient(
    patient_id: str,
    updates: dict,
):

    if not updates:
        return get_patient(patient_id)

    update_parts = []
    expression_names = {}
    expression_values = {}

    for i, (field, value) in enumerate(updates.items()):

        name = f"#f{i}"
        value_name = f":v{i}"

        update_parts.append(f"{name} = {value_name}")

        expression_names[name] = field
        expression_values[value_name] = value

    table.update_item(

        Key=patient_key(patient_id),

        UpdateExpression="SET " + ", ".join(update_parts),

        ExpressionAttributeNames=expression_names,

        ExpressionAttributeValues=expression_values,
    )

    return get_patient(patient_id)



# SAVED HOSPITALS


def add_saved_hospital(
    patient_id: str,
    hospital_id: str,
):

    table.update_item(

        Key=patient_key(patient_id),

        UpdateExpression="""
        ADD savedHospitalIds :hospital
        """,

        ExpressionAttributeValues={
            ":hospital": {hospital_id},
        },
    )

    return get_patient(patient_id)


def remove_saved_hospital(
    patient_id: str,
    hospital_id: str,
):

    table.update_item(

        Key=patient_key(patient_id),

        UpdateExpression="""
        DELETE savedHospitalIds :hospital
        """,

        ExpressionAttributeValues={
            ":hospital": {hospital_id},
        },
    )

    return get_patient(patient_id)

# DELETE

def delete_patient(
    patient_id: str,
):

    table.delete_item(
        Key=patient_key(patient_id)
    )

    return {
        "message": f"Patient '{patient_id}' deleted successfully."
    }