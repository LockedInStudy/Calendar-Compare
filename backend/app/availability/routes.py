"""
Availability API routes for Calendar Compare.

This module provides HTTP endpoints for calculating and retrieving
group availability information. These endpoints integrate with the
availability services to provide calendar comparison functionality.

Available endpoints:
- GET /api/availability/groups/<id> - Get group availability
- GET /api/availability/users/<id> - Get individual user availability  
- POST /api/availability/groups/<id>/suggest - Get meeting suggestions
- GET /api/availability/groups/<id>/members - Get member availability breakdown
"""

from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
import pytz
from functools import wraps

from app.models import User, Group, GroupMembership
from .services import GroupAvailabilityService

# Create the availability blueprint
availability_bp = Blueprint('availability', __name__, url_prefix='/api/availability')

# Initialize the service
availability_service = GroupAvailabilityService()


def login_required(f):
    """Decorator to require user authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            session.clear()
            return jsonify({'error': 'Invalid session'}), 401
        
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function


def validate_group_access(f):
    """Decorator to validate user has access to the group."""
    @wraps(f)
    def decorated_function(group_id, *args, **kwargs):
        user = request.current_user
        group = Group.query.get(group_id)
        
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        if not group.is_member(user):
            return jsonify({'error': 'Access denied'}), 403
        
        request.current_group = group
        return f(group_id, *args, **kwargs)
    
    return decorated_function


@availability_bp.route('/groups/<int:group_id>', methods=['GET'])
@login_required
@validate_group_access
def get_group_availability(group_id):
    """
    Get availability analysis for all members of a group.
    
    Query Parameters:
    - start_date (required): ISO format date string (YYYY-MM-DD)
    - end_date (required): ISO format date string (YYYY-MM-DD) 
    - min_duration (optional): Minimum meeting duration in minutes (default: 30)
    - members (optional): Comma-separated list of member IDs to include
    
    Returns:
        JSON response with group availability analysis
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        min_duration = int(request.args.get('min_duration', 30))
        members_str = request.args.get('members')
        
        # Validate required parameters
        if not start_date_str or not end_date_str:
            return jsonify({
                'success': False,
                'error': 'start_date and end_date parameters are required'
            }), 400
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            # Ensure dates are in UTC
            if start_date.tzinfo is None:
                start_date = pytz.UTC.localize(start_date)
            if end_date.tzinfo is None:
                end_date = pytz.UTC.localize(end_date)
                
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Validate date range
        if start_date >= end_date:
            return jsonify({
                'success': False,
                'error': 'start_date must be before end_date'
            }), 400
        
        # Limit analysis period to prevent performance issues
        max_days = 30
        if (end_date - start_date).days > max_days:
            return jsonify({
                'success': False,
                'error': f'Analysis period cannot exceed {max_days} days'
            }), 400
        
        # Parse member filter if provided
        member_ids = None
        if members_str:
            try:
                member_ids = [int(id.strip()) for id in members_str.split(',')]
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid member IDs format'
                }), 400
        
        # Calculate availability
        result = availability_service.get_group_availability(
            group_id=group_id,
            start_date=start_date,
            end_date=end_date,
            min_duration_minutes=min_duration,
            member_ids=member_ids
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@availability_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user_availability(user_id):
    """
    Get availability analysis for a specific user.
    
    Query Parameters:
    - start_date (required): ISO format date string
    - end_date (required): ISO format date string
    - min_duration (optional): Minimum slot duration in minutes (default: 30)
    
    Returns:
        JSON response with individual user availability
    """
    try:
        # Check if user can access this user's availability
        current_user = request.current_user
        if user_id != current_user.id:
            # Check if they share any groups
            target_user = User.query.get(user_id)
            if not target_user:
                return jsonify({'error': 'User not found'}), 404
            
            # Check for shared group membership
            current_groups = set(g.id for g in current_user.get_groups())
            target_groups = set(g.id for g in target_user.get_groups())
            
            if not current_groups.intersection(target_groups):
                return jsonify({'error': 'Access denied'}), 403
        
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        min_duration = int(request.args.get('min_duration', 30))
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'success': False,
                'error': 'start_date and end_date parameters are required'
            }), 400
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            if start_date.tzinfo is None:
                start_date = pytz.UTC.localize(start_date)
            if end_date.tzinfo is None:
                end_date = pytz.UTC.localize(end_date)
                
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Calculate individual availability
        result = availability_service.get_member_individual_availability(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            min_duration_minutes=min_duration
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@availability_bp.route('/groups/<int:group_id>/suggest', methods=['POST'])
@login_required
@validate_group_access
def suggest_meeting_times(group_id):
    """
    Get meeting time suggestions for a group.
    
    Request Body (JSON):
    {
        "start_date": "2024-01-15T00:00:00Z",
        "end_date": "2024-01-19T23:59:59Z",
        "meeting_duration_minutes": 60,
        "max_suggestions": 5
    }
    
    Returns:
        JSON response with suggested meeting times ranked by quality
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON request body required'
            }), 400
        
        # Extract and validate parameters
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        meeting_duration = data.get('meeting_duration_minutes', 60)
        max_suggestions = data.get('max_suggestions', 5)
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'success': False,
                'error': 'start_date and end_date are required'
            }), 400
        
        # Validate meeting duration
        if not isinstance(meeting_duration, int) or meeting_duration < 15:
            return jsonify({
                'success': False,
                'error': 'meeting_duration_minutes must be at least 15'
            }), 400
        
        if meeting_duration > 480:  # 8 hours
            return jsonify({
                'success': False,
                'error': 'meeting_duration_minutes cannot exceed 480 (8 hours)'
            }), 400
        
        # Validate max suggestions
        if not isinstance(max_suggestions, int) or max_suggestions < 1:
            max_suggestions = 5
        max_suggestions = min(max_suggestions, 20)  # Cap at 20
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            if start_date.tzinfo is None:
                start_date = pytz.UTC.localize(start_date)
            if end_date.tzinfo is None:
                end_date = pytz.UTC.localize(end_date)
                
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Generate suggestions
        result = availability_service.suggest_meeting_times(
            group_id=group_id,
            start_date=start_date,
            end_date=end_date,
            meeting_duration_minutes=meeting_duration,
            max_suggestions=max_suggestions
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@availability_bp.route('/groups/<int:group_id>/members', methods=['GET'])
@login_required
@validate_group_access
def get_member_availability_breakdown(group_id):
    """
    Get individual availability breakdown for each group member.
    
    Query Parameters:
    - start_date (required): ISO format date string
    - end_date (required): ISO format date string
    - min_duration (optional): Minimum slot duration in minutes (default: 30)
    
    Returns:
        JSON response with per-member availability details
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        min_duration = int(request.args.get('min_duration', 30))
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'success': False,
                'error': 'start_date and end_date parameters are required'
            }), 400
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            if start_date.tzinfo is None:
                start_date = pytz.UTC.localize(start_date)
            if end_date.tzinfo is None:
                end_date = pytz.UTC.localize(end_date)
                
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Get group members
        group = request.current_group
        members = group.get_members()
        
        # Calculate individual availability for each member
        member_availability = []
        for member in members:
            availability = availability_service.get_member_individual_availability(
                user_id=member.id,
                start_date=start_date,
                end_date=end_date,
                min_duration_minutes=min_duration
            )
            member_availability.append(availability)
        
        return jsonify({
            'success': True,
            'group_id': group_id,
            'group_name': group.name,
            'analysis_period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'min_duration_minutes': min_duration
            },
            'member_availability': member_availability,
            'total_members': len(members)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@availability_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for the availability service.
    
    Returns:
        JSON response indicating service status
    """
    return jsonify({
        'success': True,
        'service': 'availability',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })


# Error handlers for the blueprint
@availability_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors for availability routes."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@availability_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for availability routes."""
    return jsonify({
        'success': False,
        'error': 'Method not allowed'
    }), 405
