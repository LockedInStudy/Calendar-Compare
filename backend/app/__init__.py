# Import necessary Flask components and libraries
from flask import Flask  # Main Flask application class
from flask_cors import CORS  # Cross-Origin Resource Sharing - allows frontend to talk to backend
from flask_sqlalchemy import SQLAlchemy  # Database ORM (Object-Relational Mapping)
from flask_migrate import Migrate  # Database migration support
from dotenv import load_dotenv  # Loads environment variables from .env file
import os  # Operating system interface for accessing environment variables

# Initialize extensions that will be attached to app later
# This allows us to use them across the application
db = SQLAlchemy()  # Database object for interacting with SQLite
migrate = Migrate()  # Migration object for database schema changes

def create_app():
    """
    Application factory function that creates and configures a Flask application
    This pattern is recommended for Flask apps as it makes testing easier
    and allows multiple app instances with different configurations
    """    # Load environment variables from .env file
    # This allows us to store sensitive information like API keys securely
    # The .env file is in the project root directory (parent of backend)
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'), override=True)
    
    # Create a new Flask application instance
    # __name__ tells Flask where to find resources relative to this file
    app = Flask(__name__)
    
    # Enable CORS (Cross-Origin Resource Sharing) for all routes
    # This allows our React frontend (running on a different port) to make requests
    # to our Flask backend without browser security restrictions
    CORS(app, supports_credentials=True)  # supports_credentials=True allows cookies/sessions    # Load configuration settings from our Config class
    # This includes settings like SECRET_KEY, database URLs, etc.
    app.config.from_object("app.config.Config")
    
    # Initialize database and migration extensions with the app
    # This connects our SQLAlchemy database to the Flask app
    db.init_app(app)  # Set up database connection
    migrate.init_app(app, db)  # Set up database migrations

    # Import and register our main blueprint
    # Blueprints help organize routes into logical groups
    from .routes import main_bp 
    app.register_blueprint(main_bp)
    
    # Import and register the authentication blueprint
    # This handles Google OAuth2 login/logout routes
    from .auth.routes import auth_bp
    app.register_blueprint(auth_bp)    # Import and register the calendar blueprint
    # This handles calendar-related routes (fetching events, etc.)
    from .calendars.routes import calendar_bp
    app.register_blueprint(calendar_bp)
    
    # Import and register the groups blueprint
    # This handles group creation, joining, and management routes
    from .groups.routes import groups_bp
    app.register_blueprint(groups_bp)
    
    # Import and register the availability blueprint
    # This handles calendar comparison and availability calculation routes
    from .availability.routes import availability_bp
    app.register_blueprint(availability_bp)    # Import models to ensure they are registered with SQLAlchemy
    # This must be done after db.init_app() but before first request
    from . import models

    # Return the configured Flask application
    return app