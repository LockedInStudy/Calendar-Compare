# filepath: backend/app/models.py
"""
Database models for the Calendar Compare application.

This file defines the database schema using SQLAlchemy ORM (Object-Relational Mapping).
"""

from datetime import datetime
import secrets
import string
from sqlalchemy import func

# Import db from current package
from . import db


class User(db.Model):
    """User model for storing user account information."""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    memberships = db.relationship('GroupMembership', back_populates='user', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def get_groups(self):
        """Get all groups this user is a member of."""
        return [membership.group for membership in self.memberships]


class Group(db.Model):
    """Group model for calendar comparison groups."""
    __tablename__ = 'group'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    join_code = db.Column(db.String(8), unique=True, nullable=False, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    max_members = db.Column(db.Integer, default=50)
    
    # Relationships
    created_by = db.relationship('User', backref='created_groups')
    memberships = db.relationship('GroupMembership', back_populates='group', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Group, self).__init__(**kwargs)
        if not self.join_code:
            self.join_code = self.generate_join_code()
    
    @staticmethod
    def generate_join_code():
        """Generate a unique 8-character join code."""
        while True:
            characters = string.ascii_uppercase + string.digits
            code = ''.join(secrets.choice(characters) for i in range(8))
            if not Group.query.filter_by(join_code=code).first():
                return code
    
    def __repr__(self):
        return f'<Group {self.name} ({self.join_code})>'
    
    def to_dict(self, include_members=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'join_code': self.join_code,
            'created_by_id': self.created_by_id,
            'created_by_name': self.created_by.name if self.created_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'max_members': self.max_members,
            'member_count': len(self.memberships)
        }
        
        if include_members:
            data['members'] = [membership.to_dict() for membership in self.memberships]
        
        return data
    
    def get_members(self):
        """Get all users who are members of this group."""
        return [membership.user for membership in self.memberships]
    
    def is_member(self, user):
        """Check if a user is a member of this group."""
        return any(membership.user_id == user.id for membership in self.memberships)
    
    def can_join(self):
        """Check if new members can join this group."""
        return self.is_active and len(self.memberships) < self.max_members


class GroupMembership(db.Model):
    """Junction table for User-Group many-to-many relationship."""
    __tablename__ = 'group_membership'
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), primary_key=True)
    role = db.Column(db.String(20), default='member', nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True)
    
    # Relationships
    user = db.relationship('User', back_populates='memberships')
    group = db.relationship('Group', back_populates='memberships')
    
    def __repr__(self):
        return f'<Membership: User {self.user_id} in Group {self.group_id}>'
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'group_id': self.group_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'is_active': self.is_active,
            'email_notifications': self.email_notifications,
            'user': {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email,
                'profile_picture': self.user.profile_picture
            } if self.user else None
        }
    
    def is_owner(self):
        """Check if this membership represents the group owner."""
        return self.role == 'owner'
    
    def is_admin(self):
        """Check if this membership has admin privileges."""
        return self.role in ['owner', 'admin']


# Helper functions
def get_or_create_user(google_id, email, name, profile_picture=None):
    """Get existing user or create new one from Google OAuth data."""
    user = User.query.filter_by(google_id=google_id).first()
    
    if user:
        user.last_login = datetime.utcnow()
        user.name = name
        user.email = email
        if profile_picture:
            user.profile_picture = profile_picture
        db.session.commit()
        return user, False
    else:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            profile_picture=profile_picture
        )
        db.session.add(user)
        db.session.commit()
        return user, True


def create_group_with_owner(name, description, owner_user):
    """Create a new group with the specified user as owner."""
    group = Group(
        name=name,
        description=description,
        created_by_id=owner_user.id
    )
    db.session.add(group)
    db.session.flush()
    
    membership = GroupMembership(
        user_id=owner_user.id,
        group_id=group.id,
        role='owner'
    )
    db.session.add(membership)
    db.session.commit()
    
    return group
