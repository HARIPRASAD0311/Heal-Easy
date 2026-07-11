import json
import boto3

from utils.helpers import success_response, error_response, get_body

sfn = boto3.client("stepfunctions")
CONSULT_STATE_MACHINE_ARN = "arn:aws:states:ap-south-1:372666940349:stateMachine:HealEasyConsultWorkflow"


def handler(event, context):
    try:
        body = get_body(event)
        required = ["visitId", "doctorId", "transcriptText"]
        missing = [f for f in required if f not in body]
        if missing:
            return error_response(f"Missing required fields: {missing}", status_code=400)

        execution = sfn.start_execution(
            stateMachineArn=CONSULT_STATE_MACHINE_ARN,
            input=json.dumps({
                "visitId": body["visitId"],
                "doctorId": body["doctorId"],
                "transcriptText": body["transcriptText"],
            }),
        )

        return success_response({
            "visitId": body["visitId"],
            "executionArn": execution["executionArn"],
        }, status_code=201)

    except Exception as e:
        return error_response(f"Internal error: {str(e)}", status_code=500)
