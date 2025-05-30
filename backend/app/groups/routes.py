# filepath: backend/app/groups/routes.py
"""
Group management routes for the Calendar Compare application.

This module handles all group-related HTTP endpoints:
- Creating new groups
- Joining groups via join codes
- Viewing group details and members
- Managing group settings

Key concepts for beginners:
- Blueprint: A way to organize related routes
- JSON API: Routes that accept/return JSON data instead of HTML
- Authentication: Checking if user is logged in before allowing actions
- Database transactions: Making sure related changes succeed or fail together
"""

from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User, Group, GroupMembership, get_or_create_user, create_group_with_owner
from functools import wraps

# Create the groups blueprint
# This groups all group-related routes under the '/groups' URL prefix
groups_bp = Blueprint('groups', __name__, url_prefix='/groups')


def login_required(f):
    """
    Decorator function that checks if user is logged in.
    
    A decorator is a function that wraps another function to add functionality.
    This decorator checks if the user has a valid session before allowing
    access to protected routes.
    
    Args:
        f: The function to be wrapped
        
    Returns:
        The wrapped function that includes authentication checking
    """
    @wraps(f)  # Preserves the original function's metadata
    def decorated_function(*args, **kwargs):
        # Check if user is logged in by looking for user_id in session
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find the user in the database
        user = User.query.get(session['user_id'])
        if not user:
            # User ID in session but user doesn't exist in database
            session.clear()  # Clear invalid session
            return jsonify({'error': 'Invalid session'}), 401
        
        # Add user to request context so routes can access it
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function


@groups_bp.route('', methods=['GET'])
@login_required
def get_user_groups():
    """
    Get all groups that the current user is a member of.
    
    Returns JSON list of groups with basic information.
    This is useful for displaying a user's group list on the frontend.
    
    Returns:
        JSON response with list of groups or error message
    """
    try:
        user = request.current_user
        
        # Get all groups the user is a member of
        groups = user.get_groups()
        
        # Convert groups to dictionary format for JSON response
        groups_data = []
        for group in groups:
            group_dict = group.to_dict()
            
            # Add user's role in this group
            membership = GroupMembership.query.filter_by(
                user_id=user.id, 
                group_id=group.id
            ).first()
            group_dict['user_role'] = membership.role if membership else 'member'
            
            groups_data.append(group_dict)
        
        return jsonify({
            'success': True,
            'groups': groups_data
        })
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error getting user groups: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve groups'
        }), 500


@groups_bp.route('', methods=['POST'])
@login_required
def create_group():
    """
    Create a new group with the current user as owner.
    
    Expected JSON payload:
    {
        "name": "Group Name",
        "description": "Optional description"
    }
    
    Returns:
        JSON response with new group data or error message
    """
    try:
        user = request.current_user
        data = request.get_json()
        
        # Validate required fields
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Group name is required'
            }), 400
        
        name = data['name'].strip()
        if not name:
            return jsonify({
                'success': False,
                'error': 'Group name cannot be empty'
            }), 400
        
        # Optional description
        description = data.get('description', '').strip()
        
        # Create the group with the current user as owner
        group = create_group_with_owner(name, description, user)
        
        return jsonify({
            'success': True,
            'message': 'Group created successfully',
            'group': group.to_dict(include_members=True)
        }), 201
        
    except Exception as e:
        # Rollback database changes if something went wrong
        db.session.rollback()
        print(f"Error creating group: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create group'
        }), 500


@groups_bp.route('/join', methods=['POST'])
@login_required
def join_group():
    """
    Join a group using a join code.
    
    Expected JSON payload:
    {
        "join_code": "ABC123XY"
    }
    
    Returns:
        JSON response with group data or error message
    """
    try:
        user = request.current_user
        data = request.get_json()
        
        # Validate join code
        if not data or 'join_code' not in data:
            return jsonify({
                'success': False,
                'error': 'Join code is required'
            }), 400
        
        join_code = data['join_code'].strip().upper()
        if not join_code:
            return jsonify({
                'success': False,
                'error': 'Join code cannot be empty'
            }), 400
        
        # Find the group by join code
        group = Group.query.filter_by(join_code=join_code).first()
        if not group:
            return jsonify({
                'success': False,
                'error': 'Invalid join code'
            }), 404
        
        # Check if group is accepting new members
        if not group.can_join():
            return jsonify({
                'success': False,
                'error': 'This group is not accepting new members'
            }), 400
        
        # Check if user is already a member
        if group.is_member(user):
            return jsonify({
                'success': False,
                'error': 'You are already a member of this group'
            }), 400
        
        # Create new membership
        membership = GroupMembership(
            user_id=user.id,
            group_id=group.id,
            role='member'
        )
        db.session.add(membership)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully joined group "{group.name}"',
            'group': group.to_dict(include_members=True)
        })
        
    except Exception as e:
        # Rollback database changes if something went wrong
        db.session.rollback()
        print(f"Error joining group: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to join group'
        }), 500


