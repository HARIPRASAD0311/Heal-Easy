from app.notification_app import (
    create_notification, list_notifications_for_doctor,
    mark_notification_read, mark_all_notifications_read, delete_notification,
)
from utils.helpers import success_response, error_response, get_body, get_path_param, get_query_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "GET" and route.endswith("/notifications"):
            return _list(event)

        if method == "POST" and route.endswith("/mark-all-read"):
            return _mark_all_read(event)

        if method == "POST" and route.endswith("/read"):
            return _mark_read(event)

        if method == "POST" and route.endswith("/notifications"):
            return _create(event)

        if method == "DELETE":
            return _delete(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _list(event):
    doctor_id = get_path_param(event, "doctorId")
    if not doctor_id:
        return error_response("doctorId is required in the path", status_code=400)

    unread_only = get_query_param(event, "unread") == "true"
    return success_response(list_notifications_for_doctor(doctor_id, unread_only=unread_only))


def _create(event):
    doctor_id = get_path_param(event, "doctorId")
    body = get_body(event)
    required = ["notifType", "title", "message"]
    missing = [f for f in required if f not in body]
    if not doctor_id or missing:
        return error_response(f"doctorId (path) and {required} (body) are required", status_code=400)

    notif = create_notification(
        doctor_id=doctor_id,
        notif_type=body["notifType"],
        title=body["title"],
        message=body["message"],
    )
    return success_response(notif, status_code=201)


def _mark_read(event):
    doctor_id = get_path_param(event, "doctorId")
    notification_id = get_path_param(event, "notificationId")
    if not doctor_id or not notification_id:
        return error_response("doctorId and notificationId are required in the path", status_code=400)

    updated = mark_notification_read(doctor_id, notification_id)
    return success_response(updated)


def _mark_all_read(event):
    doctor_id = get_path_param(event, "doctorId")
    if not doctor_id:
        return error_response("doctorId is required in the path", status_code=400)

    updated = mark_all_notifications_read(doctor_id)
    return success_response(updated)


def _delete(event):
    doctor_id = get_path_param(event, "doctorId")
    notification_id = get_path_param(event, "notificationId")
    if not doctor_id or not notification_id:
        return error_response("doctorId and notificationId are required in the path", status_code=400)

    delete_notification(doctor_id, notification_id)
    return success_response({"deleted": True, "notificationId": notification_id})