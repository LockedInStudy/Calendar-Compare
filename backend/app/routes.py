from flask import Blueprint, jsonify # jsonify could be useful later

main_bp = Blueprint('main', __name__)

# when you go to the url/example, it calls this function
@main_bp.route('/example')
def example_func():
    return "hello world"

@main_bp.route('/') 
def home():
    return "Welcome to Calendar Compare"
