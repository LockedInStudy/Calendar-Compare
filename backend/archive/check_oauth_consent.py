# Google OAuth Consent Screen Status Checker
# This script helps debug OAuth consent screen configuration issues

import requests
import json

def check_oauth_status():
    print("🔍 Google OAuth Consent Screen Troubleshooting")
    print("=" * 55)
    
    print("\n📋 Error 403: access_denied Analysis:")
    print("This error means your Google OAuth app is in 'Testing' mode")
    print("and the user trying to log in is not in the approved test users list.")
    
    print("\n🔧 How to Fix:")
    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
    print("2. Select your project")
    print("3. Navigate to: APIs & Services → OAuth consent screen")
    print("4. Scroll to 'Test users' section")
    print("5. Click '+ ADD USERS'")
    print("6. Add your Gmail address")
    print("7. Click 'Save'")
    
    print("\n📧 Email to Add:")
    email = input("Enter the Gmail address you're trying to log in with: ")
    
    if email:
        print(f"\n✅ Add this email to test users: {email}")
        print("\nAfter adding, try logging in again.")
    
    print("\n🌍 Alternative - Publish App (for public use):")
    print("1. Complete all required fields in OAuth consent screen")
    print("2. Click 'PUBLISH APP'")
    print("3. Anyone can then use your app")
    
    print("\n⚠️  Note: Published apps may require Google verification")
    print("   for sensitive scopes, but calendar.readonly is usually fine.")
    
    print("\n🔄 After making changes:")
    print("1. Wait 5-10 minutes for changes to propagate")
    print("2. Clear browser cache/cookies")
    print("3. Try logging in again")

if __name__ == "__main__":
    check_oauth_status()
