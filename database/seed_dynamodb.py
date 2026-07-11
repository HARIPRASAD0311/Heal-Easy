#!/usr/bin/env python3
"""
HealEasy DynamoDB Seed Script
Inserts realistic mock hospital data into DynamoDB tables.

Tables: Patients, Doctors, Consultation, Queue

Usage:
    python3 seed_dynamodb.py --region us-east-1
    python3 seed_dynamodb.py --region us-east-1 --clear  # Clear tables before seeding
    python3 seed_dynamodb.py --region us-east-1 --dry-run  # Preview data without inserting

Requirements:
    pip install boto3

AWS Credentials:
    Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
    Or configure ~/.aws/credentials file
"""

import boto3
import json
import argparse
import sys
from datetime import datetime, timedelta
from uuid import uuid4
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = None

# Realistic Indian data
INDIAN_FIRST_NAMES = [
    "Rajesh", "Priya", "Amit", "Neha", "Vikram", "Anjali", "Arjun", "Divya",
    "Rohan", "Shreya", "Aditya", "Pooja", "Nikhil", "Ananya", "Sanjay", "Kavya",
    "Akshay", "Isha", "Rahul", "Diya"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Iyer",
    "Nair", "Desai", "Rao", "Bhat", "Menon", "Chopra", "Malhotra", "Saxena",
    "Joshi", "Kapoor", "Agarwal", "Bhatt"
]

DEPARTMENTS = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology",
    "General Medicine", "Gastroenterology", "Pulmonology", "Ophthalmology", "ENT"
]

SYMPTOMS = [
    "Chest pain", "Headache", "Back pain", "Fever", "Cough", "Shortness of breath",
    "Abdominal pain", "Nausea", "Dizziness", "Fatigue", "Skin rash", "Joint pain",
    "Sore throat", "Ear pain", "Vision problems", "Difficulty sleeping", "Anxiety",
    "High blood pressure", "Diabetes symptoms", "Digestive issues"
]

DOCTOR_SPECIALIZATIONS = [
    "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician", "Dermatologist",
    "General Practitioner", "Gastroenterologist", "Pulmonologist", "Ophthalmologist", "ENT Specialist"
]

QUEUE_STATUSES = ["waiting", "in_consultation", "completed", "cancelled"]
CONSULTATION_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"]

def generate_phone_number():
    """Generate realistic Indian phone number"""
    import random
    prefix = random.choice([9, 8, 7, 6])
    return f"+91{prefix}{random.randint(10000000, 99999999)}"

def generate_patient_id():
    """Generate unique patient ID"""
    return f"PAT-{str(uuid4())[:8].upper()}"

def generate_doctor_id():
    """Generate unique doctor ID"""
    return f"DOC-{str(uuid4())[:8].upper()}"

def generate_consultation_id():
    """Generate unique consultation ID"""
    return f"CON-{str(uuid4())[:8].upper()}"

def generate_queue_id():
    """Generate unique queue ID"""
    return f"QUE-{str(uuid4())[:8].upper()}"

