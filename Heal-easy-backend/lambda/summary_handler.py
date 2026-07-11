import json
import boto3
from app.summary_app import create_summary, get_summary, approve_summary, update_summary_text
from utils.helpers import success_response, error_response, get_body, get_path_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "POST" and route.endswith("/approve"):
            return _approve(event)

        if method == "POST" and route.endswith("/summary"):
            return _create(event)

        if method == "PATCH" and route.endswith("/summary"):
            return _update(event)

        if method == "GET" and route.endswith("/summary"):
            return _get(event)

        return error_response(f"No route for {method} {route}", status_code=404)

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)


def _get(event):
    visit_id = get_path_param(event, "visitId")
    if not visit_id:
        return error_response("visitId is required in the path", status_code=400)

    summary = get_summary(visit_id)
    if not summary:
        return error_response(f"No summary found for visit {visit_id}", status_code=404)
    return success_response(summary)


def _create(event):
    visit_id = get_path_param(event, "visitId")
    body = get_body(event)
    required = ["transcriptRef", "structuredSummary"]
    missing = [f for f in required if f not in body]
    if not visit_id or missing:
        return error_response(f"visitId (path) and {required} (body) are required", status_code=400)

    summary = create_summary(
        visit_id=visit_id,
        transcript_ref=body["transcriptRef"],
        structured_summary=body["structuredSummary"],
        confidence=body.get("confidence"),
    )
    return success_response(summary, status_code=201)


def _approve(event):
    visit_id = get_path_param(event, "visitId")
    if not visit_id:
        return error_response("visitId is required in the path", status_code=400)

    approved = approve_summary(visit_id)

    # Release the Step Functions consent gate, if this visit's intake
    # actually went through the state machine (older/manually-created
    # visits may not have a stored token, so this is optional).
    task_token = approved.get("consentTaskToken") if approved else None
    if task_token:
        sfn = boto3.client("stepfunctions")
        sfn.send_task_success(
            taskToken=task_token,
            output=json.dumps({"visitId": visit_id, "consentApproved": True}),
        )

    return success_response(approved)


def _update(event):
    visit_id = get_path_param(event, "visitId")
    body = get_body(event)
    structured_summary = body.get("structuredSummary")

    if not structured_summary:
        return error_response("Missing 'structuredSummary' in request body", status_code=400)

    updated = update_summary_text(visit_id, structured_summary)
    return success_response(updated)