# Authentication routes for Google OAuth2
# This file contains the Flask routes that handle user login and OAuth2 callback

# Import Flask components
from flask import Blueprint, request, redirect, session, jsonify, url_for
# Import our Google authentication class
from .google import GoogleAuth
import os

# Create a blueprint for authentication routes
# Blueprints help organize related routes together
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Create an instance of our GoogleAuth class
google_auth = GoogleAuth()

@auth_bp.route('/login')
def login():
    """
    Start the Google OAuth2 login process
    When a user visits /auth/login, this function runs
    It redirects the user to Google's login page
    """
    try:
        # Construct the callback URL where Google will send the user after login
        # This must match exactly what we configure in Google Cloud Console
        redirect_uri = url_for('auth.callback', _external=True)
        
        # Get the Google authorization URL
        # This is the URL where users will log in with their Google account
        auth_url = google_auth.get_authorization_url(redirect_uri)
        
        # Store the redirect URI in the session for later use
        # Sessions are a way to store data between requests for the same user
        session['redirect_uri'] = redirect_uri
        
        # Redirect the user to Google's login page
        return redirect(auth_url)
        
    except Exception as e:
        # If something goes wrong, return an error message
        print(f"Error in login route: {e}")
        return jsonify({
            'error': 'Failed to initiate login process',
            'message': str(e)
        }), 500

@auth_bp.route('/callback')
def callback():
    """
    Handle the callback from Google after user login
    Google redirects the user here after they log in
    This route exchanges the authorization code for actual credentials
    """
    try:
        # Get the authorization code from the URL parameters
        # Google adds this code to the URL when they redirect the user back
        code = request.args.get('code')
        
        # Check if we received the code
        if not code:
            return jsonify({
                'error': 'No authorization code received',
                'message': 'Google did not provide an authorization code'
            }), 400
        
        # Get the redirect URI from the session
        redirect_uri = session.get('redirect_uri')
        if not redirect_uri:
            return jsonify({
                'error': 'No redirect URI in session',
                'message': 'Session may have expired'
            }), 400
        
        # Exchange the code for credentials
        credentials = google_auth.exchange_code_for_credentials(code, redirect_uri)
        
        if not credentials:
            return jsonify({
                'error': 'Failed to exchange code for credentials',
                'message': 'Google authentication failed'
            }), 400
        
        # Store the credentials in the session
        # Convert credentials to dictionary format for easy storage
        session['credentials'] = google_auth.credentials_to_dict(credentials)
        
        # Mark the user as logged in
        session['logged_in'] = True
        
        # For now, return a simple success message
        # In a real app, you might redirect to a dashboard page
        return jsonify({
            'message': 'Login successful!',
            'status': 'success',
            'user_logged_in': True
        })
        
    except Exception as e:
        # If something goes wrong, return an error message
        print(f"Error in callback route: {e}")
        return jsonify({
            'error': 'Login callback failed',
            'message': str(e)
        }), 500

@auth_bp.route('/logout')
def logout():
    """
    Log out the current user
    This clears all authentication data from the session
    """
    try:
        # Clear all authentication-related data from the session
        session.pop('credentials', None)  # Remove stored credentials
        session.pop('logged_in', None)    # Remove login status
        session.pop('redirect_uri', None) # Remove redirect URI
        
        return jsonify({
            'message': 'Logged out successfully',
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error in logout route: {e}")
        return jsonify({
            'error': 'Logout failed',
            'message': str(e)
        }), 500

@auth_bp.route('/status')
def status():
    """
    Check if the user is currently logged in
    Returns the current authentication status
    """
    try:
        # Check if the user has valid credentials in their session
        is_logged_in = session.get('logged_in', False)
        has_credentials = 'credentials' in session
        
        return jsonify({
            'logged_in': is_logged_in,
            'has_credentials': has_credentials,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error in status route: {e}")
        return jsonify({
            'error': 'Failed to check status',
            'message': str(e)
        }), 500
