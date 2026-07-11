
import json
import boto3

from app.soap_app import create_soap_note

bedrock = boto3.client("bedrock-runtime")

MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"

SYSTEM_PROMPT = """You are a clinical scribe assistant. Given a transcript
of a doctor-patient consultation, draft a SOAP note. Respond with ONLY a
JSON object, no other text, in exactly this shape:

{
  "subjective": "patient's reported symptoms and history, in their own words/context",
  "objective": "observable/measurable findings mentioned in the transcript (vitals, exam findings)",
  "assessment": "the doctor's likely diagnosis or differential, based on what was discussed",
  "plan": "next steps mentioned — tests ordered, medications, follow-up"
}

Base this ONLY on what's actually in the transcript. If the doctor didn't
state an assessment or plan explicitly, write your best clinical inference
based on the subjective/objective findings, but keep it conservative —
this draft will be reviewed and edited by the doctor before it's final."""


def handler(event, context):
    visit_id = event["visitId"]
    doctor_id = event["doctorId"]
    transcript_text = event.get("transcriptText", "")

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1200,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": transcript_text}],
        }),
    )

    result = json.loads(response["body"].read())
    raw_text = result["content"][0]["text"]

    cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    parsed = json.loads(cleaned)

    note = create_soap_note(
        visit_id=visit_id,
        subjective=parsed.get("subjective", ""),
        objective=parsed.get("objective", ""),
        assessment=parsed.get("assessment", ""),
        plan=parsed.get("plan", ""),
        doctor_id=doctor_id,
    )

    return {"visitId": visit_id, "soapNote": note}
