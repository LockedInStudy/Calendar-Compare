from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv() # load the variables from .env file
    app = Flask(__name__) # create a Flask app object

    app.config.from_object("app.config.Config") # load our custom settings/configs 

    # import our blueprint to handle routes and register it with the app ()
    from .routes import main_bp 
    app.register_blueprint(main_bp)

    return app