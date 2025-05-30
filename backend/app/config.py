# Configuration settings for the Flask application
# This file contains all the settings and configuration variables our app needs

import os  # For accessing environment variables

class Config:
    """
    Configuration class that holds all app settings
    These settings control how our Flask application behaves
    """
    
    # SECRET_KEY is used by Flask for session security and cryptographic signing
    # In production, this should be a long, random string
    # Never share or commit the real secret key to version control!
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
      # Google OAuth2 settings
    # These credentials identify our app to Google
    # You get these when you create a project in Google Cloud Console
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id-here")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret-here")
    
    # Database configuration
    # We use SQLite for development - it's a lightweight database stored in a file
    # For production, you would typically use PostgreSQL or MySQL
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///calendar_compare.db")
    
    # SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Saves memory by not tracking object modifications
    SQLALCHEMY_ECHO = os.getenv("FLASK_ENV", "development") == "development"  # Log SQL queries in development
    
    # Session configuration
    # Sessions allow us to store user data (like login status) across requests
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevents JavaScript access to session cookies (security)
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    
    # Flask environment settings
    # These control various Flask behaviors
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"
    TESTING = False
