import boto3
from config.settings import REGION

USER_POOL_ID = "ap-south-1_BlywkwiHd"       
APP_CLIENT_ID = "3gdradlcpfajdnq7ruip3bijio"  
ACCOUNT_ID = "372666940349"                 
API_NAME = "HealEasyAPI"


LAMBDA_ARNS = {
    "hospital_handler": "arn:aws:lambda:ap-south-1:372666940349:function:hospital_handler",
    "patient_handler": "arn:aws:lambda:ap-south-1:372666940349:function:patient_handler",
    "visit_handler": "arn:aws:lambda:ap-south-1:372666940349:function:visit_handler",
    "queue_handler": "arn:aws:lambda:ap-south-1:372666940349:function:queue_handler",
    "doctor_handler": "arn:aws:lambda:ap-south-1:372666940349:function:doctor_handler",
    "summary_handler": "arn:aws:lambda:ap-south-1:372666940349:function:summary_handler",
    "soap_handler": "arn:aws:lambda:ap-south-1:372666940349:function:soap_handler",
    "notification_handler": "arn:aws:lambda:ap-south-1:372666940349:function:notification_handler",
    "emergency_alert_handler": "arn:aws:lambda:ap-south-1:372666940349:function:emergency_alert_handler",
    "department_handler": "arn:aws:lambda:ap-south-1:372666940349:function:department_handler",      
    "consent_handler": "arn:aws:lambda:ap-south-1:372666940349:function:consent_handler",       
    "start_intake_handler": "arn:aws:lambda:ap-south-1:372666940349:function:start_intake_handler",
    "start_consult_handler":"arn:aws:lambda:ap-south-1:372666940349:function:start_consult_handler"  
}

ROUTES = {
    "GET /hospitals": "hospital_handler",
    "GET /hospitals/{hospitalId}": "hospital_handler",
    "POST /hospitals": "hospital_handler",
 
    "GET /hospitals/{hospitalId}/departments": "department_handler",             
    "GET /hospitals/{hospitalId}/departments/{deptId}": "department_handler",    
    "POST /hospitals/{hospitalId}/departments": "department_handler",            
    "PATCH /hospitals/{hospitalId}/departments/{deptId}": "department_handler",  
    "DELETE /hospitals/{hospitalId}/departments/{deptId}": "department_handler", 
 
    "GET /hospitals/{hospitalId}/doctors": "doctor_handler",
    "GET /hospitals/{hospitalId}/doctors/{doctorId}": "doctor_handler",
    "POST /hospitals/{hospitalId}/doctors": "doctor_handler",
    "PATCH /hospitals/{hospitalId}/doctors/{doctorId}/status": "doctor_handler",
    "PATCH /hospitals/{hospitalId}/doctors/{doctorId}": "doctor_handler",
 
    "GET /patients/{patientId}": "patient_handler",
    "PATCH /patients/{patientId}": "patient_handler",
    "POST /patients/{patientId}/saved-hospitals": "patient_handler",
    "DELETE /patients/{patientId}/saved-hospitals/{hospitalId}": "patient_handler",
 
    "GET /patients/{patientId}/visits": "visit_handler",
    "POST /visits": "visit_handler",
    "PATCH /visits/{patientId}/{visitId}": "visit_handler",
    "PATCH /visits/{patientId}/{visitId}/assign-doctor": "visit_handler",
    "GET /hospitals/{hospitalId}/visits": "visit_handler",
    "GET /doctors/{doctorId}/visits": "visit_handler",
 
    "POST /queue-tokens": "queue_handler",
    "GET /hospitals/{hospitalId}/departments/{deptId}/queue": "queue_handler",
    "PATCH /queue-tokens/{hospitalId}/{deptId}/{tokenId}": "queue_handler",
 
    "GET /visits/{visitId}/summary": "summary_handler",
    "POST /visits/{visitId}/summary": "summary_handler",
    "POST /visits/{visitId}/summary/approve": "summary_handler",
    "PATCH /visits/{visitId}/summary": "summary_handler",
 
    "GET /visits/{visitId}/soap": "soap_handler",
    "POST /visits/{visitId}/soap": "soap_handler",
    "POST /visits/{visitId}/soap/approve": "soap_handler",
    "PATCH /visits/{visitId}/soap": "soap_handler",
    "POST /visits/{visitId}/soap/reject": "soap_handler",
 
    "GET /doctors/{doctorId}/notifications": "notification_handler",
    "POST /doctors/{doctorId}/notifications": "notification_handler",
    "POST /doctors/{doctorId}/notifications/{notificationId}/read": "notification_handler",
    "POST /doctors/{doctorId}/notifications/mark-all-read": "notification_handler",
    "DELETE /doctors/{doctorId}/notifications/{notificationId}": "notification_handler",
 
    "GET /doctors/{doctorId}/alerts": "emergency_alert_handler",
    "POST /doctors/{doctorId}/alerts": "emergency_alert_handler",
    "POST /doctors/{doctorId}/alerts/{alertId}/acknowledge": "emergency_alert_handler",
    "DELETE /doctors/{doctorId}/alerts/{alertId}": "emergency_alert_handler",
 
    "GET /visits/{visitId}/consent-events": "consent_handler",       
    "POST /visits/{visitId}/consent-events": "consent_handler",      
    
    "POST /intake": "start_intake_handler",
    "POST /consultations": "start_consult_handler"
}

