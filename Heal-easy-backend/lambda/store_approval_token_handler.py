from app.soap_app import store_approval_task_token


def handler(event, context):
    visit_id = event["visitId"]
    task_token = event["taskToken"]

    store_approval_task_token(visit_id, task_token)

    return {"stored": True, "visitId": visit_id}