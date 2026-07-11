from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from database.dynamodb import table

from models.visit import (
    visit_key,
    build_visit_item,
    VALID_STATUSES,
)



# CREATE


def create_visit(
    patient_id: str,
    visit_id: str,
    hospital_id: str,
    department_id: str,
    status: str = "waiting",
    doctor_id: str = None,
):

    item = build_visit_item(
        patient_id=patient_id,
        visit_id=visit_id,
        hospital_id=hospital_id,
        department_id=department_id,
        status=status,
        doctor_id=doctor_id,
    )

    try:
        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)"
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise ValueError(
                f"Visit '{visit_id}' already exists for patient '{patient_id}'."
            )
        raise

    return item



# READ


def get_visit(
    patient_id: str,
    visit_id: str,
):

    response = table.get_item(
        Key=visit_key(
            patient_id,
            visit_id,
        )
    )

    return response.get("Item")


def list_visits_for_patient(
    patient_id: str,
):

    response = table.query(
        KeyConditionExpression=
            Key("PK").eq(f"PATIENT#{patient_id}")
            &
            Key("SK").begins_with("VISIT#")
    )

    items = response.get("Items", [])

    return sorted(
        items,
        key=lambda x: x["createdAt"]
    )


def list_visits_for_doctor(
    doctor_id: str,
):

    response = table.query(
        IndexName="GSI1-DoctorVisits",
        KeyConditionExpression=
            Key("GSI1PK").eq(f"DOCTOR#{doctor_id}")
    )

    items = response.get("Items", [])

    return sorted(
        items,
        key=lambda x: x["createdAt"]
    )


def list_active_visits_for_hospital(
    hospital_id: str,
    status: str = None,
):

    if status:

        if status not in VALID_STATUSES:
            raise ValueError(
                f"Status must be one of {VALID_STATUSES}"
            )

        key_condition = (
            Key("GSI2PK").eq(f"HOSPITAL#{hospital_id}")
            &
            Key("GSI2SK").begins_with(
                f"VISIT#{status}#"
            )
        )

    else:

        key_condition = (
            Key("GSI2PK").eq(f"HOSPITAL#{hospital_id}")
            &
            Key("GSI2SK").begins_with("VISIT#")
        )

    response = table.query(
        IndexName="GSI2-HospitalActiveVisits",
        KeyConditionExpression=key_condition,
    )

    items = response.get("Items", [])

    return sorted(
        items,
        key=lambda x: x["createdAt"]
    )

# UPDATE


def update_visit_status(
    patient_id: str,
    visit_id: str,
    new_status: str,
):

    if new_status not in VALID_STATUSES:
        raise ValueError(
            f"Status must be one of {VALID_STATUSES}"
        )

    visit = get_visit(
        patient_id,
        visit_id,
    )

    if not visit:
        return None

    created_at = visit["createdAt"]

    table.update_item(

        Key=visit_key(
            patient_id,
            visit_id,
        ),

        UpdateExpression="""
        SET
        #status = :status,
        GSI2SK = :gsi2sk
        """,

        ExpressionAttributeNames={
            "#status": "status",
        },

        ExpressionAttributeValues={
            ":status": new_status,
            ":gsi2sk": f"VISIT#{new_status}#{created_at}",
        },
    )

    return get_visit(
        patient_id,
        visit_id,
    )


def assign_doctor_to_visit(
    patient_id: str,
    visit_id: str,
    doctor_id: str,
):

    visit = get_visit(
        patient_id,
        visit_id,
    )

    if not visit:
        return None

    created_at = visit["createdAt"]

    table.update_item(

        Key=visit_key(
            patient_id,
            visit_id,
        ),

        UpdateExpression="""
        SET
        doctorId = :doctor,
        GSI1PK = :gsi1pk,
        GSI1SK = :gsi1sk
        """,

        ExpressionAttributeValues={

            ":doctor": doctor_id,

            ":gsi1pk": f"DOCTOR#{doctor_id}",

            ":gsi1sk": f"VISIT#{created_at}",
        },
    )

    return get_visit(
        patient_id,
        visit_id,
    )



# DELETE


def delete_visit(
    patient_id: str,
    visit_id: str,
):

    table.delete_item(
        Key=visit_key(
            patient_id,
            visit_id,
        )
    )

    return {
        "message": "Visit deleted successfully."
    }