#!/usr/bin/env python3
"""
HealEasy — Flask Backend
========================
REST API serving the React frontend from SQLite (healeasy.db).

Run:
    pip install flask flask-cors
    python app.py

Database path is resolved as ../database/healeasy.db relative to this
file, or overridden via HEALEASY_DB_PATH environment variable.
"""

import json
import logging
import os
import sqlite3
import uuid
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request
from flask_cors import CORS

def _analyze_symptoms_local(symptoms: str) -> dict:
    """
    Keyword-based symptom triage — no AI, no external calls.
    Returns the same shape as the old Bedrock response so the
    frontend works without any changes.
    """
    s = symptoms.lower()

    # ── Department + priority mapping ─────────────────────────
    if any(w in s for w in ["chest pain", "heart", "palpitation", "breathless",
                             "shortness of breath", "pressure in chest"]):
        dept     = "Cardiology"
        priority = "critical"
        summary  = ("Patient reports chest-related symptoms. Immediate cardiac "
                    "evaluation is recommended.")
        advice   = ("Go to the Cardiology department immediately. Avoid physical "
                    "exertion and inform the staff about your chest symptoms.")

    elif any(w in s for w in ["headache", "migraine", "seizure", "dizziness",
                               "fainting", "vision blur", "numbness", "neuro"]):
        dept     = "Neurology"
        priority = "high"
        summary  = ("Patient reports neurological symptoms including headache or "
                    "dizziness. Neurological assessment advised.")
        advice   = ("Please visit the Neurology department. Rest in a quiet, "
                    "dark room and avoid screens until examined.")

    elif any(w in s for w in ["fracture", "bone", "joint pain", "sprain",
                               "back pain", "knee", "shoulder", "ortho"]):
        dept     = "Orthopedics"
        priority = "medium"
        summary  = ("Patient reports musculoskeletal symptoms. Orthopedic "
                    "evaluation recommended.")
        advice   = ("Visit the Orthopedics department. Avoid putting weight on "
                    "the affected area and use support if available.")

    elif any(w in s for w in ["child", "infant", "baby", "toddler",
                               "pediatric", "kid"]):
        dept     = "Pediatrics"
        priority = "high"
        summary  = ("Pediatric patient with reported symptoms. Prompt evaluation "
                    "by a pediatrician is advised.")
        advice   = ("Please proceed to the Pediatrics department. Keep the child "
                    "calm and hydrated.")

    elif any(w in s for w in ["rash", "skin", "itch", "allerg", "hive",
                               "swelling", "derma"]):
        dept     = "Dermatology"
        priority = "low"
        summary  = ("Patient reports skin-related symptoms. Dermatological "
                    "assessment recommended.")
        advice   = ("Visit the Dermatology department. Avoid scratching and do "
                    "not apply unknown creams before consultation.")

    elif any(w in s for w in ["ear", "throat", "nose", "sinus", "ent",
                               "hearing loss", "tonsil"]):
        dept     = "ENT"
        priority = "low"
        summary  = ("Patient reports ear, nose, or throat symptoms. ENT "
                    "evaluation recommended.")
        advice   = ("Please visit the ENT department. Stay hydrated and avoid "
                    "loud environments.")

    elif any(w in s for w in ["stomach", "abdominal", "vomit", "nausea",
                               "diarrhea", "digestion", "gastro", "liver",
                               "bowel", "constipation"]):
        dept     = "Gastroenterology"
        priority = "medium"
        summary  = ("Patient reports gastrointestinal symptoms. Gastroenterology "
                    "evaluation recommended.")
        advice   = ("Visit the Gastroenterology department. Drink clear fluids "
                    "and avoid heavy meals.")

    elif any(w in s for w in ["fever", "cold", "cough", "flu", "body pain",
                               "fatigue", "weakness", "infection", "sore throat"]):
        dept     = "General Medicine"
        priority = "medium"
        summary  = ("Patient reports fever, body pain, or general illness. "
                    "General physician consultation recommended.")
        advice   = ("Visit the General Medicine department. Rest well, stay "
                    "hydrated, and take paracetamol if fever is above 38°C.")

    else:
        dept     = "General Medicine"
        priority = "low"
        summary  = ("Patient has described symptoms that require a general "
                    "health assessment.")
        advice   = ("Please visit the General Medicine department for a routine "
                    "consultation with a doctor.")

    return {
        "success":    True,
        "summary":    summary,
        "priority":   priority,
        "department": dept,
        "advice":     advice,
    }
# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Look for the database one level up, inside the database/ folder
DB_PATH  = os.environ.get(
    "HEALEASY_DB_PATH",
    os.path.join(BASE_DIR, "..", "database", "healeasy.db")
)
HOST  = os.environ.get("HEALEASY_HOST", "localhost")
PORT  = int(os.environ.get("HEALEASY_PORT", "5000"))
DEBUG = os.environ.get("HEALEASY_DEBUG", "true").lower() == "true"

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("healeasy")

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "allow_headers": ["Content-Type", "Authorization", "Accept"],
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}})


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------
def get_db() -> sqlite3.Connection:
    if "db" not in g:
        db = sqlite3.connect(os.path.normpath(DB_PATH))
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        g.db = db
    return g.db

