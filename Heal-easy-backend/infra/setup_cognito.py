import boto3
from botocore.exceptions import ClientError
from config.settings import REGION

USER_POOL_NAME = "HealEasyUserPool"
APP_CLIENT_NAME = "HealEasyAppClient"

cognito = boto3.client("cognito-idp", region_name=REGION)


def create_user_pool():
    response = cognito.create_user_pool(
        PoolName=USER_POOL_NAME,
        AutoVerifiedAttributes=["email"],
        UsernameAttributes=["email"],
        Policies={
            "PasswordPolicy": {
                "MinimumLength": 8,
                "RequireUppercase": True,
                "RequireLowercase": True,
                "RequireNumbers": True,
                "RequireSymbols": False,
            }
        },
        Schema=[
            {"Name": "email", "AttributeDataType": "String", "Required": True, "Mutable": True},
            {"Name": "name", "AttributeDataType": "String", "Required": False, "Mutable": True},
            {"Name": "role", "AttributeDataType": "String", "Mutable": True, "DeveloperOnlyAttribute": False},
            {"Name": "hospitalId", "AttributeDataType": "String", "Mutable": True, "DeveloperOnlyAttribute": False},
            {"Name": "doctorId", "AttributeDataType": "String", "Mutable": True, "DeveloperOnlyAttribute": False},  # NEW
        ],
    )
    pool_id = response["UserPool"]["Id"]
    print(f"User pool created: {pool_id}")
    return pool_id


def create_app_client(pool_id):
    response = cognito.create_user_pool_client(
        UserPoolId=pool_id,
        ClientName=APP_CLIENT_NAME,
        GenerateSecret=False,
        ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"],
    )
    client_id = response["UserPoolClient"]["ClientId"]
    print(f"App client created: {client_id}")
    return client_id


def create_groups(pool_id):
    groups = [
        ("Patients", "Patients using the intake and queue features"),
        ("Doctors", "Doctors reviewing SOAP notes and queues"),
        ("Staff", "Reception/staff confirming departments and queues"),
    ]
    for group_name, description in groups:
        try:
            cognito.create_group(GroupName=group_name, UserPoolId=pool_id, Description=description)
            print(f"Group created: {group_name}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "GroupExistsException":
                print(f"Group {group_name} already exists — skipping.")
            else:
                raise


def add_doctor_id_attribute_to_existing_pool(pool_id):
    """
    Use THIS if your pool already exists — adds custom:doctorId without
    recreating anything else.
    """
    try:
        cognito.add_custom_attributes(
            UserPoolId=pool_id,
            CustomAttributes=[
                {"Name": "doctorId", "AttributeDataType": "String", "Mutable": True}
            ],
        )
        print("Added custom:doctorId to existing pool.")
    except ClientError as e:
        print(f"Could not add attribute (may already exist): {e}")


if __name__ == "__main__":

    pool_id = create_user_pool()
    client_id = create_app_client(pool_id)
    create_groups(pool_id)
    print(f"\nUSER_POOL_ID = {pool_id}\nAPP_CLIENT_ID = {client_id}")