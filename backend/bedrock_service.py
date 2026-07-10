"""
bedrock_service.py — Amazon Bedrock integration for HealEasy.

Model  : Amazon Nova Lite  (amazon.nova-lite-v1:0)
API    : bedrock-runtime  converse()
Region : reads from AWS_REGION env var, falls back to ap-south-1

The analyze_symptoms() function is the only public entry point.
It always returns a dict so the Flask route never raises an
unhandled exception — errors come back as structured JSON.
"""

import json
import logging
import os
import re

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger("healeasy.bedrock")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
# Nova Lite model ID — this is the correct cross-region inference profile ID
# that works in ap-south-1 when the model is accessed via the global endpoint.
MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID",
    "amazon.nova-lite-v1:0"
)

# Use the region where Bedrock Nova Lite is available.
# Nova Lite is available in us-east-1; ap-south-1 uses cross-region inference.
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")

# ---------------------------------------------------------------------------
# Bedrock client (created once, reused across requests)
# ---------------------------------------------------------------------------
def _get_client():
    """Return a boto3 bedrock-runtime client."""
    return boto3.client(
        service_name="bedrock-runtime",
        region_name=BEDROCK_REGION,
    )


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------
def _build_prompt(symptoms: str) -> str:
    return f"""You are a medical triage assistant at a hospital.
A patient has described their symptoms as: "{symptoms}"

Analyze the symptoms and respond ONLY with a valid JSON object in exactly this format:
{{
  "summary": "Brief clinical summary of the patient's condition in 1-2 sentences.",
  "priority": "low | medium | high | critical",
  "department": "Most appropriate department (e.g. General Medicine, Cardiology, Neurology, Orthopedics, Pediatrics, ENT, Dermatology)",
  "advice": "Brief immediate advice for the patient in 1-2 sentences."
}}

Rules:
- priority must be exactly one of: low, medium, high, critical
- department must be a single department name
- Do NOT include any text outside the JSON object
- Do NOT use markdown code blocks"""


# ---------------------------------------------------------------------------
# Response parser
# ---------------------------------------------------------------------------
def _parse_response(text: str) -> dict:
    """
    Extract the JSON object from the model's text response.
    Nova Lite sometimes wraps JSON in markdown fences — strip them first.
    """
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?", "", text).strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract the first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # If all parsing fails, return a structured error so the API still responds
    logger.warning("Could not parse Bedrock response as JSON: %s", text[:300])
    return {
        "summary":    text[:400] if text else "Analysis unavailable.",
        "priority":   "medium",
        "department": "General Medicine",
        "advice":     "Please consult a doctor for a proper diagnosis.",
        "_raw":       text[:200],
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def analyze_symptoms(symptoms: str) -> dict:
    """
    Call Amazon Nova Lite via the Bedrock Converse API and return a
    structured triage analysis.

    Always returns a dict — never raises. On error the dict will contain
    an "error" key so the caller can decide how to handle it.

    Args:
        symptoms: Free-text symptom description from the patient.

    Returns:
        {
            "summary":    str,
            "priority":   str,   # low | medium | high | critical
            "department": str,
            "advice":     str,
        }
    """
    if not symptoms or not symptoms.strip():
        logger.warning("analyze_symptoms called with empty symptoms")
        return {
            "summary":    "No symptoms provided.",
            "priority":   "low",
            "department": "General Medicine",
            "advice":     "Please describe your symptoms to get a proper analysis.",
        }

    prompt = _build_prompt(symptoms.strip())
    logger.info("Calling Bedrock model=%s region=%s", MODEL_ID, BEDROCK_REGION)

    try:
        client = _get_client()

        # Converse API — correct for all Nova models
        response = client.converse(
            modelId=MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": 512,
                "temperature": 0.3,    # low temperature for consistent structured output
                "topP": 0.9,
            },
        )

        # Extract text from Converse response shape:
        # response["output"]["message"]["content"][0]["text"]
        output_text = (
            response
            .get("output", {})
            .get("message", {})
            .get("content", [{}])[0]
            .get("text", "")
        )

        logger.info("Bedrock response received, parsing…")
        result = _parse_response(output_text)

        # Ensure all required keys are present
        result.setdefault("summary",    "Analysis complete.")
        result.setdefault("priority",   "medium")
        result.setdefault("department", "General Medicine")
        result.setdefault("advice",     "Please follow up with your assigned doctor.")

        # Normalise priority to valid values
        valid_priorities = {"low", "medium", "high", "critical"}
        if result["priority"] not in valid_priorities:
            result["priority"] = "medium"

        logger.info(
            "Bedrock analysis done: priority=%s department=%s",
            result["priority"], result["department"]
        )
        return result

    except ClientError as e:
        code    = e.response["Error"]["Code"]
        message = e.response["Error"]["Message"]
        logger.error("Bedrock ClientError %s: %s", code, message)

        # Specific guidance for common errors
        if code == "AccessDeniedException":
            error_msg = (
                f"Bedrock access denied ({code}). "
                "Ensure the IAM user has bedrock:InvokeModel permission "
                "and that Nova Lite is enabled in the Bedrock console."
            )
        elif code == "ResourceNotFoundException":
            error_msg = (
                f"Model not found ({MODEL_ID}). "
                "Verify the model ID and that cross-region inference is enabled."
            )
        elif code == "ThrottlingException":
            error_msg = "Bedrock request throttled. Please retry in a moment."
        elif code == "ValidationException":
            error_msg = f"Bedrock validation error: {message}"
        else:
            error_msg = f"Bedrock error ({code}): {message}"

        return {
            "summary":    "AI analysis temporarily unavailable.",
            "priority":   "medium",
            "department": "General Medicine",
            "advice":     "Please consult a doctor directly.",
            "error":      error_msg,
        }

    except BotoCoreError as e:
        logger.error("Bedrock BotoCoreError: %s", str(e))
        return {
            "summary":    "AI analysis temporarily unavailable.",
            "priority":   "medium",
            "department": "General Medicine",
            "advice":     "Please consult a doctor directly.",
            "error":      str(e),
        }

    except Exception as e:
        logger.exception("Unexpected error in analyze_symptoms")
        return {
            "summary":    "AI analysis temporarily unavailable.",
            "priority":   "medium",
            "department": "General Medicine",
            "advice":     "Please consult a doctor directly.",
            "error":      f"Unexpected error: {str(e)}",
        }
