from app.summary_app import store_consent_task_token


def handler(event, context):
    visit_id = event["visitId"]
    task_token = event["taskToken"]

    store_consent_task_token(visit_id, task_token)

    return {"stored": True, "visitId": visit_id}