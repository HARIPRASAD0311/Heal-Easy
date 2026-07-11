
from datetime import datetime, timezone
 
 
def summary_key(visit_id: str) -> dict:
    """Builds the PK/SK for a visit's symptom summary item."""
    return {
        "PK": f"VISIT#{visit_id}",
        "SK": "SUMMARY",
    }
 
 
def build_summary_item(
    visit_id: str,
    transcript_ref: str,
    structured_summary: str,
    confidence: float = None,
    patient_approved: bool = False,
    created_at: str = None,
) -> dict:

    from decimal import Decimal
 
    item = {
        **summary_key(visit_id),
        "transcriptRef": transcript_ref,
        "structuredSummary": structured_summary,
        "patientApproved": patient_approved,
        "createdAt": created_at or datetime.now(timezone.utc).isoformat(),
    }
    if confidence is not None:
        item["confidence"] = Decimal(str(confidence))
 
    return item