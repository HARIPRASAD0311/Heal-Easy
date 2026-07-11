import uuid
from boto3.dynamodb.conditions import Key
from database.dynamodb import table
from models.notification import build_notification_item


def create_notification(doctor_id: str, notif_type: str, title: str, message: str):

    notification_id = str(uuid.uuid4())[:8]
    item = build_notification_item(doctor_id,notification_id, notif_type, title, message)
    table.put_item(Item=item)
    return item


def list_notifications_for_doctor(doctor_id: str, unread_only: bool = False):
    
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"DOCTOR#{doctor_id}")
        & Key("SK").begins_with("NOTIF#"),
        ScanIndexForward=False,  # newest first
    )
    items = response.get("Items", [])

    if unread_only:
        items = [i for i in items if not i.get("read", False)]

    return items


def _find_notification(doctor_id: str, notification_id: str):
    
    all_notifs = list_notifications_for_doctor(doctor_id)
    for notif in all_notifs:
        if notif.get("notificationId") == notification_id:
            return notif
    return None


def mark_notification_read(doctor_id: str, notification_id: str):
    
    notif = _find_notification(doctor_id, notification_id)
    if not notif:
        raise ValueError(f"No notification {notification_id} found for doctor {doctor_id}")

    table.update_item(
        Key={"PK": notif["PK"], "SK": notif["SK"]},
        UpdateExpression="SET #r = :true",
        ExpressionAttributeNames={"#r": "read"},
        ExpressionAttributeValues={":true": True},
    )
    return _find_notification(doctor_id, notification_id)


def mark_all_notifications_read(doctor_id: str):
    
    unread = list_notifications_for_doctor(doctor_id, unread_only=True)
    for notif in unread:
        table.update_item(
            Key={"PK": notif["PK"], "SK": notif["SK"]},
            UpdateExpression="SET #r = :true",
            ExpressionAttributeNames={"#r": "read"},
            ExpressionAttributeValues={":true": True},
        )
    return list_notifications_for_doctor(doctor_id)


def delete_notification(doctor_id: str, notification_id: str):
    
    notif = _find_notification(doctor_id, notification_id)
    if not notif:
        return  # already gone, nothing to do
    table.delete_item(Key={"PK": notif["PK"], "SK": notif["SK"]})