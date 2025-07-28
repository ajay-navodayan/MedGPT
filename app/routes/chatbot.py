import os
import logging
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types
from app.db.connection import get_db_connection
import uuid

chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Gemini client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    """Handle medical chatbot queries using Gemini API"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Medical-focused system prompt
        system_prompt = """You are MedGPT, a professional medical AI assistant. 
        Provide accurate, helpful medical information while always emphasizing that:
        1. This is for informational purposes only
        2. Users should consult healthcare professionals for proper diagnosis
        3. Emergency situations require immediate medical attention
        
        Focus on:
        - Evidence-based medical information
        - Clear, understandable explanations
        - Symptom guidance and when to seek care
        - General health and wellness advice
        - Medical terminology explanations
        
        Always be professional, empathetic, and responsible in your responses."""
        
        # Generate response using Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Content(role="user", parts=[types.Part(text=user_message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
                max_output_tokens=1000
            )
        )
        
        bot_response = response.text or "I apologize, but I couldn't generate a response. Please try again."
        
        # Save chat history to database
        try:
            conn = get_db_connection()
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO chat_history (session_id, user_message, bot_response)
                    VALUES (%s, %s, %s)
                ''', (session_id, user_message, bot_response))
                conn.commit()
            conn.close()
        except Exception as db_error:
            logging.error(f"Failed to save chat history: {db_error}")
        
        return jsonify({
            "response": bot_response,
            "session_id": session_id,
            "timestamp": "now"
        })
        
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({"error": "Failed to process your message. Please try again."}), 500

@chatbot_bp.route('/api/chat/history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    """Get chat history for a session"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT user_message, bot_response, created_at
                FROM chat_history
                WHERE session_id = %s
                ORDER BY created_at ASC
            ''', (session_id,))
            
            history = cur.fetchall()
        
        conn.close()
        
        return jsonify({
            "history": [
                {
                    "user_message": row['user_message'],
                    "bot_response": row['bot_response'],
                    "timestamp": row['created_at'].isoformat()
                }
                for row in history
            ]
        })
        
    except Exception as e:
        logging.error(f"Failed to get chat history: {e}")
        return jsonify({"error": "Failed to retrieve chat history"}), 500
