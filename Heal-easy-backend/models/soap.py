from datetime import datetime, timezone
 
def soap_key(visit_id:str)->dict:    #Builds the PK/SK for a visit's SOAP note item
    return{
        "PK": f"VISIT#{visit_id}",
        "SK": "SOAPNOTE",
    }
def build_soap_item(
        visit_id:str,
        subjective:str,
        objective:str,
        assessment:str,
        plan:str,
        doctor_id:str,
        approved: bool = False,
        approved_at: str = None,
        created_at: str = None,
)->dict:
    item ={
        **soap_key(visit_id),
        "subjective": subjective,
        "objective": objective,
        "assessment": assessment,
        "plan": plan,
        "doctorId": doctor_id,
        "approved": approved,
        "createdAt": created_at or datetime.now(timezone.utc).isoformat(),

    }
    if approved_at:
        item["approvedAt"] = approved_at
    return item
    