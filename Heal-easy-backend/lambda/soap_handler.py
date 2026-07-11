import json
import boto3
from app.soap_app import create_soap_note, get_soap_note, approve_soap_note, update_soap_note
from utils.helpers import success_response, error_response, get_body, get_path_param


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    route = event["requestContext"]["http"]["path"]

    try:
        if method == "POST" and route.endswith("/approve"):
            return _approve(event)

        if method == "POST" and route.endswith("/reject"):
            return _reject_not_implemented(event)

        if method == "POST" and route.endswith("/soap"):
            return _create(event)

        if method == "PATCH" and route.endswith("/soap"):
            return _update(event)

        if method == "GET" and route.endswith("/soap"):
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

    note = get_soap_note(visit_id)
    if not note:
        return error_response(f"No SOAP note found for visit {visit_id}", status_code=404)
    return success_response(note)


def _create(event):
    visit_id = get_path_param(event, "visitId")
    body = get_body(event)
    required = ["subjective", "objective", "assessment", "plan", "doctorId"]
    missing = [f for f in required if f not in body]
    if not visit_id or missing:
        return error_response(f"visitId (path) and {required} (body) are required", status_code=400)

    note = create_soap_note(
        visit_id=visit_id,
        subjective=body["subjective"],
        objective=body["objective"],
        assessment=body["assessment"],
        plan=body["plan"],
        doctor_id=body["doctorId"],
    )
    return success_response(note, status_code=201)


def _approve(event):
    visit_id = get_path_param(event, "visitId")
    if not visit_id:
        return error_response("visitId is required in the path", status_code=400)

    approved = approve_soap_note(visit_id)

    # Release the Step Functions doctor-approval gate, if this visit's
    # consult actually went through the state machine.
    task_token = approved.get("approvalTaskToken") if approved else None
    if task_token:
        sfn = boto3.client("stepfunctions")
        sfn.send_task_success(
            taskToken=task_token,
            output=json.dumps({"visitId": visit_id, "soapApproved": True}),
        )

    return success_response(approved)


def _update(event):
    visit_id = get_path_param(event, "visitId")
    body = get_body(event)
    allowed_fields = {"subjective", "objective", "assessment", "plan"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        return error_response(f"No valid fields to update. Allowed: {allowed_fields}", status_code=400)

    updated = update_soap_note(visit_id, updates)
    return success_response(updated)


def _reject_not_implemented(event):
    return error_response(
        "Reject is not implemented yet — app/soap.py needs a status field "
        "(pending/approved/rejected) added before this route works.",
        status_code=501,
    )