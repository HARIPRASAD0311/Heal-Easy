from datetime import datetime, timezone

from boto3.dynamodb.conditions import Key

from database.dynamodb import table
from models.consent import consent_key, build_consent_item

# CREATE 

def log_consent_event(
    visit_id: str,
    event_type: str,
    actor_id: str,
    notes: str = None,
    timestamp: str = None,
):
    ts = timestamp if timestamp else datetime.now(timezone.utc).isoformat()
    item = build_consent_item(
        visit_id=visit_id,
        event_type=event_type,
        actor_id=actor_id,
        timestamp=ts,          
        notes=notes,           
    )

    table.put_item(Item=item)

    return item

# READ ALL 

def list_consent_events(visit_id: str):
    response = table.query(
        KeyConditionExpression=
        Key("PK").eq(f"VISIT#{visit_id}")
        &
        Key("SK").begins_with("CONSENT#"),
        ScanIndexForward=True,
    )

    return response.get("Items", [])

# READ ONE

def get_consent(
    visit_id: str,
    timestamp: str,
):
    response = table.get_item(
        Key=consent_key(visit_id, timestamp)
    )

    return response.get("Item")

# UPDATE

def update_consent_notes(
    visit_id: str,
    timestamp: str,
    new_notes: str,
):
    updated_at = datetime.now(timezone.utc).isoformat()

   
    response = table.update_item(
        Key=consent_key(
            visit_id,
            timestamp,
        ),
        UpdateExpression="""
        SET
            notes=:notes,
            updatedAt=:updated
        """,
        ExpressionAttributeValues={
            ":notes": new_notes,
            ":updated": updated_at,
        },
        ReturnValues="ALL_NEW"
    )

    return response.get("Attributes")

# DELETE

def delete_consent(
    visit_id: str,
    timestamp: str,
):
    table.delete_item(
        Key=consent_key(
            visit_id,
            timestamp,
        )
    )

    return {
        "message": "Consent deleted successfully."
    }

create_consent = log_consent_event
