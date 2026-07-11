import boto3 
from config.settings import TABLE_NAME,REGION

dynamodb = boto3.resource("dynamodb",region_name = REGION)
table = dynamodb.Table(TABLE_NAME)

print(f"Table status: {table} created")