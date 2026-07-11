import boto3
from botocore.exceptions import ClientError
from config.settings import REGION

BUCKET_NAME = "healeasy-media-2026"  
KMS_KEY_ARN = "arn:aws:kms:ap-south-1:372666940349:key/464eea1d-5445-47b8-a5dc-c67f7f7a4972"

s3 = boto3.client("s3", region_name=REGION)


def create_bucket():
    try:
        print(f"Creating bucket '{BUCKET_NAME}' in region '{REGION}'...")

        if REGION == "us-east-1":
            s3.create_bucket(
                Bucket=BUCKET_NAME
            )
        else:
            s3.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={
                    "LocationConstraint": REGION
                }
            )

        print("Bucket created successfully.")

    except ClientError as e:
        error_code = e.response["Error"]["Code"]

        if error_code == "BucketAlreadyOwnedByYou":
            print("Bucket already exists in your account.")

        elif error_code == "BucketAlreadyExists":
            print("Bucket name is already taken globally.")
            print("Choose a different bucket name.")
            return

        else:
            raise

    # Block all public access
    s3.put_public_access_block(
        Bucket=BUCKET_NAME,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )

    print("Public access blocked.")

    # Enable default KMS encryption
    s3.put_bucket_encryption(
        Bucket=BUCKET_NAME,
        ServerSideEncryptionConfiguration={
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "aws:kms",
                        "KMSMasterKeyID": KMS_KEY_ARN,
                    },
                    "BucketKeyEnabled": True,
                }
            ]
        },
    )

    print("Default KMS encryption enabled.")
    print("Bucket setup completed successfully.")


if __name__ == "__main__":
    create_bucket()