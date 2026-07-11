

from app.doctor_app import create_doctor, get_doctor, list_doctors_for_hospital, update_doctor_status, update_doctor
from utils.helpers import success_response, error_response, get_body, get_path_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "GET" and route.endswith("/doctors"):
            return _list(event)

        if method == "POST" and route.endswith("/doctors"):
            return _create(event)

        if method == "PATCH" and route.endswith("/status"):
            return _update_status(event)

        if method == "PATCH":
            return _update(event)

        if method == "GET":
            return _get(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _list(event):
    hospital_id = get_path_param(event, "hospitalId")
    if not hospital_id:
        return error_response("hospitalId is required in the path", status_code=400)
    return success_response(list_doctors_for_hospital(hospital_id))


def _get(event):
    hospital_id = get_path_param(event, "hospitalId")
    doctor_id = get_path_param(event, "doctorId")
    if not hospital_id or not doctor_id:
        return error_response("hospitalId and doctorId are required in the path", status_code=400)

    doctor = get_doctor(hospital_id, doctor_id)
    if not doctor:
        return error_response(f"No doctor found with id {doctor_id}", status_code=404)
    return success_response(doctor)


def _create(event):
    hospital_id = get_path_param(event, "hospitalId")
    body = get_body(event)
    required = ["doctorId", "name", "specialty"]
    missing = [f for f in required if f not in body]
    if not hospital_id or missing:
        return error_response(f"hospitalId (path) and {required} (body) are required", status_code=400)

    doctor = create_doctor(
        hospital_id=hospital_id,
        doctor_id=body["doctorId"],
        name=body["name"],
        specialty=body["specialty"],
        years_exp=body.get("yearsExp"),
        avatar_url=body.get("avatarUrl"),
        status=body.get("status", "available"),
    )
    return success_response(doctor, status_code=201)


def _update_status(event):
    hospital_id = get_path_param(event, "hospitalId")
    doctor_id = get_path_param(event, "doctorId")
    body = get_body(event)
    new_status = body.get("status")

    if not new_status:
        return error_response("Missing 'status' in request body", status_code=400)

    updated = update_doctor_status(hospital_id, doctor_id, new_status)
    return success_response(updated)


def _update(event):
    hospital_id = get_path_param(event, "hospitalId")
    doctor_id = get_path_param(event, "doctorId")
    body = get_body(event)
    allowed_fields = {"name", "specialty", "yearsExp", "avatarUrl"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        return error_response(f"No valid fields to update. Allowed: {allowed_fields}", status_code=400)

    updated = update_doctor(hospital_id, doctor_id, updates)
    return success_response(updated)

"""
Routes:
  GET   /hospitals/{hospitalId}/doctors                 -> list doctors
  GET   /hospitals/{hospitalId}/doctors/{doctorId}       -> get one doctor
  POST  /hospitals/{hospitalId}/doctors                 -> create a doctor
  PATCH /hospitals/{hospitalId}/doctors/{doctorId}/status -> flip available/busy
  PATCH /hospitals/{hospitalId}/doctors/{doctorId}       -> update other fields
"""