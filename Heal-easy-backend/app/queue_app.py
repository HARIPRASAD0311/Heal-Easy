import uuid
from boto3.dynamodb.conditions import*
from database.dynamodb import table
from models.queue import queue_key, build_queue_item, VALID_STATUSES

def _next_position(
    hospital_id: str,
    department_id: str,
) -> int:
    """
    Calculate the next queue position.
    """
    waiting = list_queue_for_department(
        hospital_id,
        department_id,
        status="waiting",
    )

    return len(waiting) + 1

# CREATE
def create_queue_token(
    hospital_id: str, department_id: str,token_id: str,
    patient_id: str,visit_id: str,position: int,status: str = "waiting",
    created_at: str = None,
):
    
    #Create a new queue token.
   
    token_id = str(uuid.uuid4())[:8]

    position = _next_position(
        hospital_id,
        department_id,
    )

    item = build_queue_item(
        hospital_id=hospital_id,department_id=department_id,
        token_id=token_id,patient_id=patient_id,
        visit_id=visit_id,position=position,status=status,created_at=created_at
    )

    table.put_item(Item=item)

    return item
# READ
def get_queue_token(
    hospital_id: str,
    department_id: str,
    token_id: str,
):
    """
    Return one queue token.
    """

    response = table.get_item(
        Key=queue_key(
            hospital_id,
            department_id,
            token_id,
        )
    )
    return response.get("Item")

def list_queue_for_department(
    hospital_id: str,department_id: str,status: str = None,
):
    
    #Return queue tokens for one department.
    
    response = table.query(
        KeyConditionExpression=
            Key("PK").eq(f"HOSPITAL#{hospital_id}#DEPT#{department_id}")
            &
            Key("SK").begins_with("QUEUE#")
    )

    items = response.get("Items", [])

    if status:

        if status not in VALID_STATUSES:
            raise ValueError(
                f"Status must be one of {VALID_STATUSES}"
            )

        items = [
            item
            for item in items
            if item.get("status") == status
        ]

    return sorted(
        items,
        key=lambda item: item["position"]
    )
# UPDATE
def update_queue_status(
    hospital_id: str,department_id: str,
    token_id: str,new_status: str,
):
    
    #Update queue status.
    
    if new_status not in VALID_STATUSES:
        raise ValueError(
            f"Status must be one of {VALID_STATUSES}"
        )

    table.update_item(

        Key=queue_key(
            hospital_id,
            department_id,
            token_id,
        ),

        UpdateExpression="SET #status = :status",

        ExpressionAttributeNames={
            "#status": "status",
        },

        ExpressionAttributeValues={
            ":status": new_status,
        },
    )

    return get_queue_token(
        hospital_id,
        department_id,
        token_id,
    )
# DELETE

def delete_queue_token(
    hospital_id: str,department_id: str,token_id: str,
):

    #Delete a queue token.
    

    table.delete_item(
        Key=queue_key(
            hospital_id,
            department_id,
            token_id,
        )
    )

    return {
        "message": f"Queue token '{token_id}' deleted successfully."
    }