from app.hospital_app import list_hospitals, get_hospital, create_hospital
from utils.helpers import success_response, error_response, get_body, get_path_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "GET" and route == "/hospitals":
            return _list_hospitals()

        if method == "POST" and route == "/hospitals":
            return _create_hospital(event)

        if method == "GET" and route.startswith("/hospitals/"):
            return _get_hospital(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _list_hospitals():
    return success_response(list_hospitals())


def _get_hospital(event):
    hospital_id = get_path_param(event, "hospitalId")
    if not hospital_id:
        return error_response("hospitalId is required in the path", status_code=400)

    hospital = get_hospital(hospital_id)
    if not hospital:
        return error_response(f"No hospital found with id {hospital_id}", status_code=404)
    return success_response(hospital)


def _create_hospital(event):
    body = get_body(event)
    required = ["hospitalId", "name", "image", "alt", "badge", "metaDashboard", "metaSearch", "rating", "chips", "chipsFull"]
    missing = [f for f in required if f not in body]
    if missing:
        return error_response(f"Missing required fields: {missing}", status_code=400)

    hospital = create_hospital(
        hospital_id=body["hospitalId"],
        name=body["name"],
        image=body["image"],
        alt=body["alt"],
        badge=body["badge"],
        meta_dashboard=body["metaDashboard"],
        meta_search=body["metaSearch"],
        rating=body["rating"],
        chips=body["chips"],
        chips_full=body["chipsFull"],
        full_name=body.get("fullName"),
    )
    return success_response(hospital, status_code=201)