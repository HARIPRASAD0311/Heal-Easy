from datetime import datetime, timezone
from database.dynamodb import table
from models.summary import summary_key,build_summary_item
#create
def create_summary(
    visit_id: str,
    transcript_ref: str,
    structured_summary: str,
    confidence: float = None,
):
    
    #Creates a new AI-generated symptom summary.
    
    item = build_summary_item(
        visit_id=visit_id,
        transcript_ref=transcript_ref,
        structured_summary=structured_summary,
        confidence=confidence,
        patient_approved=False,
    )

    table.put_item(Item=item)

    return item

#read 
def get_summary(
    visit_id: str,
):
    response = table.get_item(
        Key=summary_key(visit_id)
    )

    return response.get("Item")

# UPDATE

def approve_summary(
    visit_id: str,
):
    """
    Marks the summary as approved by the patient.
    """

    table.update_item(

        Key=summary_key(visit_id),

        UpdateExpression="""
        SET patientApproved = :approved
        """,

        ExpressionAttributeValues={
            ":approved": True,
        },
    )

    return get_summary(visit_id)


def update_summary_text(
    visit_id: str,
    structured_summary: str,
):
    """
    Updates only the summary text.
    """

    table.update_item(

        Key=summary_key(visit_id),

        UpdateExpression="""
        SET structuredSummary = :summary
        """,

        ExpressionAttributeValues={
            ":summary": structured_summary,
        },
    )

    return get_summary(visit_id)
# DELETE
def delete_summary(
    visit_id: str,
):

    table.delete_item(
        Key=summary_key(visit_id)
    )

    return {
        "message": f"Summary for visit '{visit_id}' deleted successfully."
    }


def store_consent_task_token(visit_id: str, task_token: str):
    """
    Saves the Step Functions task token onto the summary item. Called by
    lambda/store_consent_token_handler.py the moment the intake state
    machine reaches its waitForTaskToken state. The token is retrieved
    later by summary_handler's _approve(), which calls SendTaskSuccess
    to actually release the gate.
    """
    table.update_item(
        Key=summary_key(visit_id),
        UpdateExpression="SET consentTaskToken = :t",
        ExpressionAttributeValues={":t": task_token},
    )
    return get_summary(visit_id)