@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop("db", None)
    if db:
        db.close()

def rows(cursor_result) -> list:
    """Convert fetchall() result to a list of plain dicts."""
    return [dict(r) for r in cursor_result]

def one(cursor_result) -> dict | None:
    """Convert fetchone() result to a plain dict or None."""
    r = cursor_result
    return dict(r) if r else None

def exists(table: str, col: str, val: str) -> bool:
    return get_db().execute(
        f"SELECT 1 FROM {table} WHERE {col}=? LIMIT 1", (val,)
    ).fetchone() is not None

# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------
class APIError(Exception):
    def __init__(self, msg: str, code: int = 400):
        super().__init__(msg)
        self.message = msg
        self.status_code = code

@app.errorhandler(APIError)
def handle_api_error(e):
    return jsonify(success=False, error=e.message), e.status_code

@app.errorhandler(404)
def not_found(e):
    return jsonify(success=False, error="Not found"), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify(success=False, error="Method not allowed"), 405

@app.errorhandler(500)
def server_error(e):
    logger.exception("Unhandled error")
    return jsonify(success=False, error="Internal server error"), 500

# ---------------------------------------------------------------------------
# Utility: build a consistent JSON response
# ---------------------------------------------------------------------------
def ok(data=None, **extra):
    body = {"success": True}
    if data is not None:
        body["data"] = data
    body.update(extra)
    return jsonify(body)


# ===========================================================================
# AUTH  —  POST /auth/login   POST /auth/register
# ===========================================================================

@app.post("/auth/login")
def auth_login():
    """
    Accepts { phone/email, password, role }.
    Looks up the patient by phone or doctor by email.
    No real password check — demo mode: any password is accepted.
    Returns { success, token, patientId|doctorId, name, role }.
    """
    body = request.get_json(silent=True) or {}
    role = body.get("role", "patient")
    db   = get_db()

    if role == "patient":
        phone = str(body.get("phone", "")).strip()
        if not phone:
            raise APIError("phone is required for patient login", 400)
        row = one(db.execute(
            "SELECT patientId, name FROM patients WHERE phone=? LIMIT 1", (phone,)
        ).fetchone())
        if not row:
            raise APIError("No patient found with that phone number", 404)
        return ok(
            token=f"demo-patient-{row['patientId']}",
            patientId=row["patientId"],
            name=row["name"],
            role="patient"
        )

    elif role == "doctor":
        email = str(body.get("email", "")).strip()
        if not email:
            raise APIError("email is required for doctor login", 400)
        row = one(db.execute(
            "SELECT doctorId, name FROM doctors WHERE email=? LIMIT 1", (email,)
        ).fetchone())
        if not row:
            raise APIError("No doctor found with that email address", 404)
        return ok(
            token=f"demo-doctor-{row['doctorId']}",
            doctorId=row["doctorId"],
            name=row["name"],
            role="doctor"
        )

    raise APIError("role must be 'patient' or 'doctor'", 400)


