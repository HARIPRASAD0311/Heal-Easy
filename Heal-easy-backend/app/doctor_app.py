from boto3.dynamodb.conditions import*
from database.dynamodb import table
from models.doctor import doctor_key, build_doctor_item

VALID_STATUS = {"available","busy",}
#create
def create_doctor(
    hospital_id: str,doctor_id: str,name: str,specialty: str,
    years_exp: int = None,avatar_url: str = None,status: str = "available",
):
    if status not in VALID_STATUS:
        raise ValueError(
            f"Status must be one of {VALID_STATUS}"
        )
    item = build_doctor_item(
        hospital_id=hospital_id,
        doctor_id=doctor_id,
        name=name,
        specialty=specialty,
        years_exp=years_exp,
        avatar_url=avatar_url,
        status=status,
    )
    table.put_item(Item = item)

#read
def get_doctor(hospital_id: str, doctor_id: str,):
    
    response = table.get_item(
        Key =doctor_key(hospital_id,doctor_id)
    )
    return response.get("Item")
    return item

def list_doctors_for_hospital(hospital_id: str):
        response = table.query(
            KeyConditionExpression = Key("PK").eq(f"HOSPITAL#{hospital_id}")&Key("SK").begins_with("DOCTOR#")
        )
        return response.get("Items", [])

#update
def update_doctor_status(
    hospital_id: str,
    doctor_id: str,
    status: str,
):
    """
    Update doctor's availability.
    """

    if status not in VALID_STATUS:
        raise ValueError(
            f"Status must be one of {VALID_STATUS}"
        )

    table.update_item(
        Key=doctor_key(hospital_id, doctor_id),
        UpdateExpression="SET #status = :status",
        ExpressionAttributeNames={
            "#status": "status"
        },
        ExpressionAttributeValues={
            ":status": status
        },
    )

    return get_doctor(hospital_id, doctor_id)


def update_doctor(hospital_id: str,doctor_id: str,updates: dict):

    if not updates:
        return get_doctor(hospital_id, doctor_id)

    update_parts = []
    expression_names = {}
    expression_values = {}

    for index, (field, value) in enumerate(updates.items()):

        field_name = f"#f{index}"
        value_name = f":v{index}"

        update_parts.append(
            f"{field_name} = {value_name}"
        )

        expression_names[field_name] = field
        expression_values[value_name] = value

    table.update_item(
        Key=doctor_key(hospital_id, doctor_id),
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=expression_names,
        ExpressionAttributeValues=expression_values,
    )

    return get_doctor(hospital_id, doctor_id)
def delete_doctor(
    hospital_id: str,
    doctor_id: str,
):

    table.delete_item(
        Key=doctor_key(hospital_id, doctor_id)
    )

    return {
        "message": f"Doctor '{doctor_id}' deleted successfully."
    }

"""
table.put_item()

table.get_item()

table.scan()

table.update_item()

table.delete_item()
"""