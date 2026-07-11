from app.queue_app import (
    create_queue_token,
    list_queue_for_department,
    update_queue_status,
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

        if method == "POST" and route == "/queue-tokens":
            return _create(event)

        if method == "GET" and "/queue" in route:
            return _list(event)

        if method == "PATCH" and route.startswith("/queue-tokens/"):
            return _update_status(event)

        return error_response(
            f"No route for {method} {route}",
            status_code=404,
        )

    except ValueError as e:
        return error_response(str(e), status_code=400)

    except Exception as e:
        return error_response(
            f"Internal error: {str(e)}",
            status_code=500,
        )


# -------------------------------------------------------
# POST /queue-tokens
# -------------------------------------------------------

def _create(event):

    body = get_body(event)

    required = [
        "hospitalId",
        "departmentId",
        "patientId",
        "visitId",
    ]

    missing = [
        field
        for field in required
        if field not in body
    ]

    if missing:
        return error_response(
            f"Missing required fields: {missing}",
            status_code=400,
        )

    token = create_queue_token(
        hospital_id=body["hospitalId"],
        department_id=body["departmentId"],
        patient_id=body["patientId"],
        visit_id=body["visitId"],
    )

    return success_response(
        token,
        status_code=201,
    )


# -------------------------------------------------------
# GET /hospitals/{hospitalId}/departments/{departmentId}/queue
# -------------------------------------------------------

def _list(event):

    hospital_id = get_path_param(event, "hospitalId")
    department_id = get_path_param(event, "departmentId")

    status = get_query_param(event, "status")

    if not hospital_id or not department_id:
        return error_response(
            "hospitalId and departmentId are required in the path",
            status_code=400,
        )

    tokens = list_queue_for_department(
        hospital_id=hospital_id,
        department_id=department_id,
        status=status,
    )

    return success_response(tokens)


# -------------------------------------------------------
# PATCH /queue-tokens/{hospitalId}/{departmentId}/{tokenId}
# -------------------------------------------------------

def _update_status(event):

    hospital_id = get_path_param(event, "hospitalId")
    department_id = get_path_param(event, "departmentId")
    token_id = get_path_param(event, "tokenId")

    body = get_body(event)

    new_status = body.get("status")

    if not new_status:
        return error_response(
            "Missing 'status' in request body",
            status_code=400,
        )

    updated = update_queue_status(
        hospital_id=hospital_id,
        department_id=department_id,
        token_id=token_id,
        new_status=new_status,
    )

    return success_response(updated)