import boto3
from botocore.exceptions import ClientError

REGION = "ap-south-1"
TABLE_NAME = "HealEasyTable"


def create_table():
    dynamodb = boto3.client(
        "dynamodb",
        region_name=REGION
    )

    try:

        print(f"Connecting to AWS Region: {REGION}")

        response = dynamodb.create_table(

            TableName=TABLE_NAME,

            BillingMode="PAY_PER_REQUEST",

            AttributeDefinitions=[

                {
                    "AttributeName": "PK",
                    "AttributeType": "S",
                },
                {
                    "AttributeName": "SK",
                    "AttributeType": "S",
                },

                {
                    "AttributeName": "GSI1PK",
                    "AttributeType": "S",
                },
                {
                    "AttributeName": "GSI1SK",
                    "AttributeType": "S",
                },

                {
                    "AttributeName": "GSI2PK",
                    "AttributeType": "S",
                },
                {
                    "AttributeName": "GSI2SK",
                    "AttributeType": "S",
                },
            ],

            KeySchema=[

                {
                    "AttributeName": "PK",
                    "KeyType": "HASH",
                },

                {
                    "AttributeName": "SK",
                    "KeyType": "RANGE",
                },
            ],

            GlobalSecondaryIndexes=[

                {
                    "IndexName": "GSI1-DoctorVisits",

                    "KeySchema": [

                        {
                            "AttributeName": "GSI1PK",
                            "KeyType": "HASH",
                        },

                        {
                            "AttributeName": "GSI1SK",
                            "KeyType": "RANGE",
                        },
                    ],

                    "Projection": {
                        "ProjectionType": "ALL"
                    },
                },

                {
                    "IndexName": "GSI2-HospitalActiveVisits",

                    "KeySchema": [

                        {
                            "AttributeName": "GSI2PK",
                            "KeyType": "HASH",
                        },

                        {
                            "AttributeName": "GSI2SK",
                            "KeyType": "RANGE",
                        },
                    ],

                    "Projection": {
                        "ProjectionType": "ALL"
                    },
                },
            ],
        )

        print("Creating table...")
        print("Waiting until table becomes ACTIVE...")

        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)

        print("HealEasyTable created successfully!")

        print("Table ARN:")
        print(response["TableDescription"]["TableArn"])

    except ClientError as e:

        if e.response["Error"]["Code"] == "ResourceInUseException":

            print(f"Table '{TABLE_NAME}' already exists.")

        else:

            print("AWS Error:")
            print(e.response["Error"]["Message"])

    except Exception as e:

        print("Unexpected Error:")
        print(str(e))


if __name__ == "__main__":
    create_table()