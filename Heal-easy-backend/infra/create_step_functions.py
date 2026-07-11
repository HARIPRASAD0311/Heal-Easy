import json
import boto3
from config.settings import REGION

ACCOUNT_ID = "372666940349"  

GENERATE_SUMMARY_LAMBDA_ARN = "arn:aws:lambda:ap-south-1:372666940349:function:generate_summary_handler"  
STORE_CONSENT_TOKEN_LAMBDA_ARN = "arn:aws:lambda:ap-south-1:372666940349:function:store_consent_token_handler" 

GENERATE_SOAP_LAMBDA_ARN = "arn:aws:lambda:ap-south-1:372666940349:function:generate_soap_handler"
STORE_APPROVAL_TOKEN_LAMBDA_ARN = "arn:aws:lambda:ap-south-1:372666940349:function:store_approval_token_handler"  

STATE_MACHINE_EXECUTION_ROLE_ARN = "arn:aws:iam::372666940349:role/HealEasyStepFunctionsRole" 

sfn = boto3.client("stepfunctions", region_name=REGION)


def build_intake_definition():
    return {
        "Comment": "Patient intake: generate summary, then wait for patient consent",
        "StartAt": "GenerateSummary",
        "States": {
            "GenerateSummary": {
                "Type": "Task",
                "Resource": GENERATE_SUMMARY_LAMBDA_ARN,
                "Next": "WaitForPatientConsent",
            },
            "WaitForPatientConsent": {
                "Type": "Task",
                "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
                "Parameters": {
                    "FunctionName": STORE_CONSENT_TOKEN_LAMBDA_ARN,
                    "Payload": {
                        "visitId.$": "$.visitId",
                        "taskToken.$": "$$.Task.Token",
                    },
                },
                "Next": "IntakeComplete",
            },
            "IntakeComplete": {
                "Type": "Succeed",
            },
        },
    }


def build_consult_definition():
    return {
        "Comment": "Doctor consult: generate SOAP note, then wait for doctor approval",
        "StartAt": "GenerateSOAPNote",
        "States": {
            "GenerateSOAPNote": {
                "Type": "Task",
                "Resource": GENERATE_SOAP_LAMBDA_ARN,
                "Next": "WaitForDoctorApproval",
            },
            "WaitForDoctorApproval": {
                "Type": "Task",
                "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
                "Parameters": {
                    "FunctionName": STORE_APPROVAL_TOKEN_LAMBDA_ARN,
                    "Payload": {
                        "visitId.$": "$.visitId",
                        "taskToken.$": "$$.Task.Token",
                    },
                },
                "Next": "ConsultComplete",
            },
            "ConsultComplete": {
                "Type": "Succeed",
            },
        },
    }


def create_state_machine(name, definition):
    try:
        response = sfn.create_state_machine(
            name=name,
            definition=json.dumps(definition),
            roleArn=STATE_MACHINE_EXECUTION_ROLE_ARN,
            type="STANDARD",
        )
        print(f"State machine created: {response['stateMachineArn']}")
        return response["stateMachineArn"]
    except sfn.exceptions.StateMachineAlreadyExists:
        # Look it up instead of failing on re-run
        existing = sfn.list_state_machines()["stateMachines"]
        match = next(sm for sm in existing if sm["name"] == name)
        print(f"State machine '{name}' already exists: {match['stateMachineArn']}")
        return match["stateMachineArn"]


def setup():
    intake_arn = create_state_machine("HealEasyIntakeWorkflow", build_intake_definition())
    consult_arn = create_state_machine("HealEasyConsultWorkflow", build_consult_definition())

    print("\n" + "=" * 50)
    print("Step Functions setup complete. Save these for your README:")
    print(f"  INTAKE_STATE_MACHINE_ARN = {intake_arn}")
    print(f"  CONSULT_STATE_MACHINE_ARN = {consult_arn}")
    print("=" * 50)
    print("\nLambda needs to START these executions with input")
    print('like {"visitId": "visit-001", ...} — that kicks off intake/consult.')


if __name__ == "__main__":
    setup()