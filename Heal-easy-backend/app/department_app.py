from boto3.dynamodb.conditions import *
from database.dynamodb import table
from models.department import department_key, build_department_item

#create

def create_department(
    hospital_id: str,department_id: str,label: str,floor: str = None,room: str = None,
):
    item = build_department_item(
        hospital_id=hospital_id, department_id=department_id,label=label,floor=floor,room=room,
    )
    table.put_item(Item = item)
    return item

#read

def get_department(hospital_id: str,department_id: str):
    response = table.get_item(Key = department_key(hospital_id,department_id))
    return response.get("Item")

def list_dept_for_doctors(hospital_id: str):
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"HOSPITAL#{hospital_id}")& Key("SK").begins_with("DEPARTMENTID#")
    )
    return response.get("Items", [])

#updates

def update_department(hospital_id: str, department_id: str, updates: dict):

    if not updates:
        return get_department(hospital_id, department_id)

    update_parts = []
    expression_names = {}
    expression_values = {}

    for index, (field, value) in enumerate(updates.items()):

        field_name = f"#f{index}"
        value_name = f":v{index}"

        update_parts.append(f"{field_name} = {value_name}")

        expression_names[field_name] = field
        expression_values[value_name] = value

    table.update_item(
        Key=department_key(hospital_id, department_id),
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=expression_names,
        ExpressionAttributeValues=expression_values,
    )

    return get_department(hospital_id, department_id)


def delete_department( hospital_id: str,department_id: str):
    table.delete_item(
        Key = department_key( hospital_id,department_id)
    )
    return {
        "message": f"Department '{department_id}' deleted successfully."
    }
