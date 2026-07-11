from datetime import datetime, timezone

valid_types = ("patient_consent", "doctor_approval", "override", "department_confirm")

def consent_key(visit_id: str, timestamp: str) -> dict:
    return {
        "PK": f"VISIT#{visit_id}",
        "SK": f"CONSENT#{timestamp}"
    }

def build_consent_item(
    visit_id: str,
    event_type: str,
    actor_id: str,
    timestamp: str = None,
    notes: str = None,
) -> dict:
    if event_type not in valid_types:
        raise ValueError(f"event_type must be one of {valid_types}, got {event_type!r}")
    
    ts = timestamp if timestamp else datetime.now(timezone.utc).isoformat()
    
    item = {
        **consent_key(visit_id, ts),
        "visitId": visit_id,
        "eventType": event_type,
        "actorId": actor_id,
        "timestamp": ts,
    }
    
    if notes:
        item["notes"] = notes
        
    return item
