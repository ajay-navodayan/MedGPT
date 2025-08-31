# appointments.py
import logging
from datetime import datetime, time as dtime, date as ddate
from flask import Blueprint, request, jsonify
from psycopg2 import sql
import psycopg2
import psycopg2.extras
from app.db.connection import get_db_connection  # uses your existing helper

appointments_bp = Blueprint('appointments', __name__)

# ---------------------------------------------------------------------
# Optional local connector (use this only if you don't want the import above)
# def get_db_connection():
#     return psycopg2.connect(
#         dbname="dhp2024",
#         user="postgres",
#         password="Ajay@123",
#         host="localhost",
#         cursor_factory=psycopg2.extras.RealDictCursor,
#     )
# ---------------------------------------------------------------------

def _ensure_schema():
    """
    Creates the appointments table and indexes if they don't exist.
    Enforces a partial unique index to prevent double booking of active slots.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS appointments (
                    id SERIAL PRIMARY KEY,
                    patient_name TEXT NOT NULL,
                    patient_email TEXT NOT NULL,
                    patient_phone TEXT DEFAULT '',
                    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
                    appointment_date DATE NOT NULL,
                    appointment_time TIME NOT NULL,
                    reason TEXT DEFAULT '',
                    status TEXT NOT NULL DEFAULT 'pending',  -- pending|confirmed|completed|cancelled
                    notes TEXT DEFAULT '',
                    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                );
            """)
            # Prevent double-booking for active states
            cur.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_slot
                ON appointments(doctor_id, appointment_date, appointment_time)
                WHERE status IN ('pending','confirmed');
            """)
        conn.commit()
    finally:
        conn.close()

_ensure_schema()

def _parse_date(value: str) -> ddate:
    return datetime.strptime(value, "%Y-%m-%d").date()

def _parse_time(value: str) -> dtime:
    return datetime.strptime(value, "%H:%M").time()

def _now():
    # If you want strict timezone, convert here; keeping server local time for now
    return datetime.now()

def _trim(s: str, max_len: int = 500) -> str:
    if not s:
        return ""
    s = s.strip()
    return s[:max_len]

# --------------------------- BOOK ------------------------------------

@appointments_bp.route('/api/book', methods=['POST'])
def book_appointment():
    """Book a new appointment with race-safe checks and DB unique index."""
    try:
        data = request.get_json(force=True) or {}

        # Required fields
        required = ['patient_name', 'patient_email', 'doctor_id', 'appointment_date', 'appointment_time']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        patient_name = _trim(data['patient_name'], 120)
        patient_email = _trim(data['patient_email'], 254)
        patient_phone = _trim(data.get('patient_phone', ''), 30)
        reason = _trim(data.get('reason', ''), 1000)

        try:
            doctor_id = int(data['doctor_id'])
        except (TypeError, ValueError):
            return jsonify({"error": "doctor_id must be an integer"}), 400

        # Validate date & time
        try:
            appt_date = _parse_date(data['appointment_date'])
            appt_time = _parse_time(data['appointment_time'])
        except ValueError:
            return jsonify({"error": "Invalid date or time format. Use YYYY-MM-DD and HH:MM"}), 400

        appt_dt = datetime.combine(appt_date, appt_time)
        if appt_dt <= _now():
            return jsonify({"error": "Appointment must be scheduled in the future"}), 400

        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # Make sure the doctor exists and is verified
                cur.execute(
                    "SELECT id, name FROM doctors WHERE id = %s AND is_verified = TRUE;",
                    (doctor_id,)
                )
                doctor = cur.fetchone()
                if not doctor:
                    return jsonify({"error": "Doctor not found or not verified"}), 404

                # Check business-hours or availability here if you add a schedule table

                # Try insert; unique index will prevent double-booking
                try:
                    cur.execute("""
                        INSERT INTO appointments
                            (patient_name, patient_email, patient_phone, doctor_id,
                             appointment_date, appointment_time, reason, status)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
                        RETURNING id;
                    """, (patient_name, patient_email, patient_phone, doctor_id,
                          appt_date, appt_time, reason))
                    appt_id = cur.fetchone()['id']
                    conn.commit()
                except psycopg2.Error as e:
                    conn.rollback()
                    # Unique violation -> slot already taken by another request
                    if getattr(e, 'pgcode', None) == psycopg2.errorcodes.UNIQUE_VIOLATION:
                        return jsonify({"error": "This time slot is already booked"}), 409
                    logging.exception("DB error inserting appointment")
                    return jsonify({"error": "Failed to book appointment"}), 500

                return jsonify({
                    "message": "Appointment booked successfully",
                    "appointment_id": appt_id,
                    "doctor_name": doctor['name'],
                    "appointment_date": appt_date.isoformat(),
                    "appointment_time": appt_time.strftime("%H:%M"),
                    "status": "pending"
                }), 201
        finally:
            conn.close()

    except Exception as e:
        logging.exception("Error in book_appointment")
        return jsonify({"error": "Internal server error"}), 500

# --------------------------- LIST ------------------------------------

@appointments_bp.route('/api/appointments', methods=['GET'])
def get_appointments():
    """
    List appointments with optional filters:
      - doctor_id
      - status (pending|confirmed|completed|cancelled)
      - from_date (YYYY-MM-DD)
      - to_date (YYYY-MM-DD)
      - page (default 1), per_page (default 10)
    """
    try:
        doctor_id = request.args.get('doctor_id')
        status = request.args.get('status')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')

        try:
            page = max(1, int(request.args.get('page', 1)))
            per_page = min(100, max(1, int(request.args.get('per_page', 10))))
        except ValueError:
            return jsonify({"error": "page and per_page must be integers"}), 400

        offset = (page - 1) * per_page

        where = ["1=1"]
        params = []

        if doctor_id:
            where.append("a.doctor_id = %s")
            params.append(int(doctor_id))

        if status:
            if status not in ('pending', 'confirmed', 'completed', 'cancelled'):
                return jsonify({"error": "Invalid status"}), 400
            where.append("a.status = %s")
            params.append(status)

        if from_date:
            try:
                fd = _parse_date(from_date)
            except ValueError:
                return jsonify({"error": "Invalid from_date format"}), 400
            where.append("a.appointment_date >= %s")
            params.append(fd)

        if to_date:
            try:
                td = _parse_date(to_date)
            except ValueError:
                return jsonify({"error": "Invalid to_date format"}), 400
            where.append("a.appointment_date <= %s")
            params.append(td)

        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                base = f"""
                    FROM appointments a
                    JOIN doctors d ON a.doctor_id = d.id
                    WHERE {' AND '.join(where)}
                """
                # Total count
                cur.execute(f"SELECT COUNT(*) AS count {base};", params)
                total = cur.fetchone()['count']

                # Page
                cur.execute(
                    f"""
                    SELECT a.*, d.name AS doctor_name, d.specialization
                    {base}
                    ORDER BY a.appointment_date DESC, a.appointment_time DESC
                    LIMIT %s OFFSET %s;
                    """,
                    params + [per_page, offset]
                )
                rows = cur.fetchall()

            items = []
            for apt in rows:
                items.append({
                    "id": apt['id'],
                    "patient_name": apt['patient_name'],
                    "patient_email": apt['patient_email'],
                    "patient_phone": apt['patient_phone'],
                    "doctor_id": apt['doctor_id'],
                    "doctor_name": apt['doctor_name'],
                    "specialization": apt['specialization'],
                    "appointment_date": apt['appointment_date'].isoformat(),
                    "appointment_time": apt['appointment_time'].strftime("%H:%M"),
                    "reason": apt['reason'],
                    "status": apt['status'],
                    "notes": apt['notes'],
                    "created_at": apt['created_at'].isoformat(),
                    "updated_at": apt['updated_at'].isoformat(),
                })

            return jsonify({
                "page": page,
                "per_page": per_page,
                "total": total,
                "appointments": items
            }), 200
        finally:
            conn.close()

    except Exception as e:
        logging.exception("Error getting appointments")
        return jsonify({"error": "Failed to retrieve appointments"}), 500

# --------------------------- UPDATE STATUS ---------------------------

def _update_status(appointment_id: int, new_status: str, notes: str = ""):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                UPDATE appointments
                   SET status = %s,
                       notes = %s,
                       updated_at = NOW()
                 WHERE id = %s
             RETURNING id;
            """, (new_status, _trim(notes, 1000), appointment_id))
            row = cur.fetchone()
        conn.commit()
        return bool(row)
    finally:
        conn.close()