@groups_bp.route('/<int:group_id>', methods=['GET'])
@login_required
def get_group_details(group_id):
    """
    Get detailed information about a specific group.
    
    Args:
        group_id (int): The ID of the group to retrieve
        
    Returns:
        JSON response with group details including members
    """
    try:
        user = request.current_user
        
        # Find the group
        group = Group.query.get(group_id)
        if not group:
            return jsonify({
                'success': False,
                'error': 'Group not found'
            }), 404
        
        # Check if user is a member of this group
        if not group.is_member(user):
            return jsonify({
                'success': False,
                'error': 'You are not a member of this group'
            }), 403
        
        # Get user's role in the group
        membership = GroupMembership.query.filter_by(
            user_id=user.id, 
            group_id=group.id
        ).first()
        
        group_data = group.to_dict(include_members=True)
        group_data['user_role'] = membership.role if membership else 'member'
        
        return jsonify({
            'success': True,
            'group': group_data
        })
        
    except Exception as e:
        print(f"Error getting group details: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve group details'
        }), 500


@groups_bp.route('/<int:group_id>/leave', methods=['POST'])
@login_required
def leave_group(group_id):
    """
    Leave a group (remove membership).
    
    Args:
        group_id (int): The ID of the group to leave
        
    Returns:
        JSON response indicating success or failure
    """
    try:
        user = request.current_user
        
        # Find the group
        group = Group.query.get(group_id)
        if not group:
            return jsonify({
                'success': False,
                'error': 'Group not found'
            }), 404
        
        # Find user's membership
        membership = GroupMembership.query.filter_by(
            user_id=user.id, 
            group_id=group.id
        ).first()
        
        if not membership:
            return jsonify({
                'success': False,
                'error': 'You are not a member of this group'
            }), 400
        
        # Check if user is the owner
        if membership.is_owner():
            # Count other members
            other_members = GroupMembership.query.filter(
                GroupMembership.group_id == group.id,
                GroupMembership.user_id != user.id
            ).count()
            
            if other_members > 0:
                return jsonify({
                    'success': False,
                    'error': 'Cannot leave group as owner while other members exist. Transfer ownership first.'
                }), 400
            else:
                # Last member and owner - delete the entire group
                db.session.delete(group)
                db.session.commit()
                return jsonify({
                    'success': True,
                    'message': 'Group deleted successfully (you were the last member)'
                })
        
        # Remove membership
        db.session.delete(membership)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Left group "{group.name}" successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error leaving group: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to leave group'
        }), 500


@groups_bp.route('/<int:group_id>/members/<int:user_id>', methods=['DELETE'])
@login_required
def remove_member(group_id, user_id):
    """
    Remove a member from the group (admin/owner only).
    
    Args:
        group_id (int): The ID of the group
        user_id (int): The ID of the user to remove
        
    Returns:
        JSON response indicating success or failure
    """
    try:
        current_user = request.current_user
        
        # Find the group
        group = Group.query.get(group_id)
        if not group:
            return jsonify({
                'success': False,
                'error': 'Group not found'
            }), 404
        
        # Check if current user has admin privileges
        current_membership = GroupMembership.query.filter_by(
            user_id=current_user.id, 
            group_id=group.id
        ).first()
        
        if not current_membership or not current_membership.is_admin():
            return jsonify({
                'success': False,
                'error': 'You do not have permission to remove members'
            }), 403
        
        # Find the membership to remove
        target_membership = GroupMembership.query.filter_by(
            user_id=user_id, 
            group_id=group.id
        ).first()
        
        if not target_membership:
            return jsonify({
                'success': False,
                'error': 'User is not a member of this group'
            }), 400
        
        # Prevent removing the owner
        if target_membership.is_owner():
            return jsonify({
                'success': False,
                'error': 'Cannot remove the group owner'
            }), 400
        
        # Remove the membership
        user_name = target_membership.user.name
        db.session.delete(target_membership)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Removed {user_name} from the group'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing member: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to remove member'
        }), 500
