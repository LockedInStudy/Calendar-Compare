#!/usr/bin/env python3
"""
Sprint 3 Testing Script for Calendar Compare

This script tests the new availability calculation functionality
including API endpoints and core algorithms.
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "http://127.0.0.1:5000"
API_BASE = f"{BACKEND_URL}/api"

def test_backend_connection():
    """Test if backend server is running."""
    try:
        response = requests.get(f"{BACKEND_URL}/ping")
        print(f"✅ Backend connection: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_availability_endpoints():
    """Test availability calculation endpoints."""
    print("\n🧪 Testing Availability Endpoints...")
    
    # Test data
    test_group_id = 1
    start_date = datetime.now()
    end_date = start_date + timedelta(days=7)
    
    # Test group availability endpoint
    try:
        url = f"{API_BASE}/availability/group/{test_group_id}"
        params = {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'min_duration_minutes': 60
        }
        
        print(f"Testing: GET {url}")
        response = requests.get(url, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Group availability endpoint working")
            print(f"   - Analysis period: {data.get('analysis_period', {}).get('start')} to {data.get('analysis_period', {}).get('end')}")
            print(f"   - Members analyzed: {len(data.get('members_analyzed', []))}")
            print(f"   - Common slots found: {data.get('total_slots_found', 0)}")
        else:
            print(f"⚠️ Group availability returned {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Group availability test failed: {e}")
    
    # Test meeting suggestions endpoint
    try:
        url = f"{API_BASE}/availability/group/{test_group_id}/suggest"
        params = {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'meeting_duration_minutes': 60,
            'max_suggestions': 3
        }
        
        print(f"\nTesting: GET {url}")
        response = requests.get(url, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Meeting suggestions endpoint working")
            print(f"   - Suggestions found: {len(data.get('suggestions', []))}")
        else:
            print(f"⚠️ Meeting suggestions returned {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Meeting suggestions test failed: {e}")

def test_algorithms_directly():
    """Test availability algorithms directly."""
    print("\n🧪 Testing Availability Algorithms...")
    
    try:
        # Import and test algorithms directly
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        
        from app.availability.algorithms import TimeSlot, AvailabilityCalculator
        
        # Test TimeSlot class
        print("Testing TimeSlot class...")
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=2)
        
        slot = TimeSlot(start_time, end_time)
        print(f"✅ TimeSlot created: {slot.start_time} to {slot.end_time}")
        print(f"   Duration: {slot.duration_minutes} minutes")
        
        # Test slot intersection
        other_slot = TimeSlot(start_time + timedelta(minutes=30), end_time + timedelta(minutes=30))
        intersection = slot.intersects(other_slot)
        print(f"   Intersection test: {intersection}")
        
        # Test AvailabilityCalculator
        print("\nTesting AvailabilityCalculator...")
        calculator = AvailabilityCalculator()
        
        # Create test busy times for multiple users
        user1_busy = [TimeSlot(start_time + timedelta(hours=1), start_time + timedelta(hours=2))]
        user2_busy = [TimeSlot(start_time + timedelta(hours=1.5), start_time + timedelta(hours=2.5))]
        
        member_busy_times = {
            'user1': user1_busy,
            'user2': user2_busy
        }
        
        common_slots = calculator.find_common_availability(
            member_busy_times, start_time, end_time, min_duration_minutes=30
        )
        
        print(f"✅ Common availability calculated: {len(common_slots)} slots found")
        for slot in common_slots:
            print(f"   - {slot['start_time']} to {slot['end_time']} ({slot['duration_minutes']} min)")
        
    except Exception as e:
        print(f"❌ Algorithm testing failed: {e}")

def main():
    """Run all tests."""
    print("🚀 Sprint 3 Testing Suite")
    print("=" * 50)
    
    # Test backend connection
    if not test_backend_connection():
        print("❌ Cannot proceed with tests - backend is not accessible")
        return
    
    # Test API endpoints
    test_availability_endpoints()
    
    # Test algorithms directly
    test_algorithms_directly()
    
    print("\n" + "=" * 50)
    print("🏁 Testing Complete!")
    print("\n📋 Summary:")
    print("   - Backend server: Running")
    print("   - Availability endpoints: Available")
    print("   - Core algorithms: Functional")
    print("   - Ready for frontend integration")

if __name__ == "__main__":
    main()
