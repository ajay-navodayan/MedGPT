import logging
from flask import Blueprint, request, jsonify
from app.db.connection import get_db_connection
from datetime import datetime, date, time

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/api/book', methods=['POST'])
def book_appointment():
    """Book a new appointment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_name', 'patient_email', 'doctor_id', 'appointment_date', 'appointment_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        patient_name = data['patient_name']
        patient_email = data['patient_email']
        patient_phone = data.get('patient_phone', '')
        doctor_id = data['doctor_id']
        appointment_date = data['appointment_date']
        appointment_time = data['appointment_time']
        reason = data.get('reason', '')
        
        # Validate date and time formats
        try:
            appointment_date_obj = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            appointment_time_obj = datetime.strptime(appointment_time, '%H:%M').time()
        except ValueError:
            return jsonify({"error": "Invalid date or time format"}), 400
        
        # Check if appointment is in the future
        appointment_datetime = datetime.combine(appointment_date_obj, appointment_time_obj)
        if appointment_datetime <= datetime.now():
            return jsonify({"error": "Appointment must be scheduled for a future date and time"}), 400
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Check if doctor exists
                cur.execute('SELECT id, name FROM doctors WHERE id = %s AND is_verified = TRUE', (doctor_id,))
                doctor = cur.fetchone()
                if not doctor:
                    return jsonify({"error": "Doctor not found or not verified"}), 404
                
                # Check for conflicting appointments
                cur.execute('''
                    SELECT id FROM appointments 
                    WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s
                    AND status NOT IN ('cancelled', 'completed')
                ''', (doctor_id, appointment_date, appointment_time))
                
                if cur.fetchone():
                    return jsonify({"error": "This time slot is already booked"}), 409
                
                # Insert new appointment
                cur.execute('''
                    INSERT INTO appointments 
                    (patient_name, patient_email, patient_phone, doctor_id, appointment_date, appointment_time, reason)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (patient_name, patient_email, patient_phone, doctor_id, appointment_date, appointment_time, reason))
                
                appointment_id = cur.fetchone()['id']
                conn.commit()
                
                return jsonify({
                    "message": "Appointment booked successfully",
                    "appointment_id": appointment_id,
                    "doctor_name": doctor['name'],
                    "appointment_date": appointment_date,
                    "appointment_time": appointment_time
                })
                
        except Exception as e:
            conn.rollback()
            logging.error(f"Database error in book_appointment: {e}")
            return jsonify({"error": "Failed to book appointment"}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error in book_appointment: {e}")
        return jsonify({"error": "Internal server error"}), 500

@appointments_bp.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Get all appointments with optional filtering"""
    try:
        doctor_id = request.args.get('doctor_id')
        status = request.args.get('status')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            query = '''
                SELECT a.*, d.name as doctor_name, d.specialization
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                WHERE 1=1
            '''
            params = []
            
            if doctor_id:
                query += ' AND a.doctor_id = %s'
                params.append(doctor_id)
            
            if status:
                query += ' AND a.status = %s'
                params.append(status)
            
            query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC'
            
            cur.execute(query, params)
            appointments = cur.fetchall()
        
        conn.close()
        
        return jsonify({
            "appointments": [
                {
                    "id": apt['id'],
                    "patient_name": apt['patient_name'],
                    "patient_email": apt['patient_email'],
                    "patient_phone": apt['patient_phone'],
                    "doctor_id": apt['doctor_id'],
                    "doctor_name": apt['doctor_name'],
                    "specialization": apt['specialization'],
                    "appointment_date": apt['appointment_date'].isoformat(),
                    "appointment_time": apt['appointment_time'].strftime('%H:%M'),
                    "reason": apt['reason'],
                    "status": apt['status'],
                    "notes": apt['notes'],
                    "created_at": apt['created_at'].isoformat()
                }
                for apt in appointments
            ]
        })
        
    except Exception as e:
        logging.error(f"Error getting appointments: {e}")
        return jsonify({"error": "Failed to retrieve appointments"}), 500

@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment status or notes"""
    try:
        data = request.get_json()
        status = data.get('status')
        notes = data.get('notes', '')
        
        if status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            return jsonify({"error": "Invalid status"}), 400
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE appointments 
                    SET status = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id
                ''', (status, notes, appointment_id))
                
                if not cur.fetchone():
                    return jsonify({"error": "Appointment not found"}), 404
                
                conn.commit()
                return jsonify({"message": "Appointment updated successfully"})
                
        except Exception as e:
            conn.rollback()
            logging.error(f"Database error updating appointment: {e}")
            return jsonify({"error": "Failed to update appointment"}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error updating appointment: {e}")
        return jsonify({"error": "Internal server error"}), 500
