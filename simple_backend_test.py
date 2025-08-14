#!/usr/bin/env python3
"""
Simple Backend API Test to isolate specific issues
"""

import requests
import json
import os
from io import BytesIO

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def test_file_upload_missing_file():
    """Test missing file scenario"""
    print("=== Testing Missing File Upload ===")
    try:
        # Test with empty files dict
        response = requests.post(f"{API_BASE}/files/analyze", files={})
        print(f"Empty files dict - Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test with no files parameter
        response = requests.post(f"{API_BASE}/files/analyze")
        print(f"No files parameter - Status: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

def test_error_handling():
    """Test error handling scenarios"""
    print("\n=== Testing Error Handling ===")
    
    # Test invalid chat request
    try:
        payload = {"messages": "invalid"}
        response = requests.post(f"{API_BASE}/chat/completions", json=payload, timeout=10)
        print(f"Invalid chat - Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Invalid chat error: {e}")
    
    # Test non-existent route
    try:
        response = requests.get(f"{API_BASE}/nonexistent", timeout=10)
        print(f"Non-existent route - Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Non-existent route error: {e}")

def test_json_responses():
    """Test all endpoints for valid JSON"""
    print("\n=== Testing JSON Responses ===")
    
    endpoints = [
        ("GET", "/"),
        ("GET", "/chat/sessions"),
        ("GET", "/settings"),
        ("GET", "/system/usage"),
        ("GET", "/news/latest"),
        ("GET", "/companies/search?q=test")
    ]
    
    for method, endpoint in endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            json_data = response.json()
            print(f"✅ {endpoint} - Valid JSON")
        except json.JSONDecodeError as e:
            print(f"❌ {endpoint} - JSON Error: {e}")
        except Exception as e:
            print(f"❌ {endpoint} - Request Error: {e}")

if __name__ == "__main__":
    test_json_responses()
    test_file_upload_missing_file()
    test_error_handling()