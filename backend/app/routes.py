# Import necessary components from Flask
# Blueprint: helps organize routes into separate modules
# jsonify: converts Python dictionaries to JSON format for API responses
from flask import Blueprint, jsonify

# Create a Blueprint - think of this as a collection of routes that we can register with our Flask app
# 'main' is the name of this blueprint, __name__ tells Flask where to find it
main_bp = Blueprint('main', __name__)

# Route decorator: @main_bp.route() tells Flask "when someone visits this URL, run this function"
# This is our home page route - when someone visits the root URL (/), they'll see this message
@main_bp.route('/') 
def home():
    """
    Home page route - returns a simple welcome message
    This function runs when someone visits http://localhost:5000/
    """
    return "Welcome to Calendar Compare"

# Example route to show how routes work
# When someone visits /example, this function runs
@main_bp.route('/example')
def example_func():
    """
    Example route to demonstrate basic Flask routing
    Returns a simple hello world message
    """
    return "hello world"

# Ping route for testing if the backend server is running
# This is commonly used to check if the API is alive and responding
@main_bp.route('/ping')
def ping():
    """
    Ping route for health checking
    Returns a JSON response to confirm the server is running
    Frontend applications can call this to test connectivity
    """
    # Create a Python dictionary with our response data
    response_data = {
        "message": "pong",  # Simple response to show server is alive
        "status": "success"  # Indicates everything is working
    }
    
    # jsonify() converts our Python dictionary into JSON format
    # JSON is the standard format for sending data between web applications
    return jsonify(response_data)
