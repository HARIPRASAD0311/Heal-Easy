from app.emergency_alert_app import create_alert, list_alerts_for_doctor, acknowledge_alert, dismiss_alert
from utils.helpers import success_response, error_response, get_body, get_path_param, get_query_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "GET" and route.endswith("/alerts"):
            return _list(event)

        if method == "POST" and route.endswith("/acknowledge"):
            return _acknowledge(event)

        if method == "POST" and route.endswith("/alerts"):
            return _create(event)

        if method == "DELETE":
            return _dismiss(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _list(event):
    doctor_id = get_path_param(event, "doctorId")
    if not doctor_id:
        return error_response("doctorId is required in the path", status_code=400)

    unacknowledged_only = get_query_param(event, "unacknowledged") == "true"
    return success_response(list_alerts_for_doctor(doctor_id, unacknowledged_only=unacknowledged_only))


def _create(event):
    doctor_id = get_path_param(event, "doctorId")
    body = get_body(event)
    required = ["patientId", "visitId", "alertType", "severity", "message"]
    missing = [f for f in required if f not in body]
    if not doctor_id or missing:
        return error_response(f"doctorId (path) and {required} (body) are required", status_code=400)

    alert = create_alert(
        doctor_id=doctor_id,
        patient_id=body["patientId"],
        visit_id=body["visitId"],
        alert_type=body["alertType"],
        severity=body["severity"],
        message=body["message"],
        suggestions=body.get("suggestions"),
    )
    return success_response(alert, status_code=201)


def _acknowledge(event):
    doctor_id = get_path_param(event, "doctorId")
    alert_id = get_path_param(event, "alertId")
    if not doctor_id or not alert_id:
        return error_response("doctorId and alertId are required in the path", status_code=400)

    updated = acknowledge_alert(doctor_id, alert_id)
    return success_response(updated)


def _dismiss(event):
    doctor_id = get_path_param(event, "doctorId")
    alert_id = get_path_param(event, "alertId")
    if not doctor_id or not alert_id:
        return error_response("doctorId and alertId are required in the path", status_code=400)

    dismiss_alert(doctor_id, alert_id)
    return success_response({"deleted": True, "alertId": alert_id})