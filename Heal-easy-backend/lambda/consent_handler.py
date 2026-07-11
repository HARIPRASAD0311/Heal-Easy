
from app.consent_app import log_consent_event, list_consent_events
from utils.helpers import success_response, error_response, get_body, get_path_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "GET" and route.endswith("/consent-events"):
            return _list(event)

        if method == "POST" and route.endswith("/consent-events"):
            return _create(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _list(event):
    visit_id = get_path_param(event, "visitId")
    if not visit_id:
        return error_response("visitId is required in the path", status_code=400)
    return success_response(list_consent_events(visit_id))


def _create(event):
    visit_id = get_path_param(event, "visitId")
    body = get_body(event)
    required = ["eventType", "actorId"]
    missing = [f for f in required if f not in body]
    if not visit_id or missing:
        return error_response(f"visitId (path) and {required} (body) are required", status_code=400)

    event_item = log_consent_event(
        visit_id=visit_id,
        event_type=body["eventType"],
        actor_id=body["actorId"],
        notes=body.get("notes"),
    )
    return success_response(event_item, status_code=201)