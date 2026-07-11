from app.patient_app import (
    get_or_create_patient,
    update_patient,
    add_saved_hospital,
    remove_saved_hospital,
)

from utils.helpers import (
    success_response,
    error_response,
    get_body,
    get_path_param,
    get_claims,
)


def handler(event, context):

    method = event["requestContext"]["http"]["method"]

    route = event["requestContext"]["http"]["path"]

    try:

        if method == "GET":
            return _get(event)

        if method == "PATCH":
            return _update(event)

        if method == "POST" and "/saved-hospitals" in route:
            return _save_hospital(event)

        if method == "DELETE" and "/saved-hospitals" in route:
            return _remove_saved_hospital(event)

        return error_response(
            f"No route for {method} {route}",
            404,
        )

    except ValueError as e:

        return error_response(str(e), 400)

    except Exception as e:

        return error_response(
            f"Internal error: {str(e)}",
            500,
        )


# ---------------------------------------------------

def _get(event):

    patient_id = get_path_param(event, "patientId")

    if not patient_id:

        return error_response(
            "patientId is required",
            400,
        )

    claims = get_claims(event)

    phone = claims.get("phone_number", "")

    patient, is_new = get_or_create_patient(
        patient_id,
        phone,
    )

    patient["isNewPatient"] = is_new

    return success_response(patient)


# ---------------------------------------------------

def _update(event):

    patient_id = get_path_param(event, "patientId")

    if not patient_id:

        return error_response(
            "patientId is required",
            400,
        )

    body = get_body(event)

    allowed = {
        "name",
        "preferredLanguage",
        "age",
        "gender",
        "bloodGroup",
    }

    updates = {
        k: v
        for k, v in body.items()
        if k in allowed
    }

    if not updates:

        return error_response(
            "No valid fields supplied",
            400,
        )

    patient = update_patient(
        patient_id,
        updates,
    )

    return success_response(patient)


# ---------------------------------------------------

def _save_hospital(event):

    patient_id = get_path_param(event, "patientId")

    body = get_body(event)

    hospital_id = body.get("hospitalId")

    if not hospital_id:

        return error_response(
            "hospitalId is required",
            400,
        )

    patient = add_saved_hospital(
        patient_id,
        hospital_id,
    )

    return success_response(patient)


# ---------------------------------------------------

def _remove_saved_hospital(event):

    patient_id = get_path_param(event, "patientId")

    hospital_id = get_path_param(
        event,
        "hospitalId",
    )

    if not hospital_id:

        return error_response(
            "hospitalId is required",
            400,
        )

    patient = remove_saved_hospital(
        patient_id,
        hospital_id,
    )

    return success_response(patient)