apigw = boto3.client("apigatewayv2", region_name=REGION)
lambda_client = boto3.client("lambda", region_name=REGION)


def create_api():
    # Reuse an existing API named API_NAME if one exists, instead of
    # creating a new one every run. Previously this always called
    # create_api(), which silently created a brand-new, disconnected
    # API Gateway each time the script was re-run — leaving the
    # frontend pointed at an old API missing whatever routes were
    # added most recently.
    existing = apigw.get_apis()["Items"]
    match = next((api for api in existing if api["Name"] == API_NAME), None)
    if match:
        print(f"API '{API_NAME}' already exists: {match['ApiId']} — reusing it.")
        return match["ApiId"]

    response = apigw.create_api(
        Name=API_NAME,
        ProtocolType="HTTP",
        CorsConfiguration={
            "AllowOrigins": ["*"],  # tighten to real frontend URLs 
            "AllowMethods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "AllowHeaders": ["Content-Type", "Authorization"],
        },
    )
    api_id = response["ApiId"]
    print(f"API created: {api_id}")
    return api_id


def create_authorizer(api_id):
    existing = apigw.get_authorizers(ApiId=api_id)["Items"]
    match = next((a for a in existing if a["Name"] == "CognitoAuthorizer"), None)
    if match:
        print(f"Authorizer 'CognitoAuthorizer' already exists: {match['AuthorizerId']} — reusing it.")
        return match["AuthorizerId"]

    issuer = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}"
    response = apigw.create_authorizer(
        ApiId=api_id,
        AuthorizerType="JWT",
        IdentitySource=["$request.header.Authorization"],
        Name="CognitoAuthorizer",
        JwtConfiguration={"Audience": [APP_CLIENT_ID], "Issuer": issuer},
    )
    authorizer_id = response["AuthorizerId"]
    print(f"Cognito authorizer created: {authorizer_id}")
    return authorizer_id


def create_routes(api_id, authorizer_id):
    existing_routes = {r["RouteKey"] for r in apigw.get_routes(ApiId=api_id)["Items"]}

    for route_key, handler_name in ROUTES.items():
        if route_key in existing_routes:
            print(f"Route already exists, skipping: {route_key}")
            continue

        lambda_arn = LAMBDA_ARNS.get(handler_name)
        if not lambda_arn:
            print(f"Skipping '{route_key}' — no Lambda ARN set for {handler_name} yet.")
            continue

        integration = apigw.create_integration(
            ApiId=api_id,
            IntegrationType="AWS_PROXY",
            IntegrationUri=lambda_arn,
            PayloadFormatVersion="2.0",
        )
        integration_id = integration["IntegrationId"]

        apigw.create_route(
            ApiId=api_id,
            RouteKey=route_key,
            Target=f"integrations/{integration_id}",
            AuthorizationType="JWT",
            AuthorizerId=authorizer_id,
        )

        function_name = lambda_arn.split(":")[-1]
        
        
        clean_sid = route_key.replace(" ", "-").replace("/", "-").replace("{", "").replace("}", "")
        
        try:
            lambda_client.add_permission(
                FunctionName=function_name,
                StatementId=f"apigw-{clean_sid}",
                Action="lambda:InvokeFunction",
                Principal="apigateway.amazonaws.com",
            )
        except lambda_client.exceptions.ResourceConflictException:
            pass  # permission already granted, fine on re-run

        print(f"Route wired: {route_key} -> {handler_name}")


def create_stage(api_id):
    try:
        apigw.create_stage(ApiId=api_id, StageName="$default", AutoDeploy=True)
    except apigw.exceptions.ConflictException:
        print("Stage '$default' already exists — skipping creation.")
    endpoint = f"https://{api_id}.execute-api.{REGION}.amazonaws.com"
    print(f"API deployed at: {endpoint}")
    return endpoint


def setup():
    api_id = create_api()
    authorizer_id = create_authorizer(api_id)
    create_routes(api_id, authorizer_id)
    endpoint = create_stage(api_id)

    print("\n" + "=" * 50)
    print("API Gateway setup complete. Save this for your README:")
    print(f"  API_BASE_URL = {endpoint}")
    print("=" * 50)


if __name__ == "__main__":
    setup()