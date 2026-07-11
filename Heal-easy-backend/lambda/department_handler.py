from app.department_app import (
    create_department,
    get_department,
    list_dept_for_doctors,
    update_department,
    delete_department,
)

from utils.helpers import (
    success_response,
    error_response,
    get_body,
    get_path_param,
)


def handler(event, context):

    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:

        if method == "GET" and route.endswith("/departments"):
            return _list(event)

        if method == "POST" and route.endswith("/departments"):
            return _create(event)

        if method == "GET":
            return _get(event)

        if method == "PATCH":
            return _update(event)

        if method == "DELETE":
            return _delete(event)

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
# GET /hospitals/{hospitalId}/departments
# -------------------------------------------------------

def _list(event):

    hospital_id = get_path_param(event, "hospitalId")

    if not hospital_id:
        return error_response(
            "hospitalId is required",
            status_code=400,
        )

    departments = list_dept_for_doctors(hospital_id)

    return success_response(departments)


# -------------------------------------------------------
# GET /hospitals/{hospitalId}/departments/{departmentId}
# -------------------------------------------------------

def _get(event):

    hospital_id = get_path_param(event, "hospitalId")
    department_id = get_path_param(event, "departmentId")

    if not hospital_id or not department_id:
        return error_response(
            "hospitalId and departmentId are required",
            status_code=400,
        )

    department = get_department(
        hospital_id,
        department_id,
    )

    if not department:
        return error_response(
            "Department not found",
            status_code=404,
        )

    return success_response(department)


# -------------------------------------------------------
# POST /hospitals/{hospitalId}/departments
# -------------------------------------------------------

def _create(event):

    hospital_id = get_path_param(event, "hospitalId")
    body = get_body(event)

    department_id = body.get("departmentId")
    label = body.get("label")

    if not hospital_id:
        return error_response(
            "hospitalId is required",
            status_code=400,
        )

    if not department_id:
        return error_response(
            "departmentId is required",
            status_code=400,
        )

    if not label:
        return error_response(
            "label is required",
            status_code=400,
        )

    department = create_department(
        hospital_id=hospital_id,
        department_id=department_id,
        label=label,
        floor=body.get("floor"),
        room=body.get("room"),
    )

    return success_response(
        department,
        status_code=201,
    )


# -------------------------------------------------------
# PATCH /hospitals/{hospitalId}/departments/{departmentId}
# -------------------------------------------------------

def _update(event):

    hospital_id = get_path_param(event, "hospitalId")
    department_id = get_path_param(event, "departmentId")

    body = get_body(event)

    allowed_fields = {
        "label",
        "floor",
        "room",
    }

    updates = {
        k: v
        for k, v in body.items()
        if k in allowed_fields
    }

    if not hospital_id or not department_id:
        return error_response(
            "hospitalId and departmentId are required",
            status_code=400,
        )

    if not updates:
        return error_response(
            "No valid fields supplied",
            status_code=400,
        )

    updated = update_department(
        hospital_id,
        department_id,
        updates,
    )

    return success_response(updated)


# -------------------------------------------------------
# DELETE /hospitals/{hospitalId}/departments/{departmentId}
# -------------------------------------------------------

def _delete(event):

    hospital_id = get_path_param(event, "hospitalId")
    department_id = get_path_param(event, "departmentId")

    if not hospital_id or not department_id:
        return error_response(
            "hospitalId and departmentId are required",
            status_code=400,
        )

    delete_department(
        hospital_id,
        department_id,
    )

    return success_response(
        {
            "deleted": True,
            "departmentId": department_id,
        }
    )