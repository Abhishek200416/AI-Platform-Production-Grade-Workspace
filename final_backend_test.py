#!/usr/bin/env python3
"""
Final Comprehensive Backend API Test Summary
"""

import requests
import json
import os
from io import BytesIO

BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def main():
    print("🔍 FINAL BACKEND API VERIFICATION")
    print("="*50)
    
    results = {}
    
    # Test 1: All 8 core endpoints
    print("\n1. CORE API ENDPOINTS:")
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("POST", "/chat/completions", "Chat completions"),
        ("GET", "/chat/sessions", "Chat sessions"),
        ("GET", "/settings", "Settings GET"),
        ("POST", "/settings", "Settings POST"),
        ("GET", "/system/usage", "System usage"),
        ("POST", "/files/analyze", "File analysis"),
        ("GET", "/news/latest", "News endpoint"),
        ("GET", "/companies/search", "Companies search")
    ]
    
    for method, endpoint, name in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{API_BASE}{endpoint}")
            elif method == "POST":
                if endpoint == "/chat/completions":
                    payload = {"messages": [{"role": "user", "content": "test"}]}
                    response = requests.post(f"{API_BASE}{endpoint}", json=payload)
                elif endpoint == "/settings":
                    payload = {"mode": "test"}
                    response = requests.post(f"{API_BASE}{endpoint}", json=payload)
                elif endpoint == "/files/analyze":
                    files = {'file': ('test.txt', BytesIO(b'test'), 'text/plain')}
                    response = requests.post(f"{API_BASE}{endpoint}", files=files)
            
            if response.status_code in [200, 201]:
                print(f"  ✅ {name}")
                results[name] = True
            else:
                print(f"  ❌ {name} - Status: {response.status_code}")
                results[name] = False
                
        except Exception as e:
            print(f"  ❌ {name} - Error: {e}")
            results[name] = False
    
    # Test 2: JSON Response Validation
    print("\n2. JSON RESPONSE VALIDATION:")
    json_valid = True
    test_endpoints = ["/", "/chat/sessions", "/settings", "/system/usage", "/news/latest"]
    
    for endpoint in test_endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}")
            response.json()  # This will raise JSONDecodeError if invalid
        except json.JSONDecodeError:
            json_valid = False
            break
        except Exception:
            pass
    
    if json_valid:
        print("  ✅ All endpoints return valid JSON")
        results["JSON Validation"] = True
    else:
        print("  ❌ JSON parsing errors found")
        results["JSON Validation"] = False
    
    # Test 3: File Upload Validation
    print("\n3. FILE UPLOAD VALIDATION:")
    
    # Single file upload
    try:
        files = {'file': ('test.txt', BytesIO(b'test content'), 'text/plain')}
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        single_file_ok = response.status_code == 200
    except:
        single_file_ok = False
    
    # Multiple file types
    file_types_ok = True
    for ext, mime in [('txt', 'text/plain'), ('csv', 'text/csv'), ('pdf', 'application/pdf')]:
        try:
            files = {'file': (f'test.{ext}', BytesIO(b'content'), mime)}
            response = requests.post(f"{API_BASE}/files/analyze", files=files)
            if response.status_code != 200:
                file_types_ok = False
                break
        except:
            file_types_ok = False
            break
    
    if single_file_ok and file_types_ok:
        print("  ✅ File upload working (single file, multiple types supported)")
        results["File Upload"] = True
    else:
        print("  ❌ File upload issues found")
        results["File Upload"] = False
    
    # Test 4: Error Handling
    print("\n4. ERROR HANDLING:")
    
    # Invalid chat request
    try:
        payload = {"messages": "invalid"}
        response = requests.post(f"{API_BASE}/chat/completions", json=payload)
        error_handling_ok = response.status_code == 400
    except:
        error_handling_ok = False
    
    # Non-existent route
    try:
        response = requests.get(f"{API_BASE}/nonexistent")
        error_handling_ok = error_handling_ok and response.status_code == 404
    except:
        error_handling_ok = False
    
    if error_handling_ok:
        print("  ✅ Error handling working correctly")
        results["Error Handling"] = True
    else:
        print("  ❌ Error handling issues found")
        results["Error Handling"] = False
    
    # Test 5: Gemini API Integration
    print("\n5. GEMINI API INTEGRATION:")
    try:
        payload = {"messages": [{"role": "user", "content": "Hello"}]}
        response = requests.post(f"{API_BASE}/chat/completions", json=payload)
        if response.status_code == 200:
            data = response.json()
            gemini_ok = 'choices' in data and len(data['choices']) > 0
        else:
            gemini_ok = False
    except:
        gemini_ok = False
    
    if gemini_ok:
        print("  ✅ Gemini API integration working")
        results["Gemini Integration"] = True
    else:
        print("  ❌ Gemini API integration issues")
        results["Gemini Integration"] = False
    
    # Summary
    print("\n" + "="*50)
    print("📊 FINAL SUMMARY:")
    print("="*50)
    
    passed = sum(results.values())
    total = len(results)
    
    for test, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL BACKEND TESTS PASSED!")
        print("✅ No JSON parsing errors found")
        print("✅ All API endpoints working correctly")
        print("✅ Gemini API integration stable")
        return True
    else:
        print(f"⚠️  {total - passed} issues found")
        return False

if __name__ == "__main__":
    main()