@app.post("/auth/register")
def auth_register():
    """
    Creates a new patient record.
    Required: name, phone. Optional: email, age, gender, blood_group, medical_history.
    """
    body = request.get_json(silent=True) or {}
    name  = str(body.get("name",  "")).strip()
    phone = str(body.get("phone", "")).strip()
    if not name or not phone:
        raise APIError("name and phone are required", 400)

    db = get_db()
    if db.execute("SELECT 1 FROM patients WHERE phone=?", (phone,)).fetchone():
        raise APIError("A patient with that phone number already exists", 409)

    pid = f"PAT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    db.execute(
        """INSERT INTO patients
           (patientId, name, email, phone, age, gender, blood_group, medical_history,
            created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (pid, name, body.get("email"), phone,
         body.get("age"), body.get("gender"),
         body.get("blood_group"), body.get("medical_history", "None"),
         now, now)
    )
    db.commit()
    return ok(patientId=pid, name=name, message="Patient registered successfully"), 201


# ===========================================================================
# PATIENTS
# ===========================================================================

@app.get("/patients")
def list_patients():
    """GET /patients?search=&department=&page=1&limit=20"""
    db     = get_db()
    search = request.args.get("search", "").strip()
    page   = max(1, int(request.args.get("page",  1)))
    limit  = min(100, int(request.args.get("limit", 20)))
    offset = (page - 1) * limit

    if search:
        pattern = f"%{search}%"
        data = rows(db.execute(
            "SELECT * FROM patients WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? "
            "ORDER BY name LIMIT ? OFFSET ?",
            (pattern, pattern, pattern, limit, offset)
        ).fetchall())
    else:
        data = rows(db.execute(
            "SELECT * FROM patients ORDER BY name LIMIT ? OFFSET ?",
            (limit, offset)
        ).fetchall())

    total = db.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    return ok(data, total=total, page=page, limit=limit)


@app.get("/patients/<patient_id>")
def get_patient(patient_id):
    row = one(get_db().execute(
        "SELECT * FROM patients WHERE patientId=?", (patient_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Patient '{patient_id}' not found", 404)
    return ok(row)


@app.get("/patients/<patient_id>/details")
def get_patient_details(patient_id):
    """Extended patient view — same data as base but explicit endpoint for doctor views."""
    row = one(get_db().execute(
        "SELECT * FROM patients WHERE patientId=?", (patient_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Patient '{patient_id}' not found", 404)
    return ok(row)


@app.get("/patients/<patient_id>/consultations")
def get_patient_consultations(patient_id):
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)
    data = rows(get_db().execute(
        "SELECT * FROM consultations WHERE patientId=? ORDER BY consultation_date DESC",
        (patient_id,)
    ).fetchall())
    return ok(data, count=len(data))


@app.get("/patients/<patient_id>/queue")
def get_patient_queue(patient_id):
    """Return the most recent active queue entry for a patient, or null."""
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)

    db  = get_db()
    row = one(db.execute(
        """SELECT q.*, d.name AS doctor_name_detail
           FROM queue q
           LEFT JOIN doctors d ON q.doctorId = d.doctorId
           WHERE q.patientId=?
             AND q.status NOT IN ('completed','cancelled')
           ORDER BY q.arrival_time DESC LIMIT 1""",
        (patient_id,)
    ).fetchone())

    # Also compute position in the same department queue
    if row:
        position = db.execute(
            """SELECT COUNT(*) FROM queue
               WHERE doctorId=? AND status='waiting'
                 AND arrival_time <= ?""",
            (row["doctorId"], row["arrival_time"])
        ).fetchone()[0]
        total = db.execute(
            "SELECT COUNT(*) FROM queue WHERE doctorId=? AND status='waiting'",
            (row["doctorId"],)
        ).fetchone()[0]
        row["position"]    = position
        row["totalInQueue"] = total

    return ok(row)  # None → data: null → frontend shows EmptyState


@app.get("/patients/<patient_id>/vitals")
def get_patient_vitals(patient_id):
    """Placeholder — vitals table not yet in schema; returns empty dict."""
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)
    return ok({})


@app.post("/patients")
def create_patient():
    body  = request.get_json(silent=True) or {}
    name  = str(body.get("name",  "")).strip()
    phone = str(body.get("phone", "")).strip()
    if not name or not phone:
        raise APIError("name and phone are required", 400)

    db = get_db()
    if db.execute("SELECT 1 FROM patients WHERE phone=?", (phone,)).fetchone():
        raise APIError("Phone number already registered", 409)

    pid = f"PAT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    db.execute(
        """INSERT INTO patients
           (patientId,name,email,phone,age,gender,blood_group,medical_history,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (pid, name, body.get("email"), phone,
         body.get("age"), body.get("gender"),
         body.get("blood_group"), body.get("medical_history","None"), now, now)
    )
    db.commit()
    row = one(db.execute("SELECT * FROM patients WHERE patientId=?", (pid,)).fetchone())
    return ok(row), 201


@app.put("/patients/<patient_id>")
@app.patch("/patients/<patient_id>")
def update_patient(patient_id):
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)
    body    = request.get_json(silent=True) or {}
    allowed = ["name","email","phone","age","gender","blood_group","medical_history"]
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise APIError("No valid fields to update", 400)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    get_db().execute(
        f"UPDATE patients SET {set_clause} WHERE patientId=?",
        (*updates.values(), patient_id)
    )
    get_db().commit()
    row = one(get_db().execute("SELECT * FROM patients WHERE patientId=?", (patient_id,)).fetchone())
    return ok(row)


@app.post("/patients/<patient_id>/transcript")
def submit_transcript(patient_id):
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)
    body       = request.get_json(silent=True) or {}
    transcript = str(body.get("transcript", "")).strip()
    if not transcript:
        raise APIError("transcript is required", 400)
    # Store transcript by creating a pending consultation
    cid = f"CON-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    db  = get_db()
    db.execute(
        """INSERT INTO consultations
           (consultationId,patientId,doctorId,consultation_date,status,notes)
           VALUES (?,?,?,?,?,?)""",
        (cid, patient_id, "UNASSIGNED", now, "scheduled", transcript)
    )
    db.commit()
    return ok(consultationId=cid, status="scheduled"), 201


# ===========================================================================
# DOCTORS
# ===========================================================================

