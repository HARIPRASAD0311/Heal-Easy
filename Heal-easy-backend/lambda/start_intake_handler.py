import json
import uuid
import boto3

from app.visit_app import create_visit
from utils.helpers import success_response, error_response, get_body

sfn = boto3.client("stepfunctions")

INTAKE_STATE_MACHINE_ARN = "arn:aws:states:ap-south-1:372666940349:stateMachine:HealEasyIntakeWorkflow"


def handler(event, context):
    try:
        body = get_body(event)
        required = ["patientId", "hospitalId", "deptId", "transcriptText"]
        missing = [f for f in required if f not in body]
        if missing:
            return error_response(f"Missing required fields: {missing}", status_code=400)

        visit_id = str(uuid.uuid4())[:8]

        create_visit(
            patient_id=body["patientId"],
            visit_id=visit_id,
            hospital_id=body["hospitalId"],
            department_id=body["deptId"],
            status="waiting",
        )

        execution = sfn.start_execution(
            stateMachineArn=INTAKE_STATE_MACHINE_ARN,
            input=json.dumps({
                "visitId": visit_id,
                "transcriptText": body["transcriptText"],
                "transcriptRef": f"{body['hospitalId']}/{body['patientId']}/{visit_id}/chat-log.txt",
            }),
        )

        return success_response({
            "visitId": visit_id,
            "executionArn": execution["executionArn"],
        }, status_code=201)

    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)