# MedGPT - Professional Medical Assistant

## Overview

MedGPT is a comprehensive medical assistant web application that combines AI-powered chatbot functionality with appointment booking, doctor management, and medical news aggregation. The system provides a professional interface for patients to interact with medical AI, book appointments with verified doctors, and stay updated with health-related news.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a Flask-based backend architecture with a React frontend, implementing a clear separation between data, business logic, and presentation layers.

### Backend Architecture
- **Framework**: Flask with Blueprint-based modular routing
- **Database**: PostgreSQL with psycopg2 adapter using RealDictCursor for JSON-like responses
- **AI Integration**: Google Gemini API for medical chatbot functionality
- **External APIs**: NewsAPI for medical news aggregation
- **Security**: Werkzeug password hashing, CORS enabled for cross-origin requests

### Frontend Architecture
- **Framework**: React 18 (loaded via CDN)
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **Build Tool**: Babel for JSX transformation (browser-based)
- **HTTP Client**: Axios for API communication
- **Icons**: Feather Icons library

## Key Components

### 1. Medical Chatbot (`/app/routes/chatbot.py`)
- Integrates with Google Gemini 2.5 Flash model
- Implements medical-focused system prompts with safety guidelines
- Session-based conversation tracking
- Emphasizes professional medical disclaimers and emergency guidance

### 2. Appointment Management (`/app/routes/appointments.py`)
- Complete booking system with validation
- Doctor availability checking
- Conflict prevention for overlapping appointments
- Patient information management

### 3. Doctor Registration & Management (`/app/routes/doctors.py`)
- Secure doctor registration with license verification
- Profile management with specializations and fees
- Email uniqueness and license number validation
- Password security with bcrypt hashing

### 4. Medical News Aggregation (`/app/routes/news.py`)
- NewsAPI integration with medical keyword filtering
- Multiple endpoint coverage (health category + medical research)
- Customizable country and category filters
- Article relevance scoring and filtering

### 5. Database Layer (`/app/db/connection.py`)
- PostgreSQL connection management with environment-based configuration
- Automatic table initialization
- Comprehensive schema for doctors, appointments, and availability

## Data Flow

1. **User Interaction**: Frontend React components handle user input
2. **API Communication**: Axios sends requests to Flask Blueprint routes
3. **Business Logic**: Flask routes process requests and validate data
4. **External APIs**: Gemini AI and NewsAPI calls for enhanced functionality
5. **Data Persistence**: PostgreSQL stores user data, appointments, and doctor information
6. **Response Flow**: JSON responses flow back through the same chain

## External Dependencies

### Required APIs
- **Google Gemini API**: Medical chatbot functionality (requires GEMINI_API_KEY)
- **NewsAPI**: Medical news aggregation (requires NEWS_API_KEY)

### Database Requirements
- **PostgreSQL**: Primary data storage
- Environment variables: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

### CDN Dependencies
- React 18 and ReactDOM
- Tailwind CSS
- Babel Standalone
- Axios
- Feather Icons

## Deployment Strategy

### Environment Configuration
- **Development**: Debug mode enabled with hot reloading
- **Production**: Environment variables for sensitive data (API keys, database credentials)
- **Session Management**: Configurable session secret key

### Database Schema
- **Doctors Table**: Complete profile management with verification status
- **Appointments Table**: Booking system with conflict prevention
- **Doctor Availability**: Time slot management for scheduling

### Security Considerations
- Password hashing using Werkzeug
- Email validation and uniqueness constraints
- License number verification for doctor registration
- CORS configuration for cross-origin requests
- Input validation and sanitization across all endpoints

### Performance Features
- Connection pooling through psycopg2
- Efficient database queries with proper indexing
- Lightweight frontend with CDN-based dependencies
- Caching-friendly static file serving

The architecture prioritizes medical data security, user experience, and scalable AI integration while maintaining compliance with healthcare application standards.