import json
import boto3

from app.summary_app import create_summary

bedrock = boto3.client("bedrock-runtime")

MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"  

SYSTEM_PROMPT = """You are a clinical intake assistant. Given a patient's
description of their symptoms, extract a structured summary. Respond with
ONLY a JSON object, no other text, in exactly this shape:

{
  "chiefComplaint": "short phrase, e.g. Chest tightness",
  "structuredSummary": "1-2 sentence clinical summary of what the patient described",
  "vitals": {"bp": null, "pulse": null, "temp": null, "spo2": null, "weight": null, "height": null},
  "allergies": [],
  "medications": [],
  "medHistory": [],
  "confidence": 0.0
}

Only include vitals/allergies/medications/medHistory if the patient actually
mentioned them — otherwise leave them null/empty. confidence is your own
estimate (0-1) of how clear and complete the patient's description was."""


def handler(event, context):
    visit_id = event["visitId"]
    transcript_text = event.get("transcriptText", "")
    transcript_ref = event.get("transcriptRef", f"visits/{visit_id}/chat-log.txt")

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": transcript_text}],
        }),
    )

    result = json.loads(response["body"].read())
    raw_text = result["content"][0]["text"]

    # Claude sometimes wraps JSON in markdown fences despite instructions — strip them.
    cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    parsed = json.loads(cleaned)

    summary = create_summary(
        visit_id=visit_id,
        transcript_ref=transcript_ref,
        structured_summary=parsed.get("structuredSummary", ""),
        confidence=parsed.get("confidence"),
    )
    return {"visitId": visit_id, "summary": summary}
