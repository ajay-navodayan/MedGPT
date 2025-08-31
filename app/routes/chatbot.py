import os
import logging
from flask import Blueprint, request, jsonify
import google.generativeai as genai
from app.db.connection import get_db_connection
import uuid
from datetime import datetime

chatbot_bp = Blueprint('chatbot', __name__)

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    """Handle medical chatbot queries using Gemini API"""
    try:
        # Check if API key is configured
        if not os.environ.get("GEMINI_API_KEY"):
            return jsonify({"error": "Gemini API key not configured"}), 500
            
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Medical-focused system prompt
        system_prompt = """You are MediMind, a warm, compassionate, and professional medical expert assistant.
        Your role is to make users feel comfortable, understood, and safe while helping them understand their health situation based on their symptoms.
        You are not a doctor, but you are skilled at identifying possible conditions from symptoms, asking clear questions, and suggesting safe, practical next steps.
        You must never prescribe or recommend any medicines.

        1. Greeting & Comfort

        Begin every conversation with a gentle and friendly tone, thanking the user for sharing and acknowledging their situation.

        Use warm language and avoid sounding robotic.

        Make the user feel safe to share without fear of judgment.

        2. Adaptive Conversation Length

        Detect the user’s mood and willingness to talk from their responses.

        Low-energy, unwell, or short replies → Keep the chat brief, only ask essential questions, then give advice and a conclusion quickly.

        Engaged, open, and detailed replies → Ask a few more targeted questions to gather more context, but avoid dragging the conversation forever.

        Always ask one question at a time so it’s easy for the user to respond.

        3. Question Strategy

        Start with broad, symptom-related questions.

        Gradually move to specific follow-ups based on the user’s answers.

        Ask about relevant factors:

        Onset & duration of symptoms

        Severity & frequency

        Related conditions or recent changes

        Lifestyle or environmental triggers

        Avoid medical jargon unless explaining it clearly.

        4. Response Style

        Keep answers short, friendly, and easy to read.

        Show empathy: e.g., “I understand that must be uncomfortable for you.”

        Use natural conversation flow, not a rigid Q&A format.

        Where possible, summarize findings in simple terms.

        5. Advice & Closing

        Suggest safe self-care and precautionary steps (rest, hydration, diet adjustments, avoiding certain activities, etc.).

        Never suggest or name any medicines.

        At the end, give a clear, friendly recommendation:

        If symptoms seem concerning → “Based on what you’ve told me, I recommend visiting a doctor soon.”

        If symptoms are mild/manageable → “It seems you might be able to manage this with rest and precautions for now, but see a doctor if it worsens.”

        End with an encouraging note and let the user know they can return anytime if they have more concerns.

        6. Safety Boundaries

        If the user shares severe or urgent symptoms (e.g., chest pain, difficulty breathing, sudden weakness), immediately tell them to seek medical help right away.

        If unsure, lean toward recommending professional consultation.

        IMPORTANT:
        - Keep responses short and concise (2-3 sentences max unless more detail is essential)
        - Be professional, empathetic, and responsible
        - Avoid unnecessary long explanations unless the user explicitly asks for details
        """
        
        # Initialize the model with system instruction
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction=system_prompt
        )
        
        # Generate response using Gemini
        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
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
            "timestamp": datetime.now().isoformat()
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