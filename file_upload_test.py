#!/usr/bin/env python3
"""
Specific File Upload Testing
"""

import requests
import os
from io import BytesIO

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def test_single_file_upload():
    """Test that only single file uploads are accepted"""
    print("=== Testing Single File Upload Restriction ===")
    
    # Test single file (should work)
    try:
        files = {
            'file': ('test.txt', BytesIO(b'Single file content'), 'text/plain')
        }
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        print(f"Single file - Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Single file upload works")
        else:
            print(f"❌ Single file upload failed: {response.text}")
    except Exception as e:
        print(f"Single file error: {e}")
    
    # Test multiple files (current implementation will only process the first one)
    try:
        files = [
            ('file', ('test1.txt', BytesIO(b'First file content'), 'text/plain')),
            ('file', ('test2.txt', BytesIO(b'Second file content'), 'text/plain'))
        ]
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        print(f"Multiple files - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Processed filename: {data.get('filename')}")
            print("⚠️  Multiple files sent but only first one processed")
        else:
            print(f"Multiple files rejected: {response.text}")
    except Exception as e:
        print(f"Multiple files error: {e}")

def test_file_types():
    """Test different file types"""
    print("\n=== Testing File Type Support ===")
    
    file_types = [
        ('test.txt', 'text/plain', 'Text file content'),
        ('test.csv', 'text/csv', 'name,age\nJohn,25'),
        ('test.pdf', 'application/pdf', 'PDF content'),
        ('test.json', 'application/json', '{"key": "value"}'),
        ('test.doc', 'application/msword', 'Word document content')
    ]
    
    for filename, content_type, content in file_types:
        try:
            files = {
                'file': (filename, BytesIO(content.encode('utf-8')), content_type)
            }
            response = requests.post(f"{API_BASE}/files/analyze", files=files)
            print(f"{filename} ({content_type}) - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Processed: {data.get('wordCount')} words, {data.get('charCount')} chars")
            else:
                print(f"  ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

def test_missing_file_scenarios():
    """Test various missing file scenarios"""
    print("\n=== Testing Missing File Scenarios ===")
    
    # Test 1: No form data at all
    try:
        response = requests.post(f"{API_BASE}/files/analyze")
        print(f"No form data - Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"No form data error: {e}")
    
    # Test 2: Empty form data
    try:
        response = requests.post(f"{API_BASE}/files/analyze", files={})
        print(f"Empty form data - Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Empty form data error: {e}")
    
    # Test 3: Form data with wrong field name
    try:
        files = {
            'wrong_field': ('test.txt', BytesIO(b'content'), 'text/plain')
        }
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        print(f"Wrong field name - Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Wrong field name error: {e}")

if __name__ == "__main__":
    test_single_file_upload()
    test_file_types()
    test_missing_file_scenarios()