# Calendar services module
# This file contains functions to interact with Google Calendar API

# Import necessary libraries
from googleapiclient.discovery import build  # For building Google API service
from datetime import datetime, timedelta  # For handling dates and times
import pytz  # For timezone handling

class CalendarService:
    """
    A service class to handle Google Calendar operations
    This class provides methods to fetch and process calendar events
    """
    
    def __init__(self, credentials):
        """
        Initialize the calendar service with user credentials
        
        Args:
            credentials: Google OAuth2 credentials for the user
        """
        self.credentials = credentials
        # Build the Google Calendar API service
        self.service = build('calendar', 'v3', credentials=credentials)
    
    def get_events(self, calendar_id='primary', max_results=10, days_ahead=30):
        """
        Fetch calendar events for the user
        
        Args:
            calendar_id (str): Which calendar to fetch from ('primary' = main calendar)
            max_results (int): Maximum number of events to return
            days_ahead (int): How many days in the future to look for events
            
        Returns:
            list: List of calendar events, or empty list if error
        """
        try:
            # Calculate the time range for fetching events
            # Get current time in UTC (Coordinated Universal Time)
            now = datetime.utcnow()
            
            # Calculate end time (now + days_ahead)
            end_time = now + timedelta(days=days_ahead)
            
            # Format times in RFC3339 format (required by Google Calendar API)
            # This format looks like: 2023-12-25T10:00:00Z
            time_min = now.isoformat() + 'Z'  # 'Z' indicates UTC time
            time_max = end_time.isoformat() + 'Z'
            
            print(f"Fetching events from {time_min} to {time_max}")
            
            # Call the Google Calendar API to get events
            events_result = self.service.events().list(
                calendarId=calendar_id,      # Which calendar to use
                timeMin=time_min,            # Start time for event search
                timeMax=time_max,            # End time for event search
                maxResults=max_results,       # Maximum number of events
                singleEvents=True,           # Expand recurring events
                orderBy='startTime'          # Sort events by start time
            ).execute()
            
            # Extract the events from the API response
            events = events_result.get('items', [])
            
            print(f"Found {len(events)} events")
            
            # Process and clean up the events data
            processed_events = []
            for event in events:
                processed_event = self._process_event(event)
                if processed_event:  # Only add if processing was successful
                    processed_events.append(processed_event)
            
            return processed_events
            
        except Exception as e:
            # If something goes wrong, log the error and return empty list
            print(f"Error fetching calendar events: {e}")
            return []
    
    def _process_event(self, event):
        """
        Process and clean up a single calendar event
        This converts the raw Google Calendar event into a cleaner format
        
        Args:
            event (dict): Raw event data from Google Calendar API
            
        Returns:
            dict: Processed event data, or None if processing failed
        """
        try:
            # Extract basic event information
            processed = {
                'id': event.get('id', ''),
                'summary': event.get('summary', 'No Title'),  # Event title
                'description': event.get('description', ''),   # Event description
                'location': event.get('location', ''),         # Event location
                'status': event.get('status', 'confirmed'),    # Event status
            }
            
            # Process start time
            start = event.get('start', {})
            processed['start'] = self._process_datetime(start)
            
            # Process end time
            end = event.get('end', {})
            processed['end'] = self._process_datetime(end)
            
            # Determine if this is an all-day event
            # All-day events have 'date' field instead of 'dateTime'
            processed['all_day'] = 'date' in start
            
            # Calculate duration in minutes (useful for availability calculations)
            if processed['start'] and processed['end']:
                start_dt = datetime.fromisoformat(processed['start'].replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(processed['end'].replace('Z', '+00:00'))
                duration = end_dt - start_dt
                processed['duration_minutes'] = int(duration.total_seconds() / 60)
            else:
                processed['duration_minutes'] = 0
            
            # Add attendees information if available
            attendees = event.get('attendees', [])
            processed['attendees_count'] = len(attendees)
            
            # Add creator information
            creator = event.get('creator', {})
            processed['creator_email'] = creator.get('email', '')
            
            return processed
            
        except Exception as e:
            print(f"Error processing event: {e}")
            return None
    
    def _process_datetime(self, datetime_obj):
        """
        Process datetime from Google Calendar format to ISO format
        
        Args:
            datetime_obj (dict): Datetime object from Google Calendar
            
        Returns:
            str: ISO formatted datetime string
        """
        try:
            # Google Calendar can provide datetime in two formats:
            # 1. 'dateTime' for specific times (e.g., "2023-12-25T10:00:00-08:00")
            # 2. 'date' for all-day events (e.g., "2023-12-25")
            
            if 'dateTime' in datetime_obj:
                # This is a specific time
                return datetime_obj['dateTime']
            elif 'date' in datetime_obj:
                # This is an all-day event - convert to datetime format
                date_str = datetime_obj['date']
                # Add time component to make it a full datetime
                return f"{date_str}T00:00:00Z"
            else:
                # Fallback if neither format is present
                return None
                
        except Exception as e:
            print(f"Error processing datetime: {e}")
            return None
    
    def get_busy_times(self, calendar_id='primary', days_ahead=30):
        """
        Get a list of time ranges when the user is busy
        This is useful for finding free time slots
        
        Args:
            calendar_id (str): Which calendar to check
            days_ahead (int): How many days ahead to check
            
        Returns:
            list: List of busy time ranges
        """
        try:
            # Get all events
            events = self.get_events(calendar_id, max_results=100, days_ahead=days_ahead)
            
            busy_times = []
            for event in events:
                # Skip all-day events (they don't block specific times)
                if event.get('all_day', False):
                    continue
                
                # Only include confirmed events
                if event.get('status') != 'confirmed':
                    continue
                
                # Add the busy time range
                if event.get('start') and event.get('end'):
                    busy_times.append({
                        'start': event['start'],
                        'end': event['end'],
                        'summary': event.get('summary', 'Busy')
                    })
            
            # Sort busy times by start time
            busy_times.sort(key=lambda x: x['start'])
            
            return busy_times
            
        except Exception as e:
            print(f"Error getting busy times: {e}")
            return []
