
import json
import boto3
from config.settings import REGION

KEY_ALIAS = "alias/healeasy-key"

kms = boto3.client("kms", region_name=REGION)
sts = boto3.client("sts", region_name=REGION)


def create_key():
    account_id = sts.get_caller_identity()["Account"]

    key_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "EnableRootAccountAccess",
                "Effect": "Allow",
                "Principal": {"AWS": f"arn:aws:iam::{account_id}:root"},
                "Action": "kms:*",
                "Resource": "*",
            }
        ],
    }

    response = kms.create_key(
        Description="HealEasy/CareNav encryption key for S3 and DynamoDB",
        KeyUsage="ENCRYPT_DECRYPT",
        Origin="AWS_KMS",
        Policy=json.dumps(key_policy),
    )

    key_id = response["KeyMetadata"]["KeyId"]
    key_arn = response["KeyMetadata"]["Arn"]

    try:
        kms.create_alias(AliasName=KEY_ALIAS, TargetKeyId=key_id)
    except kms.exceptions.AlreadyExistsException:
        print(f"Alias {KEY_ALIAS} already exists — reusing it.")

    print("KMS key created.")
    print(f"  Key ID:  {key_id}")
    print(f"  Key ARN: {key_arn}")
    print(f"  Alias:   {KEY_ALIAS}")
    print("Save the Key ARN — create_s3_bucket.py needs it.")

    return key_arn


if __name__ == "__main__":
    create_key()