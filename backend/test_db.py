#!/usr/bin/env python3
"""
Database Testing Script
This script tests the database schema and verifies all tables are properly created.
"""

from app import create_app
from app.models import db, User, Group, GroupMembership

def test_database_schema():
    """Test and display database schema information"""
    app = create_app()
    
    with app.app_context():
        print("=== Database Schema Test ===")
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print()
        
        # Check if tables exist
        tables = [table.name for table in db.metadata.tables.values()]
        print(f"Database tables: {tables}")
        print()
        
        # Check User table structure
        print("User table columns:")
        for col in User.__table__.columns:
            print(f"  - {col.name}: {col.type}")
        print()
        
        # Check Group table structure
        print("Group table columns:")
        for col in Group.__table__.columns:
            print(f"  - {col.name}: {col.type}")
        print()
        
        # Check GroupMembership table structure
        print("GroupMembership table columns:")
        for col in GroupMembership.__table__.columns:
            print(f"  - {col.name}: {col.type}")
        print()
        
        # Test creating sample data (for testing purposes)
        print("=== Testing Sample Data Creation ===")
        
        # Check if we can query the tables (they should be empty initially)
        user_count = User.query.count()
        group_count = Group.query.count()
        membership_count = GroupMembership.query.count()
        
        print(f"Current data counts:")
        print(f"  - Users: {user_count}")
        print(f"  - Groups: {group_count}")
        print(f"  - Memberships: {membership_count}")
        print()
        
        print("✅ Database schema test completed successfully!")
        return True

if __name__ == "__main__":
    try:
        test_database_schema()
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
