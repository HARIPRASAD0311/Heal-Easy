import json
import os
import sys

# Make sure the project root (one level up from scripts/) is importable,
# regardless of which directory this script is actually run from.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.hospital_app import create_hospital
from app.department_app import create_department
from app.doctor_app import create_doctor
from app.patient_app import create_patient
from app.visit_app import create_visit
from app.queue_app import create_queue_token
from app.summary_app import create_summary
from app.soap_app import create_soap_note
from app.notification_app import create_notification
from app.emergency_alert_app import create_alert
from app.consent_app import log_consent_event

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "healeasy_mock_data.json")


def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def seed_hospitals(records):
    count = 0
    for r in records:
        try:
            create_hospital(
                r["hospitalId"], r["name"], r["image"], r["alt"], r["badge"],
                r["metaDashboard"], r["metaSearch"], r["rating"], r["chips"], r["chipsFull"],
                r.get("fullName"),
            )
            count += 1
        except Exception as e:
            print(f"  FAILED hospital {r.get('hospitalId')}: {e}")
    return count


def seed_departments(records):
    count = 0
    for r in records:
        try:
            create_department(r["hospitalId"], r["deptId"], r["label"], r.get("floor"), r.get("room"))
            count += 1
        except Exception as e:
            print(f"  FAILED department {r.get('deptId')}: {e}")
    return count


def seed_doctors(records):
    count = 0
    for r in records:
        try:
            create_doctor(
                r["hospitalId"], r["doctorId"], r["name"], r["specialty"],
                r.get("yearsExp"), r.get("avatarUrl"), r.get("status", "available"),
            )
            count += 1
        except Exception as e:
            print(f"  FAILED doctor {r.get('doctorId')}: {e}")
    return count


def seed_patients(records):
    count = 0
    for r in records:
        try:
            saved = r.get("savedHospitalIds") or None  # empty list -> None, since empty sets aren't allowed
            create_patient(
                r["patientId"], r["phone"], r.get("name"), r.get("preferredLanguage", "en"),
                r.get("age"), r.get("gender"), r.get("bloodGroup"), saved,
            )
            count += 1
        except Exception as e:
            print(f"  FAILED patient {r.get('patientId')}: {e}")
    return count


def seed_visits(records):
    count = 0
    for r in records:
        try:
            create_visit(
                r["patientId"], r["visitId"], r["hospitalId"], r["deptId"],
                r.get("status", "waiting"), r.get("doctorId"),
            )
            count += 1
        except Exception as e:
            print(f"  FAILED visit {r.get('visitId')}: {e}")
    return count


def seed_queue_tokens(records):
    count = 0
    for r in records:
        try:
            create_queue_token(
                r["hospitalId"], r["deptId"], r["patientId"], r["visitId"], r["position"],
            )
            count += 1
        except Exception as e:
            print(f"  FAILED queue token for visit {r.get('visitId')}: {e}")
    return count


def seed_summaries(records):
    count = 0
    for r in records:
        try:
            create_summary(r["visitId"], r["transcriptRef"], r["structuredSummary"], r.get("confidence"))
            count += 1
        except Exception as e:
            print(f"  FAILED summary for visit {r.get('visitId')}: {e}")
    return count


def seed_soap_notes(records):
    count = 0
    for r in records:
        try:
            create_soap_note(
                r["visitId"], r["subjective"], r["objective"], r["assessment"], r["plan"], r["doctorId"],
            )
            count += 1
        except Exception as e:
            print(f"  FAILED SOAP note for visit {r.get('visitId')}: {e}")
    return count


def seed_notifications(records):
    count = 0
    for r in records:
        try:
            create_notification(r["doctorId"], r["notifType"], r["title"], r["message"])
            count += 1
        except Exception as e:
            print(f"  FAILED notification for doctor {r.get('doctorId')}: {e}")
    return count


def seed_alerts(records):
    count = 0
    for r in records:
        try:
            create_alert(
                r["doctorId"], r["patientId"], r["visitId"], r["alertType"],
                r["message"], r["severity"], r.get("suggestions"),
            )
            count += 1
        except Exception as e:
            print(f"  FAILED alert for visit {r.get('visitId')}: {e}")
    return count


def seed_consent_events(records):
    count = 0
    for r in records:
        try:
            log_consent_event(r["visitId"], r["eventType"], r["actorId"], r.get("notes"))
            count += 1
        except Exception as e:
            print(f"  FAILED consent event for visit {r.get('visitId')}: {e}")
    return count


def run():
    data = load_data()

    print("Seeding HealEasy mock data...\n")

    steps = [
        ("Hospitals", seed_hospitals),
        ("Departments", seed_departments),
        ("Doctors", seed_doctors),
        ("Patients", seed_patients),
        ("Visits", seed_visits),
        ("QueueTokens", seed_queue_tokens),
        ("Summaries", seed_summaries),
        ("SOAPNotes", seed_soap_notes),
        ("Notifications", seed_notifications),
        ("Alerts", seed_alerts),
        ("ConsentEvents", seed_consent_events),
    ]

    results = {}
    for key, fn in steps:
        records = data.get(key, [])
        loaded = fn(records)
        results[key] = (loaded, len(records))
        print(f"{key}: {loaded}/{len(records)} loaded")

    print("\n" + "=" * 50)
    total_loaded = sum(loaded for loaded, _ in results.values())
    total_records = sum(total for _, total in results.values())
    print(f"Done. {total_loaded}/{total_records} records loaded successfully.")
    print("=" * 50)


if __name__ == "__main__":
    run()