@app.get("/doctors/<doctor_id>")
def get_doctor(doctor_id):
    row = one(get_db().execute(
        "SELECT * FROM doctors WHERE doctorId=?", (doctor_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Doctor '{doctor_id}' not found", 404)
    return ok(row)


@app.get("/doctors/<doctor_id>/stats")
def get_doctor_stats(doctor_id):
    if not exists("doctors", "doctorId", doctor_id):
        raise APIError(f"Doctor '{doctor_id}' not found", 404)
    db   = get_db()
    today = datetime.now().strftime("%Y-%m-%d")

    today_patients = db.execute(
        "SELECT COUNT(*) FROM queue WHERE doctorId=? AND DATE(arrival_time)=?",
        (doctor_id, today)
    ).fetchone()[0]

    total_consultations = db.execute(
        "SELECT COUNT(*) FROM consultations WHERE doctorId=?",
        (doctor_id,)
    ).fetchone()[0]

    pending_approvals = db.execute(
        "SELECT COUNT(*) FROM consultations WHERE doctorId=? AND status='scheduled'",
        (doctor_id,)
    ).fetchone()[0]

    return ok({
        "todayPatients":      today_patients,
        "totalConsultations": total_consultations,
        "pendingApprovals":   pending_approvals,
        "avgDuration":        20,   # placeholder — no duration data in schema yet
    })


@app.get("/doctors/<doctor_id>/notifications")
def get_doctor_notifications(doctor_id):
    if not exists("doctors", "doctorId", doctor_id):
        raise APIError(f"Doctor '{doctor_id}' not found", 404)
    data = rows(get_db().execute(
        "SELECT * FROM notifications WHERE doctorId=? ORDER BY created_at DESC",
        (doctor_id,)
    ).fetchall())
    # Normalise: map `read` int → bool and add `id` alias
    for n in data:
        n["id"]   = n.get("notificationId")
        n["read"] = bool(n.get("read", 0))
    return ok(data, count=len(data))


@app.put("/doctors/<doctor_id>/notifications/<notif_id>/read")
def mark_notification_read(doctor_id, notif_id):
    if not exists("doctors", "doctorId", doctor_id):
        raise APIError(f"Doctor '{doctor_id}' not found", 404)
    db = get_db()
    db.execute(
        "UPDATE notifications SET read=1 WHERE notificationId=? AND doctorId=?",
        (notif_id, doctor_id)
    )
    db.commit()
    return ok(message="Notification marked as read")


@app.get("/doctors/<doctor_id>/queue")
def get_doctor_queue(doctor_id):
    """Return the full active queue for a doctor, enriched with patient details."""
    if not exists("doctors", "doctorId", doctor_id):
        raise APIError(f"Doctor '{doctor_id}' not found", 404)

    db     = get_db()
    status = request.args.get("status", "")

    if status:
        data = rows(db.execute(
            """SELECT q.*, p.name, p.age, p.gender, p.phone, p.blood_group,
                      p.medical_history
               FROM queue q
               LEFT JOIN patients p ON q.patientId = p.patientId
               WHERE q.doctorId=? AND q.status=?
               ORDER BY q.token_number""",
            (doctor_id, status)
        ).fetchall())
    else:
        data = rows(db.execute(
            """SELECT q.*, p.name, p.age, p.gender, p.phone, p.blood_group,
                      p.medical_history
               FROM queue q
               LEFT JOIN patients p ON q.patientId = p.patientId
               WHERE q.doctorId=?
               ORDER BY q.token_number""",
            (doctor_id,)
        ).fetchall())

    return ok(data, count=len(data))


@app.patch("/doctors/<doctor_id>")
def patch_doctor(doctor_id):
    if not exists("doctors", "doctorId", doctor_id):
        raise APIError(f"Doctor '{doctor_id}' not found", 404)
    body    = request.get_json(silent=True) or {}
    allowed = ["availability"]
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise APIError("No valid fields to update", 400)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    get_db().execute(
        f"UPDATE doctors SET {set_clause} WHERE doctorId=?",
        (*updates.values(), doctor_id)
    )
    get_db().commit()
    row = one(get_db().execute("SELECT * FROM doctors WHERE doctorId=?", (doctor_id,)).fetchone())
    return ok(row)


# ===========================================================================
# CONSULTATIONS
# ===========================================================================

@app.get("/consultations")
def list_consultations():
    db      = get_db()
    filters = []
    params  = []
    for col in ("patientId", "doctorId", "status"):
        val = request.args.get(col)
        if val:
            filters.append(f"{col}=?")
            params.append(val)
    where = f"WHERE {' AND '.join(filters)}" if filters else ""
    page  = max(1, int(request.args.get("page", 1)))
    limit = min(100, int(request.args.get("limit", 20)))
    offset = (page - 1) * limit
    data = rows(db.execute(
        f"SELECT * FROM consultations {where} ORDER BY consultation_date DESC LIMIT ? OFFSET ?",
        (*params, limit, offset)
    ).fetchall())
    return ok(data, count=len(data))


@app.get("/consultations/<consultation_id>")
def get_consultation(consultation_id):
    row = one(get_db().execute(
        "SELECT * FROM consultations WHERE consultationId=?", (consultation_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    return ok(row)


@app.post("/consultations")
def create_consultation():
    body       = request.get_json(silent=True) or {}
    patient_id = str(body.get("patientId", "")).strip()
    doctor_id  = str(body.get("doctorId",  "")).strip()
    if not patient_id or not doctor_id:
        raise APIError("patientId and doctorId are required", 400)
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)

    cid = f"CON-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    db  = get_db()
    db.execute(
        """INSERT INTO consultations
           (consultationId,patientId,doctorId,patient_name,doctor_name,department,
            chief_complaint,consultation_date,status,notes,prescription,
            follow_up_required,follow_up_date,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (cid, patient_id, doctor_id,
         body.get("patient_name",""), body.get("doctor_name",""),
         body.get("department",""),  body.get("chief_complaint",""),
         body.get("consultation_date", now), body.get("status","scheduled"),
         body.get("notes",""), body.get("prescription",""),
         1 if body.get("follow_up_required") else 0,
         body.get("follow_up_date"), now, now)
    )
    db.commit()
    row = one(db.execute("SELECT * FROM consultations WHERE consultationId=?", (cid,)).fetchone())
    return ok(row), 201


@app.put("/consultations/<consultation_id>")
def update_consultation(consultation_id):
    db  = get_db()
    # Create new record if ID starts with "new-"
    if consultation_id.startswith("new-"):
        return create_consultation()

    body    = request.get_json(silent=True) or {}
    allowed = ["notes","diagnosis","prescription","follow_up_date",
               "follow_up_required","status","chief_complaint",
               "doctor_name","patient_name","department"]
    updates = {k: v for k, v in body.items() if k in allowed}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    result = db.execute(
        f"UPDATE consultations SET {set_clause} WHERE consultationId=?",
        (*updates.values(), consultation_id)
    )
    db.commit()
    if result.rowcount == 0:
        # Consultation doesn't exist — create it
        body["consultationId"] = consultation_id
        return create_consultation()
    row = one(db.execute("SELECT * FROM consultations WHERE consultationId=?", (consultation_id,)).fetchone())
    return ok(row)


@app.patch("/consultations/<consultation_id>/status")
def update_consultation_status(consultation_id):
    if not exists("consultations", "consultationId", consultation_id):
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    body   = request.get_json(silent=True) or {}
    status = str(body.get("status","")).strip()
    if not status:
        raise APIError("status is required", 400)
    get_db().execute(
        "UPDATE consultations SET status=?, updated_at=? WHERE consultationId=?",
        (status, datetime.now(timezone.utc).isoformat(), consultation_id)
    )
    get_db().commit()
    return ok(message="Status updated")


@app.get("/consultations/<consultation_id>/record")
def get_medical_record(consultation_id):
    row = one(get_db().execute(
        "SELECT * FROM consultations WHERE consultationId=?", (consultation_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    # Return in the shape the MedicalRecord page expects
    return ok({
        "aiSuggestions": {
            "diagnosis":    row.get("notes",""),
            "treatment":    "",
            "prescription": row.get("prescription",""),
            "notes":        row.get("notes",""),
        },
        "doctorEdits": {
            "diagnosis":    row.get("diagnosis",""),
            "treatment":    "",
            "prescription": row.get("prescription",""),
            "notes":        row.get("notes",""),
        },
        "status": row.get("status",""),
    })


@app.put("/consultations/<consultation_id>/record")
def update_medical_record(consultation_id):
    if not exists("consultations", "consultationId", consultation_id):
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    body    = request.get_json(silent=True) or {}
    allowed = ["diagnosis","prescription","notes","treatment"]
    updates = {k: v for k, v in body.items() if k in allowed}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    get_db().execute(
        f"UPDATE consultations SET {set_clause} WHERE consultationId=?",
        (*updates.values(), consultation_id)
    )
    get_db().commit()
    return ok(message="Record updated")


@app.get("/consultations/<consultation_id>/ai-suggestions")
def get_ai_suggestions(consultation_id):
    row = one(get_db().execute(
        "SELECT * FROM consultations WHERE consultationId=?", (consultation_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    # Return a structured AI suggestion response based on existing data
    return ok({
        "summary":             row.get("notes") or "AI analysis not yet available.",
        "confidence":          0.82,
        "urgency":             "medium",
        "department":          row.get("department","General Medicine"),
        "diagnosis":           row.get("diagnosis") or row.get("chief_complaint",""),
        "treatment":           "Rest, hydration, follow prescribed medication.",
        "prescription":        row.get("prescription",""),
        "chiefComplaint":      row.get("chief_complaint",""),
        "historyOfIllness":    "",
        "symptomsDiscussed":   row.get("chief_complaint",""),
        "clinicalFindings":    "",
        "assessment":          "",
        "followUpInstructions": "",
    })


@app.post("/consultations/<consultation_id>/ai-suggestions/approve")
def approve_ai_suggestion(consultation_id):
    if not exists("consultations", "consultationId", consultation_id):
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    get_db().execute(
        "UPDATE consultations SET status='completed', updated_at=? WHERE consultationId=?",
        (datetime.now(timezone.utc).isoformat(), consultation_id)
    )
    get_db().commit()
    return ok(message="AI suggestion approved", approvedAt=datetime.now(timezone.utc).isoformat())


@app.post("/consultations/<consultation_id>/ai-suggestions/reject")
def reject_ai_suggestion(consultation_id):
    if not exists("consultations", "consultationId", consultation_id):
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    body   = request.get_json(silent=True) or {}
    reason = body.get("reason","")
    logger.info("AI suggestion rejected for %s: %s", consultation_id, reason)
    return ok(message="AI suggestion rejected")


@app.post("/consultations/<consultation_id>/transcript")
def consultation_transcript(consultation_id):
    if not exists("consultations", "consultationId", consultation_id):
        raise APIError(f"Consultation '{consultation_id}' not found", 404)
    body = request.get_json(silent=True) or {}
    transcript = str(body.get("transcript","")).strip()
    get_db().execute(
        "UPDATE consultations SET notes=?, updated_at=? WHERE consultationId=?",
        (transcript, datetime.now(timezone.utc).isoformat(), consultation_id)
    )
    get_db().commit()
    return ok(message="Transcript saved")


# ===========================================================================
# QUEUE
# ===========================================================================

@app.get("/queue")
def list_queue():
    """GET /queue?doctorId=&status=&department="""
    db      = get_db()
    filters = []
    params  = []
    for col in ("doctorId", "status", "department"):
        val = request.args.get(col)
        if val:
            filters.append(f"q.{col}=?")
            params.append(val)
    where = f"WHERE {' AND '.join(filters)}" if filters else ""
    data = rows(db.execute(
        f"""SELECT q.*, p.name, p.age, p.gender, p.phone
            FROM queue q
            LEFT JOIN patients p ON q.patientId = p.patientId
            {where}
            ORDER BY q.token_number""",
        params
    ).fetchall())
    return ok(data, count=len(data))


@app.get("/queue/stats")
def queue_stats():
    db = get_db()
    total    = db.execute("SELECT COUNT(*) FROM queue").fetchone()[0]
    waiting  = db.execute("SELECT COUNT(*) FROM queue WHERE status='waiting'").fetchone()[0]
    in_prog  = db.execute("SELECT COUNT(*) FROM queue WHERE status='in_consultation'").fetchone()[0]
    completed= db.execute("SELECT COUNT(*) FROM queue WHERE status='completed'").fetchone()[0]
    avg_row  = db.execute("SELECT AVG(estimated_wait_time) FROM queue WHERE status='waiting'").fetchone()[0]
    return ok({
        "total":       total,
        "waiting":     waiting,
        "inProgress":  in_prog,
        "completed":   completed,
        "avgWaitTime": round(avg_row or 0),
    })


@app.get("/queue/patient/<patient_id>")
def queue_by_patient(patient_id):
    """Active queue entry for a patient (used by patient Queue page)."""
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)

    db  = get_db()
    row = one(db.execute(
        """SELECT q.*, d.name AS doctorName, d.specialization AS doctorSpecialty
           FROM queue q
           LEFT JOIN doctors d ON q.doctorId = d.doctorId
           WHERE q.patientId=?
             AND q.status NOT IN ('completed','cancelled')
           ORDER BY q.arrival_time DESC LIMIT 1""",
        (patient_id,)
    ).fetchone())

    if row:
        position = db.execute(
            """SELECT COUNT(*) FROM queue
               WHERE doctorId=? AND status='waiting'
                 AND arrival_time <= ?""",
            (row["doctorId"], row["arrival_time"])
        ).fetchone()[0]
        total = db.execute(
            "SELECT COUNT(*) FROM queue WHERE doctorId=? AND status='waiting'",
            (row["doctorId"],)
        ).fetchone()[0]
        row["position"]    = position
        row["totalInQueue"] = total
        row["estimatedWait"] = row.get("estimated_wait_time")

    return ok(row)


@app.get("/queue/department/<department>")
def queue_by_department(department):
    data = rows(get_db().execute(
        """SELECT q.*, p.name, p.age, p.gender
           FROM queue q
           LEFT JOIN patients p ON q.patientId = p.patientId
           WHERE q.department=?
           ORDER BY q.token_number""",
        (department,)
    ).fetchall())
    return ok(data, count=len(data))


@app.get("/queue/<queue_id>")
def get_queue_entry(queue_id):
    row = one(get_db().execute(
        "SELECT * FROM queue WHERE queueId=?", (queue_id,)
    ).fetchone())
    if not row:
        raise APIError(f"Queue entry '{queue_id}' not found", 404)
    return ok(row)


@app.post("/queue")
def join_queue():
    body       = request.get_json(silent=True) or {}
    patient_id = str(body.get("patientId", "")).strip()
    department = str(body.get("department","General Medicine")).strip()
    doctor_id  = str(body.get("doctorId",  "")).strip()

    if not patient_id:
        raise APIError("patientId is required", 400)
    if not exists("patients", "patientId", patient_id):
        raise APIError(f"Patient '{patient_id}' not found", 404)

    db  = get_db()

    # Auto-assign a doctor if none specified
    if not doctor_id:
        doc_row = one(db.execute(
            "SELECT doctorId FROM doctors WHERE department=? AND availability='available' LIMIT 1",
            (department,)
        ).fetchone())
        doctor_id = doc_row["doctorId"] if doc_row else "DOC-EE55FF66"

    # Get next token number
    token = (db.execute(
        "SELECT MAX(token_number) FROM queue WHERE doctorId=? AND DATE(arrival_time)=DATE('now')",
        (doctor_id,)
    ).fetchone()[0] or 0) + 1

    # Count current waiting
    position = db.execute(
        "SELECT COUNT(*) FROM queue WHERE doctorId=? AND status='waiting'",
        (doctor_id,)
    ).fetchone()[0] + 1

    qid = f"QUE-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    est_wait = position * 15  # 15 min per patient estimate

    db.execute(
        """INSERT INTO queue
           (queueId,patientId,doctorId,patient_name,doctor_name,department,
            token_number,arrival_time,status,estimated_wait_time,priority,symptoms,
            created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (qid, patient_id, doctor_id,
         body.get("patient_name",""), body.get("doctor_name",""),
         department, token, now, "waiting", est_wait,
         body.get("priority","normal"), body.get("symptoms",""),
         now, now)
    )
    db.commit()
    return ok({
        "queueId":       qid,
        "tokenNumber":   token,
        "position":      position,
        "estimatedWait": est_wait,
        "department":    department,
        "status":        "waiting",
    }), 201


@app.patch("/queue/<queue_id>/status")
def update_queue_status(queue_id):
    if not exists("queue", "queueId", queue_id):
        raise APIError(f"Queue entry '{queue_id}' not found", 404)
    body   = request.get_json(silent=True) or {}
    status = str(body.get("status","")).strip()
    if not status:
        raise APIError("status is required", 400)
    get_db().execute(
        "UPDATE queue SET status=?, updated_at=? WHERE queueId=?",
        (status, datetime.now(timezone.utc).isoformat(), queue_id)
    )
    get_db().commit()
    return ok(message="Queue status updated")


@app.delete("/queue/<queue_id>")
def leave_queue(queue_id):
    if not exists("queue", "queueId", queue_id):
        raise APIError(f"Queue entry '{queue_id}' not found", 404)
    get_db().execute(
        "UPDATE queue SET status='cancelled', updated_at=? WHERE queueId=?",
        (datetime.now(timezone.utc).isoformat(), queue_id)
    )
    get_db().commit()
    return ok(message="Removed from queue")


@app.post("/queue/<queue_id>/call")
def call_next_patient(queue_id):
    if not exists("queue", "queueId", queue_id):
        raise APIError(f"Queue entry '{queue_id}' not found", 404)
    get_db().execute(
        "UPDATE queue SET status='in_consultation', updated_at=? WHERE queueId=?",
        (datetime.now(timezone.utc).isoformat(), queue_id)
    )
    get_db().commit()
    row = one(get_db().execute("SELECT * FROM queue WHERE queueId=?", (queue_id,)).fetchone())
    return ok(row)


# ===========================================================================
# AI  (lightweight stubs — no ML, just structured responses)
# ===========================================================================

@app.post("/ai/transcribe")
def ai_transcribe():
    return ok({
        "jobId":  f"TRANS-{uuid.uuid4().hex[:8].upper()}",
        "status": "pending",
    }), 202


@app.get("/ai/transcribe/<job_id>")
def ai_transcribe_status(job_id):
    return ok({"jobId": job_id, "status": "completed", "transcript": ""})


@app.post("/ai/department")
def ai_suggest_department():
    body = request.get_json(silent=True) or {}
    symptoms = str(body.get("symptoms","")).lower()
    dept = "General Medicine"
    if any(w in symptoms for w in ["chest","heart","pressure"]):
        dept = "Cardiology"
    elif any(w in symptoms for w in ["head","neuro","seizure","dizz"]):
        dept = "Neurology"
    elif any(w in symptoms for w in ["bone","joint","fracture","back"]):
        dept = "Orthopedics"
    elif any(w in symptoms for w in ["child","infant","pediatric"]):
        dept = "Pediatrics"
    return ok({"department": dept, "confidence": 0.75, "alternatives": []})


@app.post("/ai/urgency")
def ai_urgency():
    body = request.get_json(silent=True) or {}
    symptoms = str(body.get("symptoms","")).lower()
    urgency = "medium"
    if any(w in symptoms for w in ["chest pain","breathless","stroke","unconscious"]):
        urgency = "critical"
    elif any(w in symptoms for w in ["fever","severe","blood"]):
        urgency = "high"
    elif any(w in symptoms for w in ["mild","slight","minor"]):
        urgency = "low"
    return ok({"urgency": urgency, "reasoning": "Based on symptom keywords."})


# ===========================================================================
# INDEX / HEALTH
# ===========================================================================

@app.get("/")
def index():
    return ok(
        service="HealEasy API",
        version="2.0.0",
        endpoints=[
            "POST /auth/login",
            "POST /auth/register",
            "GET  /patients",
            "GET  /patients/<id>",
            "GET  /patients/<id>/details",
            "GET  /patients/<id>/consultations",
            "GET  /patients/<id>/queue",
            "GET  /patients/<id>/vitals",
            "POST /patients",
            "PUT  /patients/<id>",
            "POST /patients/<id>/transcript",
            "GET  /doctors/<id>",
            "GET  /doctors/<id>/stats",
            "GET  /doctors/<id>/notifications",
            "PUT  /doctors/<id>/notifications/<nid>/read",
            "GET  /doctors/<id>/queue",
            "PATCH /doctors/<id>",
            "GET  /consultations",
            "GET  /consultations/<id>",
            "POST /consultations",
            "PUT  /consultations/<id>",
            "PATCH /consultations/<id>/status",
            "GET  /consultations/<id>/record",
            "PUT  /consultations/<id>/record",
            "GET  /consultations/<id>/ai-suggestions",
            "POST /consultations/<id>/ai-suggestions/approve",
            "POST /consultations/<id>/ai-suggestions/reject",
            "POST /consultations/<id>/transcript",
            "GET  /queue",
            "GET  /queue/stats",
            "GET  /queue/patient/<patient_id>",
            "GET  /queue/department/<dept>",
            "GET  /queue/<id>",
            "POST /queue",
            "PATCH /queue/<id>/status",
            "DELETE /queue/<id>",
            "POST /queue/<id>/call",
            "POST /ai/analyze",
            "POST /ai/transcribe",
            "POST /ai/department",
            "POST /ai/urgency",
        ]
    )


@app.get("/health")
def health():
    try:
        count = get_db().execute("SELECT COUNT(*) FROM patients").fetchone()[0]
        return ok(status="healthy", db=os.path.basename(DB_PATH), patients=count)
    except sqlite3.Error as e:
        raise APIError(f"Database unavailable: {e}", 503) from e


@app.route("/ai/analyze", methods=["POST"])
def ai_analyze():
    """
    POST /ai/analyze
    Body: { "symptoms": "string" }
    Returns: { "success", "summary", "priority", "department", "advice" }
    Uses keyword-based triage — no external AI calls.
    """
    body     = request.get_json(silent=True) or {}
    symptoms = str(body.get("symptoms", "")).strip()

    if not symptoms:
        return jsonify({
            "success":    False,
            "error":      "symptoms field is required",
            "summary":    "",
            "priority":   "medium",
            "department": "General Medicine",
            "advice":     "Please describe your symptoms.",
        }), 400

    result = _analyze_symptoms_local(symptoms)
    logger.info("AI analyze: dept=%s priority=%s", result["department"], result["priority"])
    return jsonify(result)

# ===========================================================================
# SCHEMA BOOTSTRAP  (only runs if a table is missing — never drops data)
# ===========================================================================

def ensure_schema():
    """Create tables that don't yet exist. Matches the actual healeasy.db schema."""
    conn = sqlite3.connect(os.path.normpath(DB_PATH))
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS patients (
                patientId       TEXT PRIMARY KEY,
                name            TEXT NOT NULL,
                email           TEXT,
                phone           TEXT,
                age             INTEGER,
                gender          TEXT,
                blood_group     TEXT,
                medical_history TEXT DEFAULT 'None',
                created_at      TEXT,
                updated_at      TEXT
            );

            CREATE TABLE IF NOT EXISTS doctors (
                doctorId          TEXT PRIMARY KEY,
                name              TEXT NOT NULL,
                email             TEXT,
                phone             TEXT,
                specialization    TEXT,
                department        TEXT,
                license_number    TEXT,
                experience_years  INTEGER,
                availability      TEXT DEFAULT 'available',
                consultation_fee  REAL,
                created_at        TEXT,
                updated_at        TEXT
            );

            CREATE TABLE IF NOT EXISTS consultations (
                consultationId    TEXT PRIMARY KEY,
                patientId         TEXT NOT NULL,
                doctorId          TEXT NOT NULL,
                patient_name      TEXT,
                doctor_name       TEXT,
                department        TEXT,
                chief_complaint   TEXT,
                consultation_date TEXT,
                status            TEXT DEFAULT 'scheduled',
                notes             TEXT,
                diagnosis         TEXT,
                prescription      TEXT,
                follow_up_required INTEGER DEFAULT 0,
                follow_up_date    TEXT,
                created_at        TEXT,
                updated_at        TEXT,
                FOREIGN KEY (patientId) REFERENCES patients(patientId),
                FOREIGN KEY (doctorId)  REFERENCES doctors(doctorId)
            );

            CREATE TABLE IF NOT EXISTS queue (
                queueId             TEXT PRIMARY KEY,
                patientId           TEXT NOT NULL,
                doctorId            TEXT NOT NULL,
                patient_name        TEXT,
                doctor_name         TEXT,
                department          TEXT,
                token_number        INTEGER,
                arrival_time        TEXT,
                status              TEXT DEFAULT 'waiting',
                estimated_wait_time INTEGER,
                priority            TEXT DEFAULT 'normal',
                symptoms            TEXT,
                created_at          TEXT,
                updated_at          TEXT,
                FOREIGN KEY (patientId) REFERENCES patients(patientId),
                FOREIGN KEY (doctorId)  REFERENCES doctors(doctorId)
            );

            CREATE TABLE IF NOT EXISTS notifications (
                notificationId TEXT PRIMARY KEY,
                doctorId       TEXT,
                patientId      TEXT,
                title          TEXT NOT NULL,
                message        TEXT,
                type           TEXT DEFAULT 'info',
                read           INTEGER DEFAULT 0,
                time           TEXT,
                created_at     TEXT
            );
        """)
        conn.commit()
        logger.info("Schema verified.")
    finally:
        conn.close()


# ===========================================================================
# ENTRY POINT
# ===========================================================================

if __name__ == "__main__":
    ensure_schema()
    logger.info("Database : %s", os.path.normpath(DB_PATH))
    logger.info("Starting HealEasy API on http://%s:%d", HOST, PORT)
    app.run(host=HOST, port=PORT, debug=DEBUG)
