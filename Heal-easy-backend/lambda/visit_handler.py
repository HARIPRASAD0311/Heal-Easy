from app.visit_app import (
    create_visit,
    list_visits_for_patient,
    list_visits_for_doctor,
    list_active_visits_for_hospital,
    update_visit_status,
    assign_doctor_to_visit,
)

from utils.helpers import (
    success_response,
    error_response,
    get_body,
    get_path_param,
    get_query_param,
)


def handler(event, context):

    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:

        if method == "POST" and route == "/visits":
            return _create(event)

        if method == "GET" and "/patients/" in route:
            return _list_patient(event)

        if method == "GET" and "/hospitals/" in route:
            return _list_hospital(event)

        if method == "GET" and "/doctors/" in route:
            return _list_doctor(event)

        if method == "PATCH" and route.endswith("/assign-doctor"):
            return _assign_doctor(event)

        if method == "PATCH":
            return _update_status(event)

        return error_response(
            f"No route for {method} {route}",
            status_code=404,
        )

    except ValueError as e:
        return error_response(str(e), 400)

    except Exception as e:
        return error_response(
            f"Internal error: {str(e)}",
            500,
        )


# ---------------------------------------------------------

def _create(event):

    body = get_body(event)

    required = [
        "patientId",
        "visitId",
        "hospitalId",
        "departmentId",
    ]

    missing = [
        field
        for field in required
        if field not in body
    ]

    if missing:
        return error_response(
            f"Missing required fields: {missing}",
            400,
        )

    visit = create_visit(
        patient_id=body["patientId"],
        visit_id=body["visitId"],
        hospital_id=body["hospitalId"],
        department_id=body["departmentId"],
        status=body.get("status", "waiting"),
        doctor_id=body.get("doctorId"),
    )

    return success_response(
        visit,
        201,
    )


# ---------------------------------------------------------

def _list_patient(event):

    patient_id = get_path_param(event, "patientId")

    if not patient_id:
        return error_response(
            "patientId is required",
            400,
        )

    return success_response(
        list_visits_for_patient(patient_id)
    )


# ---------------------------------------------------------

def _list_hospital(event):

    hospital_id = get_path_param(event, "hospitalId")

    status = get_query_param(event, "status")

    if not hospital_id:
        return error_response(
            "hospitalId is required",
            400,
        )

    return success_response(
        list_active_visits_for_hospital(
            hospital_id,
            status,
        )
    )


# ---------------------------------------------------------

def _list_doctor(event):

    doctor_id = get_path_param(event, "doctorId")

    if not doctor_id:
        return error_response(
            "doctorId is required",
            400,
        )

    return success_response(
        list_visits_for_doctor(
            doctor_id
        )
    )


# ---------------------------------------------------------

def _update_status(event):

    patient_id = get_path_param(event, "patientId")
    visit_id = get_path_param(event, "visitId")

    body = get_body(event)

    status = body.get("status")

    if not status:
        return error_response(
            "status is required",
            400,
        )

    updated = update_visit_status(
        patient_id,
        visit_id,
        status,
    )

    return success_response(updated)


# ---------------------------------------------------------

def _assign_doctor(event):

    patient_id = get_path_param(event, "patientId")

    visit_id = get_path_param(event, "visitId")

    body = get_body(event)

    doctor_id = body.get("doctorId")

    if not doctor_id:
        return error_response(
            "doctorId is required",
            400,
        )

    updated = assign_doctor_to_visit(
        patient_id,
        visit_id,
        doctor_id,
    )

    return success_response(updated)