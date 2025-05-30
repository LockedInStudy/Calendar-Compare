"""
Database models for the Calendar Compare application.
"""

from datetime import datetime
import secrets
import string
from flask_sqlalchemy import SQLAlchemy

# This will be set by the app factory
db = None

def init_db(database):
    """Initialize the database instance"""
    global db
    db = database
