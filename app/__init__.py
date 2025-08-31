import os
import logging
from flask import Flask, render_template
from flask_cors import CORS
from app.db.connection import init_db

def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../static')
    
    # Configure Flask
    app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key")
    
    # Enable CORS for all routes
    CORS(app, origins="*")
    
    # Initialize database
    init_db()
    
    # Register blueprints
    from app.routes.chatbot import chatbot_bp
    from app.routes.appointments import appointments_bp
    from app.routes.doctors import doctors_bp
    from app.routes.news import news_bp
    # from app.routes.users import users_bp
    
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(news_bp)
    
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not found"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
    
    return app
