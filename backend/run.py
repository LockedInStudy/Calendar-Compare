from app import create_app # import create_app function from app/__init__.py

app = create_app() # new Flask app object

if __name__ == "__main__":
    app.run(debug=True) 
