import os
from dotenv import load_dotenv

# Test different ways to load the .env file
print("Current working directory:", os.getcwd())
print("Script location:", __file__)
print("Script directory:", os.path.dirname(__file__))

# Try different paths
paths_to_try = [
    ".env",
    "../.env", 
    "../../.env",
    os.path.join(os.path.dirname(__file__), "..", ".env"),
    os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
]

for path in paths_to_try:
    full_path = os.path.abspath(path)
    exists = os.path.exists(path)
    print(f"Path: {path} -> {full_path} (exists: {exists})")
    
    if exists:
        print(f"  Trying to load from: {path}")
        load_dotenv(dotenv_path=path, override=True)
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET") 
        print(f"  GOOGLE_CLIENT_ID: {client_id}")
        print(f"  GOOGLE_CLIENT_SECRET: {client_secret}")
        break
