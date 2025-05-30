# Google OAuth2 authentication module
# This file handles all Google OAuth2 related functionality
# OAuth2 is a secure way to let users log in with their Google account

# Import necessary libraries for Google OAuth2
from google.auth.transport.requests import Request  # For making HTTP requests to Google
from google.oauth2.credentials import Credentials  # For storing user's OAuth credentials
from google_auth_oauthlib.flow import Flow  # For handling the OAuth2 flow
from googleapiclient.discovery import build  # For building Google API service objects
import os  # For accessing environment variables
from flask import current_app  # For accessing Flask app configuration

class GoogleAuth:
    """
    A class to handle Google OAuth2 authentication
    This class manages the entire process of getting user permission to access their Google Calendar
    """
    
    def __init__(self):
        """
        Initialize the GoogleAuth class
        Sets up the OAuth2 scopes (permissions) we need from the user
        """
        # Scopes define what permissions we're asking for from the user
        # 'calendar.readonly' means we only want to READ their calendar, not modify it
        # This is safer and users are more likely to approve read-only access
        self.SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
        
        # This will store the OAuth2 flow object once we create it
        self.flow = None
    
    def create_flow(self, redirect_uri):
        """
        Create an OAuth2 flow object
        
        Args:
            redirect_uri (str): The URL where Google should send the user after they log in
                               This should be our /callback route
        
        Returns:
            Flow: A Google OAuth2 flow object
        """
        # In a real application, you would get these credentials from Google Cloud Console
        # For now, we'll use placeholder values and expect them to be set in environment variables
        
        # These credentials tell Google who our application is
        # You get these when you create a project in Google Cloud Console
        client_config = {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID", "your-client-id-here"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "your-client-secret-here"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://www.googleapis.com/oauth2/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "redirect_uris": [redirect_uri]
            }
        }
        
        # Create the OAuth2 flow with our configuration
        self.flow = Flow.from_client_config(
            client_config,
            scopes=self.SCOPES
        )
        
        # Set the redirect URI (where Google sends the user after login)
        self.flow.redirect_uri = redirect_uri
        
        return self.flow
    
    def get_authorization_url(self, redirect_uri):
        """
        Get the URL where we should send the user to log in with Google
        
        Args:
            redirect_uri (str): Where Google should send the user after login
            
        Returns:
            str: The URL to redirect the user to for Google login
        """
        # Create the OAuth2 flow
        flow = self.create_flow(redirect_uri)
        
        # Generate the authorization URL
        # This is the Google login page with our app's information
        auth_url, _ = flow.authorization_url(
            # Ask for offline access so we can refresh tokens later
            access_type='offline',
            # Force the user to approve our app (good for development/testing)
            approval_prompt='force'
        )
        
        return auth_url
    
    def exchange_code_for_credentials(self, code, redirect_uri):
        """
        Exchange the authorization code for actual credentials
        After the user logs in, Google gives us a code. We exchange this code for credentials.
        
        Args:
            code (str): The authorization code from Google
            redirect_uri (str): The redirect URI (must match what we used earlier)
            
        Returns:
            Credentials: Google OAuth2 credentials object
        """
        try:
            # Create the flow again (we need to recreate it)
            flow = self.create_flow(redirect_uri)
            
            # Exchange the code for credentials
            # This actually gets us the access token we need to make API calls
            flow.fetch_token(code=code)
            
            # Return the credentials
            return flow.credentials
            
        except Exception as e:
            # If something goes wrong, log the error and return None
            print(f"Error exchanging code for credentials: {e}")
            return None
    
    def get_calendar_service(self, credentials):
        """
        Create a Google Calendar API service object
        This object lets us make calls to the Google Calendar API
        
        Args:
            credentials: Google OAuth2 credentials
            
        Returns:
            Resource: Google Calendar API service object
        """
        try:
            # Build the service object using the credentials
            # 'calendar' is the API name, 'v3' is the version
            service = build('calendar', 'v3', credentials=credentials)
            return service
            
        except Exception as e:
            # If something goes wrong, log the error and return None
            print(f"Error creating calendar service: {e}")
            return None
    
    def credentials_to_dict(self, credentials):
        """
        Convert credentials object to a dictionary for storage
        This makes it easier to store credentials in a session or database
        
        Args:
            credentials: Google OAuth2 credentials object
            
        Returns:
            dict: Dictionary representation of credentials
        """
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
    
    def credentials_from_dict(self, credentials_dict):
        """
        Create credentials object from a dictionary
        This is the reverse of credentials_to_dict()
        
        Args:
            credentials_dict (dict): Dictionary with credentials data
            
        Returns:
            Credentials: Google OAuth2 credentials object
        """
        return Credentials(
            token=credentials_dict['token'],
            refresh_token=credentials_dict.get('refresh_token'),
            token_uri=credentials_dict['token_uri'],
            client_id=credentials_dict['client_id'],
            client_secret=credentials_dict['client_secret'],
            scopes=credentials_dict['scopes']
        )
