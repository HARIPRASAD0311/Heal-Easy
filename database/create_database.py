#!/usr/bin/env python3
"""
create_database.py — HealEasy SQLite database setup script.

Creates healeasy.db with five tables:
  patients, doctors, consultations, queue, notifications

Reads seed data from the data/ folder (JSON files).
Idempotent: tables are dropped and recreated on every run so the
script is safe to execute multiple times without duplicate rows.

Usage:
    python3 create_database.py
    python3 create_database.py --db path/to/custom.db
    python3 create_database.py --data-dir path/to/data
    python3 create_database.py --dry-run   # print SQL only, no writes
"""

import sqlite3
import json
import argparse
import sys
import os

# ── Paths ──────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB   = os.path.join(SCRIPT_DIR, "healeasy.db")
DEFAULT_DATA = os.path.join(SCRIPT_DIR, "data")

# ── Table DDL ──────────────────────────────────────────────────────
# Column names match the JSON field names exactly so the insert
# logic can use a single generic function for all tables.

CREATE_PATIENTS = """
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
"""

CREATE_DOCTORS = """
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
"""

CREATE_CONSULTATIONS = """
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
    prescription      TEXT,
    follow_up_required INTEGER DEFAULT 0,   -- stored as 0/1 (SQLite has no BOOLEAN)
    follow_up_date    TEXT,
    created_at        TEXT,
    updated_at        TEXT,
    FOREIGN KEY (patientId) REFERENCES patients(patientId),
    FOREIGN KEY (doctorId)  REFERENCES doctors(doctorId)
);
"""

CREATE_QUEUE = """
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
"""

CREATE_NOTIFICATIONS = """
CREATE TABLE IF NOT EXISTS notifications (
    notificationId TEXT PRIMARY KEY,
    doctorId       TEXT,
    patientId      TEXT,
    title          TEXT NOT NULL,
    message        TEXT,
    type           TEXT DEFAULT 'info',
    read           INTEGER DEFAULT 0,   -- 0 = unread, 1 = read
    time           TEXT,
    created_at     TEXT
);
"""

# Ordered so foreign key dependencies are satisfied
TABLES = [
    ("patients",      CREATE_PATIENTS),
    ("doctors",       CREATE_DOCTORS),
    ("consultations", CREATE_CONSULTATIONS),
    ("queue",         CREATE_QUEUE),
    ("notifications", CREATE_NOTIFICATIONS),
]


# ── Helpers ────────────────────────────────────────────────────────

def load_json(data_dir: str, filename: str) -> list:
    """Load a JSON file from data_dir. Returns [] if the file is missing."""
    path = os.path.join(data_dir, filename)
    if not os.path.exists(path):
        print(f"  ⚠  {filename} not found in {data_dir} — skipping.")
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print(f"  ⚠  {filename} root element is not a list — skipping.")
        return []
    return data


def coerce_row(row: dict, columns: list) -> tuple:
    """
    Build an ordered tuple aligned with `columns`.
    - Missing keys become None.
    - Booleans become 1/0 (SQLite stores booleans as integers).
    """
    result = []
    for col in columns:
        val = row.get(col)
        if isinstance(val, bool):
            val = 1 if val else 0
        result.append(val)
    return tuple(result)


def get_columns(cursor, table: str) -> list:
    """Return the column names for a table in definition order."""
    cursor.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cursor.fetchall()]


def insert_rows(cursor, table: str, rows: list, dry_run: bool = False) -> int:
    """
    Insert all rows into the table using parameterised INSERT OR REPLACE.
    Returns the number of rows inserted.
    """
    if not rows:
        return 0

    columns = get_columns(cursor, table)
    placeholders = ", ".join("?" * len(columns))
    col_list = ", ".join(columns)
    sql = f"INSERT OR REPLACE INTO {table} ({col_list}) VALUES ({placeholders})"

    inserted = 0
    errors = 0
    for row in rows:
        values = coerce_row(row, columns)
        try:
            if dry_run:
                print(f"    [DRY-RUN] {sql[:60]}… {values[:3]}…")
            else:
                cursor.execute(sql, values)
            inserted += 1
        except sqlite3.Error as e:
            print(f"    ✗ Error inserting into {table}: {e}")
            print(f"      Row: { {k: row.get(k) for k in list(row)[:4]} }…")
            errors += 1

    return inserted


