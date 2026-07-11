from datetime import datetime, timezone
import json

from database.dynamodb import table
from models.soap import soap_key, build_soap_item

import boto3
from config.settings import REGION
from utils.bedrock import generate_soap_from_symptoms

# ----------------------------------------------------
# Bedrock Client
# ----------------------------------------------------

bedrock = boto3.client(
    "bedrock-runtime",
    region_name=REGION,
)

MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"


def generate_soap_from_symptoms(symptoms: str):

    prompt = f"""
You are an experienced medical doctor.

Generate a professional SOAP note from the symptoms.

Patient Symptoms:
{symptoms}

Return ONLY valid JSON.

{{
    "subjective":"",
    "objective":"",
    "assessment":"",
    "plan":""
}}
"""

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 800,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    }

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )

    result = json.loads(
        response["body"].read()
    )

    ai_response = result["content"][0]["text"]

    return json.loads(ai_response)


# ----------------------------------------------------
# CREATE
# ----------------------------------------------------

def create_soap_note(
    visit_id: str,
    doctor_id: str,
    symptoms: str = None,
    subjective: str = None,
    objective: str = None,
    assessment: str = None,
    plan: str = None,
):
    """
    Create a SOAP note.

    If symptoms are supplied,
    Bedrock generates the SOAP note.

    Otherwise the supplied SOAP fields are stored.
    """

    if symptoms:

        soap = generate_soap_from_symptoms(symptoms)

        subjective = soap["subjective"]
        objective = soap["objective"]
        assessment = soap["assessment"]
        plan = soap["plan"]

    item = build_soap_item(
        visit_id=visit_id,
        subjective=subjective,
        objective=objective,
        assessment=assessment,
        plan=plan,
        doctor_id=doctor_id,
        approved=False,
    )

    table.put_item(Item=item)

    return item


# ----------------------------------------------------
# READ
# ----------------------------------------------------

def get_soap_note(
    visit_id: str,
):

    response = table.get_item(
        Key=soap_key(
            visit_id
        )
    )

    return response.get("Item")


# ----------------------------------------------------
# APPROVE
# ----------------------------------------------------

def approve_soap_note(
    visit_id: str,
):

    approved_at = datetime.now(
        timezone.utc
    ).isoformat()

    table.update_item(

        Key=soap_key(
            visit_id
        ),

        UpdateExpression="""
        SET
        approved = :approved,
        approvedAt = :approvedAt
        """,

        ExpressionAttributeValues={
            ":approved": True,
            ":approvedAt": approved_at,
        },
    )

    return get_soap_note(
        visit_id
    )


# ----------------------------------------------------
# UPDATE
# ----------------------------------------------------

def update_soap_note(
    visit_id: str,
    updates: dict,
):

    if not updates:
        return get_soap_note(
            visit_id
        )

    update_parts = []

    expression_names = {}

    expression_values = {}

    for index, (field, value) in enumerate(
        updates.items()
    ):

        field_name = f"#f{index}"

        value_name = f":v{index}"

        update_parts.append(
            f"{field_name} = {value_name}"
        )

        expression_names[field_name] = field

        expression_values[value_name] = value

    table.update_item(

        Key=soap_key(
            visit_id
        ),

        UpdateExpression="SET " + ", ".join(update_parts),

        ExpressionAttributeNames=expression_names,

        ExpressionAttributeValues=expression_values,
    )

    return get_soap_note(
        visit_id
    )


# ----------------------------------------------------
# DELETE
# ----------------------------------------------------

def delete_soap_note(
    visit_id: str,
):

    table.delete_item(
        Key=soap_key(
            visit_id
        )
    )

    return {
        "message": f"SOAP note for visit '{visit_id}' deleted successfully."
    }


# ----------------------------------------------------
# STEP FUNCTIONS
# ----------------------------------------------------

def store_approval_task_token(
    visit_id: str,
    task_token: str,
):

    table.update_item(

        Key=soap_key(
            visit_id
        ),

        UpdateExpression="""
        SET approvalTaskToken = :t
        """,

        ExpressionAttributeValues={
            ":t": task_token
        },
    )

    return get_soap_note(
        visit_id
    )