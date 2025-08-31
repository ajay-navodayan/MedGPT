import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

def get_db_connection():
    """Get a connection to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            dbname='dhp2024',
            user='postgres',
            password='Ajay@123',
            host='localhost',
            port='5432'
        )
        return conn
    except psycopg2.Error as e:
        logging.error(f"Database connection error: {e}")
        raise


def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Create doctors table
            cur.execute('''
                CREATE TABLE IF NOT EXISTS doctors (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    specialization VARCHAR(255) NOT NULL,
                    license_number VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    bio TEXT,
                    experience_years INTEGER DEFAULT 0,
                    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create doctor availability table
            cur.execute('''
                CREATE TABLE IF NOT EXISTS doctor_availability (
                    id SERIAL PRIMARY KEY,
                    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
                    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    is_available BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create appointments table
            cur.execute('''
                CREATE TABLE IF NOT EXISTS appointments (
                    id SERIAL PRIMARY KEY,
                    patient_name VARCHAR(255) NOT NULL,
                    patient_email VARCHAR(255) NOT NULL,
                    patient_phone VARCHAR(20),
                    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
                    appointment_date DATE NOT NULL,
                    appointment_time TIME NOT NULL,
                    reason TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create chat history table
            cur.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255),
                    user_message TEXT NOT NULL,
                    bot_response TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logging.info("Database tables initialized successfully")
            
    except psycopg2.Error as e:
        conn.rollback()
        logging.error(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()