@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """General update for status or notes."""
    try:
        data = request.get_json(force=True) or {}
        status = data.get('status')
        notes = data.get('notes', '')

        if status not in ('pending', 'confirmed', 'completed', 'cancelled'):
            return jsonify({"error": "Invalid status"}), 400

        ok = _update_status(appointment_id, status, notes)
        if not ok:
            return jsonify({"error": "Appointment not found"}), 404

        return jsonify({"message": "Appointment updated successfully"}), 200
    except Exception:
        logging.exception("Error updating appointment")
        return jsonify({"error": "Failed to update appointment"}), 500

# Explicit endpoints for common transitions (nice for frontend)

@appointments_bp.route('/api/appointments/<int:appointment_id>/confirm', methods=['POST'])
def confirm_appointment(appointment_id):
    try:
        notes = _trim((request.get_json() or {}).get('notes', ''))
        ok = _update_status(appointment_id, 'confirmed', notes)
        return (jsonify({"message": "Appointment confirmed"}), 200) if ok else (jsonify({"error": "Not found"}), 404)
    except Exception:
        logging.exception("Error confirming appointment")
        return jsonify({"error": "Failed to confirm appointment"}), 500

@appointments_bp.route('/api/appointments/<int:appointment_id>/complete', methods=['POST'])
def complete_appointment(appointment_id):
    try:
        notes = _trim((request.get_json() or {}).get('notes', ''))
        ok = _update_status(appointment_id, 'completed', notes)
        return (jsonify({"message": "Appointment completed"}), 200) if ok else (jsonify({"error": "Not found"}), 404)
    except Exception:
        logging.exception("Error completing appointment")
        return jsonify({"error": "Failed to complete appointment"}), 500

@appointments_bp.route('/api/appointments/<int:appointment_id>/cancel', methods=['POST'])
def cancel_appointment(appointment_id):
    try:
        notes = _trim((request.get_json() or {}).get('notes', ''))
        ok = _update_status(appointment_id, 'cancelled', notes)
        return (jsonify({"message": "Appointment cancelled"}), 200) if ok else (jsonify({"error": "Not found"}), 404)
    except Exception:
        logging.exception("Error cancelling appointment")
        return jsonify({"error": "Failed to cancel appointment"}), 500
