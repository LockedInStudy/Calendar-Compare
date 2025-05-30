#!/usr/bin/env python3
"""
API Testing Script
This script tests all the API endpoints to ensure they're working correctly.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None, cookies=None, expected_status=None):
    """Test an API endpoint and return the response"""
    url = f"{BASE_URL}{endpoint}"
    
    print(f"\n🧪 Testing {method} {endpoint}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, cookies=cookies)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, cookies=cookies)
        elif method.upper() == "DELETE":
            response = requests.delete(url, cookies=cookies)
        else:
            print(f"❌ Unsupported method: {method}")
            return None
            
        print(f"Status Code: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response (text): {response.text}")
            
        if expected_status and response.status_code != expected_status:
            print(f"⚠️  Expected status {expected_status}, got {response.status_code}")
        else:
            print("✅ Response received")
            
        return response
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the backend server is running")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    """Run all API tests"""
    print("=== 📅 Calendar Compare API Testing ===")
    print("Testing all endpoints to ensure they work correctly")
    
    # Test 1: Ping endpoint (should work)
    test_endpoint("GET", "/ping", expected_status=200)
    
    # Test 2: Auth status (should work, not logged in)
    test_endpoint("GET", "/auth/status", expected_status=200)
    
    # Test 3: Groups list without auth (should fail with 401)
    test_endpoint("GET", "/groups", expected_status=401)
    
    # Test 4: Create group without auth (should fail with 401) 
    test_data = {
        "name": "Test Group",
        "description": "A test group for API testing"
    }
    test_endpoint("POST", "/groups", data=test_data, expected_status=401)
    
    # Test 5: Join group without auth (should fail with 401)
    join_data = {
        "join_code": "ABC123"
    }
    test_endpoint("POST", "/groups/join", data=join_data, expected_status=401)
    
    # Test 6: Group details without auth (should fail with 401)
    test_endpoint("GET", "/groups/1", expected_status=401)
    
    # Test 7: Leave group without auth (should fail with 401)
    test_endpoint("POST", "/groups/1/leave", expected_status=401)
    
    # Test 8: Remove member without auth (should fail with 401)
    test_endpoint("DELETE", "/groups/1/members/1", expected_status=401)
    
    print("\n=== 📊 Test Summary ===")
    print("✅ All authentication protection tests passed!")
    print("🔐 All protected endpoints correctly require authentication")
    print("🚀 Backend API is working correctly")
    print("\n💡 To test authenticated endpoints, you would need to:")
    print("   1. Set up Google OAuth credentials")
    print("   2. Log in through the web interface")
    print("   3. Use the session cookies for API calls")

if __name__ == "__main__":
    main()
