# Calendar routes module
# This file contains Flask routes for calendar-related operations

# Import Flask components
from flask import Blueprint, session, jsonify
# Import our authentication and calendar services
from ..auth.google import GoogleAuth
from .services import CalendarService

# Create a blueprint for calendar routes
calendar_bp = Blueprint('calendar', __name__, url_prefix='/calendar')

# Create an instance of our GoogleAuth class
google_auth = GoogleAuth()

@calendar_bp.route('/events')
def get_events():
    """
    Get the user's calendar events
    This route fetches the next 10 events from the user's Google Calendar
    The user must be logged in for this to work
    """
    try:
        # Check if the user is logged in
        if not session.get('logged_in', False):
            return jsonify({
                'error': 'Not logged in',
                'message': 'Please log in with Google first'
            }), 401  # 401 = Unauthorized
        
        # Get the user's credentials from the session
        credentials_dict = session.get('credentials')
        if not credentials_dict:
            return jsonify({
                'error': 'No credentials found',
                'message': 'Please log in again'
            }), 401
        
        # Convert the credentials dictionary back to a credentials object
        credentials = google_auth.credentials_from_dict(credentials_dict)
        
        # Create a calendar service instance
        calendar_service = CalendarService(credentials)
        
        # Fetch the user's events
        # Get next 10 events from the next 30 days
        events = calendar_service.get_events(
            calendar_id='primary',  # Use the user's primary calendar
            max_results=10,         # Get up to 10 events
            days_ahead=30          # Look 30 days into the future
        )
        
        # Return the events as JSON
        return jsonify({
            'status': 'success',
            'events': events,
            'count': len(events),
            'message': f'Found {len(events)} upcoming events'
        })
        
    except Exception as e:
        # If something goes wrong, return an error
        print(f"Error fetching events: {e}")
        return jsonify({
            'error': 'Failed to fetch events',
            'message': str(e)
        }), 500  # 500 = Internal Server Error

@calendar_bp.route('/busy-times')
def get_busy_times():
    """
    Get the user's busy times
    This returns time ranges when the user has events (is busy)
    Useful for finding free time slots
    """
    try:
        # Check if the user is logged in
        if not session.get('logged_in', False):
            return jsonify({
                'error': 'Not logged in',
                'message': 'Please log in with Google first'
            }), 401
        
        # Get the user's credentials from the session
        credentials_dict = session.get('credentials')
        if not credentials_dict:
            return jsonify({
                'error': 'No credentials found',
                'message': 'Please log in again'
            }), 401
        
        # Convert the credentials dictionary back to a credentials object
        credentials = google_auth.credentials_from_dict(credentials_dict)
        
        # Create a calendar service instance
        calendar_service = CalendarService(credentials)
        
        # Get the user's busy times
        busy_times = calendar_service.get_busy_times(
            calendar_id='primary',  # Use the user's primary calendar
            days_ahead=30          # Look 30 days into the future
        )
        
        # Return the busy times as JSON
        return jsonify({
            'status': 'success',
            'busy_times': busy_times,
            'count': len(busy_times),
            'message': f'Found {len(busy_times)} busy time slots'
        })
        
    except Exception as e:
        # If something goes wrong, return an error
        print(f"Error fetching busy times: {e}")
        return jsonify({
            'error': 'Failed to fetch busy times',
            'message': str(e)
        }), 500

@calendar_bp.route('/calendars')
def get_calendars():
    """
    Get a list of the user's calendars
    This shows all calendars the user has access to (not just the primary one)
    """
    try:
        # Check if the user is logged in
        if not session.get('logged_in', False):
            return jsonify({
                'error': 'Not logged in',
                'message': 'Please log in with Google first'
            }), 401
        
        # Get the user's credentials from the session
        credentials_dict = session.get('credentials')
        if not credentials_dict:
            return jsonify({
                'error': 'No credentials found',
                'message': 'Please log in again'
            }), 401
        
        # Convert the credentials dictionary back to a credentials object
        credentials = google_auth.credentials_from_dict(credentials_dict)
        
        # Create a calendar service instance
        calendar_service = CalendarService(credentials)
        
        # Get the list of calendars
        # This uses the Google Calendar API directly since it's a simple call
        calendars_result = calendar_service.service.calendarList().list().execute()
        calendars = calendars_result.get('items', [])
        
        # Process the calendars to include only relevant information
        processed_calendars = []
        for calendar in calendars:
            processed_calendars.append({
                'id': calendar.get('id', ''),
                'summary': calendar.get('summary', 'Untitled Calendar'),
                'description': calendar.get('description', ''),
                'primary': calendar.get('primary', False),
                'access_role': calendar.get('accessRole', 'reader'),
                'selected': calendar.get('selected', True),
                'color_id': calendar.get('colorId', '1')
            })
        
        # Return the calendars as JSON
        return jsonify({
            'status': 'success',
            'calendars': processed_calendars,
            'count': len(processed_calendars),
            'message': f'Found {len(processed_calendars)} calendars'
        })
        
    except Exception as e:
        # If something goes wrong, return an error
        print(f"Error fetching calendars: {e}")
        return jsonify({
            'error': 'Failed to fetch calendars',
            'message': str(e)
        }), 500