# ── Main ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Create and seed the HealEasy SQLite database.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 create_database.py
  python3 create_database.py --db /tmp/healeasy.db
  python3 create_database.py --data-dir ./custom_data
  python3 create_database.py --dry-run
        """,
    )
    parser.add_argument("--db",       default=DEFAULT_DB,   help=f"Path to the SQLite database file (default: {DEFAULT_DB})")
    parser.add_argument("--data-dir", default=DEFAULT_DATA, help=f"Directory containing JSON seed files (default: {DEFAULT_DATA})")
    parser.add_argument("--dry-run",  action="store_true",  help="Print SQL without writing to disk")
    args = parser.parse_args()

    db_path  = args.db
    data_dir = args.data_dir
    dry_run  = args.dry_run

    print("=" * 60)
    print("  HealEasy — SQLite Database Setup")
    print("=" * 60)
    print(f"  Database : {db_path}")
    print(f"  Data dir : {data_dir}")
    print(f"  Dry run  : {dry_run}")
    print()

    # Validate data directory
    if not os.path.isdir(data_dir):
        print(f"✗ Data directory not found: {data_dir}")
        sys.exit(1)

    # Connect (creates the file if it doesn't exist)
    try:
        conn = sqlite3.connect(":memory:" if dry_run else db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()
        print(f"✓ Connected to {'in-memory database' if dry_run else db_path}\n")
    except sqlite3.Error as e:
        print(f"✗ Could not open database: {e}")
        sys.exit(1)

    # ── Step 1: Drop existing tables (idempotent reset) ────────────
    print("── Resetting tables ──────────────────────────────────────")
    # Drop in reverse order to respect foreign keys
    for table_name, _ in reversed(TABLES):
        try:
            if not dry_run:
                cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
            print(f"  ✓ Dropped (if existed): {table_name}")
        except sqlite3.Error as e:
            print(f"  ✗ Error dropping {table_name}: {e}")
    print()

    # ── Step 2: Create tables ──────────────────────────────────────
    print("── Creating tables ───────────────────────────────────────")
    for table_name, ddl in TABLES:
        try:
            if not dry_run:
                cursor.execute(ddl)
            print(f"  ✓ Created: {table_name}")
        except sqlite3.Error as e:
            print(f"  ✗ Error creating {table_name}: {e}")
            conn.close()
            sys.exit(1)
    print()

    # ── Step 3: Load and insert seed data ─────────────────────────
    seed_files = {
        "patients":      "patients.json",
        "doctors":       "doctors.json",
        "consultations": "consultations.json",
        "queue":         "queue.json",
        "notifications": "notifications.json",
    }

    total_inserted = 0
    print("── Inserting seed data ───────────────────────────────────")
    for table_name, filename in seed_files.items():
        rows = load_json(data_dir, filename)
        print(f"  Table: {table_name} ({len(rows)} records from {filename})")
        count = insert_rows(cursor, table_name, rows, dry_run=dry_run)
        print(f"    → {'Would insert' if dry_run else 'Inserted'}: {count} rows")
        total_inserted += count
    print()

    # ── Step 4: Commit ─────────────────────────────────────────────
    if not dry_run:
        conn.commit()
    conn.close()

    # ── Summary ────────────────────────────────────────────────────
    print("=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Tables created  : {len(TABLES)}")
    print(f"  Total rows      : {total_inserted}")
    if dry_run:
        print("  [DRY-RUN] No data was written to disk.")
    else:
        print(f"  Database file   : {db_path}")
    print()
    print("✓ Done.")


if __name__ == "__main__":
    main()