def generate_patients(count=20):
    """Generate realistic patient data"""
    import random
    patients = []
    
    for i in range(count):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        
        patient = {
            "patientId": generate_patient_id(),
            "name": f"{first_name} {last_name}",
            "email": f"{first_name.lower()}.{last_name.lower()}{i}@email.com",
            "phone": generate_phone_number(),
            "age": random.randint(18, 85),
            "gender": random.choice(["M", "F", "Other"]),
            "blood_group": random.choice(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
            "medical_history": random.choice(["None", "Hypertension", "Diabetes", "Asthma", "Allergies"]),
            "created_at": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        patients.append(patient)
    
    return patients

def generate_doctors(count=5):
    """Generate realistic doctor data"""
    import random
    doctors = []
    
    for i in range(count):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        specialization = random.choice(DOCTOR_SPECIALIZATIONS)
        
        doctor = {
            "doctorId": generate_doctor_id(),
            "name": f"Dr. {first_name} {last_name}",
            "email": f"dr.{first_name.lower()}{i}@hospital.com",
            "phone": generate_phone_number(),
            "specialization": specialization,
            "department": random.choice(DEPARTMENTS),
            "license_number": f"MED{random.randint(100000, 999999)}",
            "experience_years": random.randint(3, 30),
            "availability": random.choice(["available", "busy", "on_leave"]),
            "consultation_fee": Decimal(str(random.randint(300, 1500))),
            "created_at": (datetime.utcnow() - timedelta(days=random.randint(1, 730))).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        doctors.append(doctor)
    
    return doctors

def generate_consultations(patients, doctors, count=15):
    """Generate realistic consultation data"""
    import random
    consultations = []
    
    for i in range(count):
        patient = random.choice(patients)
        doctor = random.choice(doctors)
        consultation_date = datetime.utcnow() - timedelta(days=random.randint(0, 30))
        
        consultation = {
            "consultationId": generate_consultation_id(),
            "patientId": patient["patientId"],
            "doctorId": doctor["doctorId"],
            "patient_name": patient["name"],
            "doctor_name": doctor["name"],
            "department": doctor["department"],
            "chief_complaint": random.choice(SYMPTOMS),
            "consultation_date": consultation_date.isoformat(),
            "status": random.choice(CONSULTATION_STATUSES),
            "notes": f"Patient consulted for {random.choice(SYMPTOMS).lower()}. Examination completed.",
            "prescription": "Paracetamol 500mg - 2 tablets twice daily for 5 days",
            "follow_up_required": random.choice([True, False]),
            "follow_up_date": (consultation_date + timedelta(days=7)).isoformat() if random.choice([True, False]) else None,
            "created_at": consultation_date.isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        consultations.append(consultation)
    
    return consultations

def generate_queue_entries(patients, doctors, count=20):
    """Generate realistic queue data"""
    import random
    queue_entries = []
    
    for i in range(count):
        patient = random.choice(patients)
        doctor = random.choice(doctors)
        arrival_time = datetime.utcnow() - timedelta(minutes=random.randint(0, 120))
        
        queue_entry = {
            "queueId": generate_queue_id(),
            "patientId": patient["patientId"],
            "doctorId": doctor["doctorId"],
            "patient_name": patient["name"],
            "doctor_name": doctor["name"],
            "department": doctor["department"],
            "token_number": random.randint(1, 100),
            "arrival_time": arrival_time.isoformat(),
            "status": random.choice(QUEUE_STATUSES),
            "estimated_wait_time": random.randint(5, 60),
            "priority": random.choice(["normal", "urgent", "high"]),
            "symptoms": random.choice(SYMPTOMS),
            "created_at": arrival_time.isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        queue_entries.append(queue_entry)
    
    return queue_entries

def insert_items(table_name, items, dry_run=False):
    """Insert items into DynamoDB table"""
    table = dynamodb.Table(table_name)
    inserted = 0
    skipped = 0
    errors = []
    
    for item in items:
        try:
            if dry_run:
                print(f"  [DRY-RUN] Would insert: {item.get('patientId') or item.get('doctorId') or item.get('consultationId') or item.get('queueId')}")
                inserted += 1
            else:
                primary_key = list(item.keys())[0]  # Get first key (the updated camelCase ID)
                
                table.put_item(
                    Item=item,
                    ConditionExpression=f"attribute_not_exists({primary_key})"
                )
                inserted += 1
                print(f"  ✓ Inserted: {item.get('patientId') or item.get('doctorId') or item.get('consultationId') or item.get('queueId')}")
        
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            skipped += 1
            print(f"  ⊘ Skipped (already exists): {item.get('patientId') or item.get('doctorId') or item.get('consultationId') or item.get('queueId')}")
        
        except Exception as e:
            errors.append(str(e))
            print(f"  ✗ Error: {str(e)}")
    
    return inserted, skipped, errors

def clear_table(table_name):
    """Clear all items from a table"""
    table = dynamodb.Table(table_name)
    
    try:
        response = table.scan()
        items = response.get('Items', [])
        
        table_keys = [key['AttributeName'] for key in table.key_schema]
        
        deleted = 0
        for item in items:
            key = {key_name: item[key_name] for key_name in table_keys}
            table.delete_item(Key=key)
            deleted += 1
        
        print(f"  ✓ Cleared {deleted} items from {table_name}")
        return deleted
    
    except Exception as e:
        print(f"  ✗ Error clearing table: {str(e)}")
        return 0

def main():
    global dynamodb
    
    parser = argparse.ArgumentParser(
        description="Seed DynamoDB tables with realistic hospital data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 seed_dynamodb.py --region us-east-1
  python3 seed_dynamodb.py --region us-east-1 --clear
  python3 seed_dynamodb.py --region us-east-1 --dry-run
        """
    )
    
    parser.add_argument('--region', default='us-east-1', help='AWS region (default: us-east-1)')
    parser.add_argument('--clear', action='store_true', help='Clear tables before seeding')
    parser.add_argument('--dry-run', action='store_true', help='Preview data without inserting')
    parser.add_argument('--endpoint-url', help='DynamoDB endpoint URL (for local testing)')
    
    args = parser.parse_args()
    
    try:
        if args.endpoint_url:
            dynamodb = boto3.resource('dynamodb', region_name=args.region, endpoint_url=args.endpoint_url)
        else:
            dynamodb = boto3.resource('dynamodb', region_name=args.region)
        print(f"✓ Connected to DynamoDB (region: {args.region})\n")
    except Exception as e:
        print(f"✗ Failed to connect to DynamoDB: {str(e)}")
        print("  Make sure AWS credentials are configured:")
        print("  - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables")
        print("  - Or configure ~/.aws/credentials file")
        sys.exit(1)
    
    if args.clear:
        print("Clearing tables...\n")
        for table_name in ["Patients", "Doctors", "Consultation", "Queue"]:
            try:
                clear_table(table_name)
            except Exception as e:
                print(f"  ✗ Error clearing {table_name}: {str(e)}")
        print()
    
    print("Generating mock data...")
    patients = generate_patients(20)
    doctors = generate_doctors(5)
    consultations = generate_consultations(patients, doctors, 15)
    queue_entries = generate_queue_entries(patients, doctors, 20)
    print(f"✓ Generated 20 patients, 5 doctors, 15 consultations, 20 queue entries\n")
    
    print("Inserting data into DynamoDB...\n")
    
    total_inserted = 0
    total_skipped = 0
    all_errors = []
    
    tables = [
        ("Patients", patients),
        ("Doctors", doctors),
        ("Consultation", consultations),
        ("Queue", queue_entries),
    ]
    
    for table_name, items in tables:
        print(f"Table: {table_name}")
        inserted, skipped, errors = insert_items(table_name, items, args.dry_run)
        total_inserted += inserted
        total_skipped += skipped
        all_errors.extend(errors)
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total inserted: {total_inserted}")
    print(f"Total skipped:  {total_skipped}")
    if all_errors:
        print(f"Total errors:   {len(all_errors)}")
        for error in all_errors:
            print(f"  - {error}")
    
    if args.dry_run:
        print("\n[DRY-RUN MODE] No data was actually inserted.")
    
    print("\n✓ Seeding complete!")

if __name__ == "__main__":
    main()