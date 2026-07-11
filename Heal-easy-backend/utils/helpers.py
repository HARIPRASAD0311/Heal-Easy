import json
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """
    DynamoDB returns numbers as Decimal, which json.dumps can't
    serialize by default. This converts them to int/float on the way out.
    """
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def success_response(data, status_code=200):
    """Standard success response shape for API Gateway (HTTP API)."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # tighten to your actual frontend domain before final demo
        },
        "body": json.dumps(data, cls=DecimalEncoder),
    }


def error_response(message, status_code=400):
    """Standard error response shape."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"error": message}),
    }


def get_body(event):
    """
    Safely parses the JSON body from an API Gateway event.
    Returns {} if there's no body (e.g. a GET request).
    """
    body = event.get("body")
    if not body:
        return {}
    if isinstance(body, dict):
        return body
    return json.loads(body)


def get_path_param(event, name):
    """Pulls one path parameter, e.g. {visitId} from /visits/{visitId}."""
    return (event.get("pathParameters") or {}).get(name)


def get_query_param(event, name, default=None):
    """Pulls one query string parameter, e.g. ?status=waiting."""
    return (event.get("queryStringParameters") or {}).get(name, default)


def get_claims(event):
    """
    Pulls the Cognito JWT claims from the authorizer context —
    this is where role, hospitalId, and the user's sub live once
    API Gateway's Cognito authorizer has validated the token.
    """
    try:
        return event["requestContext"]["authorizer"]["jwt"]["claims"]
    except KeyError:
        return {}