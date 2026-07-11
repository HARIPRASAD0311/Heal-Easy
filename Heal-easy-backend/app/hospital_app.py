from boto3.dynamodb.conditions import Attr
from database.dynamodb import table
from models.hospital_model import hospital_key,build_hospital_item
from decimal import Decimal

#create

def create_hospital(
    hospital_id: str,name: str,image: str,alt: str,badge: dict,meta_dashboard: str,
    meta_search: str,rating: float,chips: list, chips_full: list,full_name: str = None,
):
    item = build_hospital_item(
        hospital_id=hospital_id,name=name,image=image,alt=alt,badge=badge,meta_dashboard=meta_dashboard,
        meta_search=meta_search,rating=rating,chips=chips,chips_full=chips_full,full_name=full_name,
    )
    table.put_item(Item = item)
    return item
# READ

def get_hospital(hospital_id:str):
    response = table.get_item(
        Key = hospital_key(hospital_id)
    )
    return response.get("Item")

def list_hospitals():
    response = table.scan(
        FilterExpression = Attr("SK").eq("METADATA")
    )
    hospitals = [
        item
        for item in response.get("Items", [])
        if item["PK"].startswith("HOSPITAL#")
    ]
    return hospitals

#from decimal import Decimal

def update_hospital(hospital_id: str, updates: dict):
    if not updates:
        return get_hospital(hospital_id)

    update_parts = []
    expression_names = {}
    expression_values = {}

    for index, (field, value) in enumerate(updates.items()):

        # DynamoDB does not accept float values
        if isinstance(value, float):
            value = Decimal(str(value))

        name = f"#f{index}"
        value_name = f":v{index}"

        update_parts.append(f"{name} = {value_name}")

        expression_names[name] = field
        expression_values[value_name] = value

    table.update_item(
        Key=hospital_key(hospital_id),
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=expression_names,
        ExpressionAttributeValues=expression_values,
    )

    return get_hospital(hospital_id)

def delete_hospital(hospital_id:str):
    table.delete_item(Key = hospital_key(hospital_id))
    return{
        "message":f"hospital '{hospital_id} deleted successfullu'"
    }

"""
------------------------
table.put_item()

table.get_item()

table.scan()

table.update_item()

table.delete_item()"""
