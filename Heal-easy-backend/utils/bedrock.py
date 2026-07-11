import json
import boto3
from config.settings import REGION

client = boto3.client(
    "bedrock-runtime",
    region_name=REGION
)

MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"


def generate_soap_from_symptoms(symptoms: str):

    prompt = f"""
You are an experienced physician.

Generate a professional SOAP note.

Symptoms:
{symptoms}

Return ONLY JSON.

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

    response = client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read())

    return json.loads(result["content"][0]["text"])