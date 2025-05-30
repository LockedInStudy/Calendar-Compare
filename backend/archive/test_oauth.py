# Debug script to test Google OAuth credentials and configuration
# This will help us identify what's causing the OAuth error

import os
from dotenv import load_dotenv

# Load environment variables from .env file
# The .env file is in the parent directory (project root)
load_dotenv(dotenv_path="../.env", override=True)

def test_google_credentials():
    print("🔍 Testing Google OAuth Configuration...")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = "../.env"
    if os.path.exists(env_file):
        print("✅ .env file found")
    else:
        print("❌ .env file NOT found")
        return
    
    # Check environment variables
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    print(f"\n📋 Environment Variables:")
    print(f"GOOGLE_CLIENT_ID: {client_id[:20]}...{client_id[-10:] if client_id and len(client_id) > 30 else client_id}")
    print(f"GOOGLE_CLIENT_SECRET: {client_secret[:10]}...{client_secret[-5:] if client_secret and len(client_secret) > 15 else client_secret}")
    
    # Validate credentials format
    print(f"\n🔍 Credential Validation:")
    
    if client_id:
        if client_id.endswith('.apps.googleusercontent.com'):
            print("✅ Client ID format looks correct")
        else:
            print("❌ Client ID format looks incorrect - should end with .apps.googleusercontent.com")
    else:
        print("❌ GOOGLE_CLIENT_ID is empty or not set")
    
    if client_secret:
        if client_secret.startswith('GOCSPX-'):
            print("✅ Client Secret format looks correct")
        else:
            print("❌ Client Secret format looks incorrect - should start with GOCSPX-")
    else:
        print("❌ GOOGLE_CLIENT_SECRET is empty or not set")
    
    # Test OAuth flow creation
    print(f"\n🧪 Testing OAuth Flow Creation:")
    try:
        from app.auth.google import GoogleAuth
        google_auth = GoogleAuth()
        
        # Test creating flow
        redirect_uri = "http://localhost:5000/auth/callback"
        flow = google_auth.create_flow(redirect_uri)
        
        print("✅ OAuth flow created successfully")
        print(f"   - Client ID in flow: {flow.client_config['client_id'][:20]}...")
        print(f"   - Redirect URI: {flow.redirect_uri}")
        
        # Test getting auth URL
        auth_url = google_auth.get_authorization_url(redirect_uri)
        print(f"✅ Authorization URL generated: {auth_url[:50]}...")
        
    except Exception as e:
        print(f"❌ Error creating OAuth flow: {e}")
        print(f"   Error type: {type(e).__name__}")
    
    print(f"\n📊 Summary:")
    if client_id and client_secret and client_id.endswith('.apps.googleusercontent.com') and client_secret.startswith('GOCSPX-'):
        print("✅ Credentials appear to be correctly formatted")
        print("\n🔧 If you're still getting 401 errors, check:")
        print("   1. Google Cloud Console project is correct")
        print("   2. OAuth consent screen is configured")
        print("   3. Redirect URI exactly matches: http://localhost:5000/auth/callback")
        print("   4. Google Calendar API is enabled")
        print("   5. Your email is added to test users (if using External app)")
    else:
        print("❌ Credentials have formatting issues - please check Google Cloud Console")

if __name__ == "__main__":
    test_google_credentials()
