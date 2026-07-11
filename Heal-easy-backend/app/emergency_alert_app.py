
import uuid
from boto3.dynamodb.conditions import Key
from database.dynamodb import table
from models.emergency_alert import build_emergency_alert_item


def create_alert(
    doctor_id: str,
    alert_id: str,
    patient_id: str,
    visit_id: str,
    alert_type: str,
    severity: str,
    message: str,
    suggestions: list = None,
    acknowledged: bool = False,
    triggered_at: str = None,
):
   
    alert_id = str(uuid.uuid4())[:8]
    item = build_emergency_alert_item(
        doctor_id,
        alert_id,
        patient_id,
        visit_id, 
        alert_type, 
        severity, 
        message, 
        suggestions,
        acknowledged,
        triggered_at
    )
    table.put_item(Item=item)
    return item


def list_alerts_for_doctor(doctor_id: str, unacknowledged_only: bool = False):
    
    #Lists a doctor's emergency alerts, most recent first.
    
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"DOCTOR#{doctor_id}")
        & Key("SK").begins_with("ALERT#"),
        ScanIndexForward=False,  # newest first
    )
    items = response.get("Items", [])

    if unacknowledged_only:
        items = [i for i in items if not i.get("acknowledged", False)]

    return items


def _find_alert(doctor_id: str, alert_id: str):
    
    all_alerts = list_alerts_for_doctor(doctor_id)
    for alert in all_alerts:
        if alert.get("alertId") == alert_id:
            return alert
    return None


def acknowledge_alert(doctor_id: str, alert_id: str):
    #Marks an alert as acknowledged — doesn't remove it, just flags it as seen/actioned.
    alert = _find_alert(doctor_id, alert_id)
    if not alert:
        raise ValueError(f"No alert {alert_id} found for doctor {doctor_id}")

    table.update_item(
        Key={"PK": alert["PK"], "SK": alert["SK"]},
        UpdateExpression="SET acknowledged = :true",
        ExpressionAttributeValues={":true": True},
    )
    return _find_alert(doctor_id, alert_id)


def dismiss_alert(doctor_id: str, alert_id: str):
    
    #Deletes an alert entirely 
    alert = _find_alert(doctor_id, alert_id)
    if not alert:
        return  # already gone, nothing to do
    table.delete_item(Key={"PK": alert["PK"], "SK": alert["SK"]})