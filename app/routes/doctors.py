import logging
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db.connection import get_db_connection

doctors_bp = Blueprint('doctors', __name__)
import psycopg2
import psycopg2.extras
import os

def get_db_connection():
    return psycopg2.connect(
        dbname="dhp2024",
        user="postgres",
        password="Ajay@123",
        host="localhost",
        cursor_factory=psycopg2.extras.RealDictCursor
    )

    # This makes fetchone()/fetchall() return dict-like rows
    # conn.cursor_factory = psycopg2.extras.RealDictCursor
    return conn


@doctors_bp.route('/api/doctor/register', methods=['POST'])
def register_doctor():
    """Register a new doctor"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'specialization', 'license_number']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        name = data['name']
        email = data['email'].lower()
        password = data['password']
        specialization = data['specialization']
        license_number = data['license_number']
        phone = data.get('phone', '')
        bio = data.get('bio', '')
        experience_years = data.get('experience_years', 0)
        consultation_fee = data.get('consultation_fee', 0.00)
        
        # Basic validation
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Check if email already exists
                cur.execute('SELECT id FROM doctors WHERE email = %s', (email,))
                if cur.fetchone():
                    return jsonify({"error": "Email already registered"}), 409
                
                # Check if license number already exists
                cur.execute('SELECT id FROM doctors WHERE license_number = %s', (license_number,))
                if cur.fetchone():
                    return jsonify({"error": "License number already registered"}), 409
                
                # Insert new doctor
                cur.execute('''
                    INSERT INTO doctors 
                    (name, email, password_hash, specialization, license_number, phone, bio, experience_years, consultation_fee)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (name, email, password_hash, specialization, license_number, phone, bio, experience_years, consultation_fee))
                
                doctor_id = cur.fetchone()['id']
                conn.commit()
                
                return jsonify({
                    "message": "Doctor registered successfully. Verification pending.",
                    "doctor_id": doctor_id
                })
                
        except Exception as e:
            conn.rollback()
            logging.error(f"Database error in register_doctor: {e}")
            return jsonify({"error": "Failed to register doctor"}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error in register_doctor: {e}")
        return jsonify({"error": "Internal server error"}), 500

@doctors_bp.route('/api/doctor/login', methods=['POST'])
def login_doctor():
    """Doctor login"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT id, name, email, password_hash, specialization, is_verified
                FROM doctors WHERE email = %s
            ''', (email,))
            
            doctor = cur.fetchone()
        
        conn.close()
        
        if not doctor or not check_password_hash(doctor['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        return jsonify({
            "message": "Login successful",
            "doctor": {
                "id": doctor['id'],
                "name": doctor['name'],
                "email": doctor['email'],
                "specialization": doctor['specialization'],
                "is_verified": doctor['is_verified']
            }
        })
        
    except Exception as e:
        logging.error(f"Error in login_doctor: {e}")
        return jsonify({"error": "Internal server error"}), 500

@doctors_bp.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get all verified doctors"""
    try:
        specialization = request.args.get('specialization')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            query = '''
                SELECT id, name, specialization, bio, experience_years, consultation_fee
                FROM doctors WHERE is_verified = TRUE
            '''
            params = []
            
            if specialization:
                query += ' AND specialization ILIKE %s'
                params.append(f'%{specialization}%')
            
            query += ' ORDER BY name'
            
            cur.execute(query, params)
            doctors = cur.fetchall()
        
        conn.close()
        
        return jsonify({
            "doctors": [
                {
                    "id": doc['id'],
                    "name": doc['name'],
                    "specialization": doc['specialization'],
                    "bio": doc['bio'],
                    "experience_years": doc['experience_years'],
                    "consultation_fee": float(doc['consultation_fee']) if doc['consultation_fee'] else 0.00
                }
                for doc in doctors
            ]
        })
        
    except Exception as e:
        logging.error(f"Error getting doctors: {e}")
        return jsonify({"error": "Failed to retrieve doctors"}), 500

@doctors_bp.route('/api/doctor/profile/<int:doctor_id>', methods=['GET'])
def get_doctor_profile(doctor_id):
    """Get doctor profile details"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT id, name, email, specialization, license_number, phone, bio, 
                       experience_years, consultation_fee, is_verified, created_at
                FROM doctors WHERE id = %s
            ''', (doctor_id,))
            
            doctor = cur.fetchone()
        
        conn.close()
        
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        return jsonify({
            "doctor": {
                "id": doctor['id'],
                "name": doctor['name'],
                "email": doctor['email'],
                "specialization": doctor['specialization'],
                "license_number": doctor['license_number'],
                "phone": doctor['phone'],
                "bio": doctor['bio'],
                "experience_years": doctor['experience_years'],
                "consultation_fee": float(doctor['consultation_fee']) if doctor['consultation_fee'] else 0.00,
                "is_verified": doctor['is_verified'],
                "created_at": doctor['created_at'].isoformat()
            }
        })
        
    except Exception as e:
        logging.error(f"Error getting doctor profile: {e}")
        return jsonify({"error": "Failed to retrieve doctor profile"}), 500

@doctors_bp.route('/api/doctor/profile/<int:doctor_id>', methods=['PUT'])
def update_doctor_profile(doctor_id):
    """Update doctor profile"""
    try:
        data = request.get_json()
        
        # Fields that can be updated
        updatable_fields = ['name', 'phone', 'bio', 'experience_years', 'consultation_fee']
        updates = []
        params = []
        
        for field in updatable_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        
        params.append(doctor_id)
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                query = f'''
                    UPDATE doctors 
                    SET {", ".join(updates)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id
                '''
                
                cur.execute(query, params)
                
                if not cur.fetchone():
                    return jsonify({"error": "Doctor not found"}), 404
                
                conn.commit()
                return jsonify({"message": "Profile updated successfully"})
                
        except Exception as e:
            conn.rollback()
            logging.error(f"Database error updating doctor profile: {e}")
            return jsonify({"error": "Failed to update profile"}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error updating doctor profile: {e}")
        return jsonify({"error": "Internal server error"}), 500

# UPDATE doctors
# SET is_verified = true, updated_at = NOW()
# WHERE is_verified = false;
