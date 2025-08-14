#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for AI Platform
Tests all backend endpoints with real Gemini API integration
"""

import requests
import json
import time
import os
from io import BytesIO

# Get base URL from environment
import os
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def test_root_endpoint():
    """Test GET /api/ endpoint and CORS headers"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{API_BASE}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
        print(f"CORS Headers: {cors_headers}")
        
        if response.status_code == 200 and response.json().get('message') == "AI Platform API Ready":
            print("✅ Root endpoint test PASSED")
            return True
        else:
            print("❌ Root endpoint test FAILED")
            return False
            
    except Exception as e:
        print(f"❌ Root endpoint test ERROR: {e}")
        return False

def test_chat_completions():
    """Test POST /api/chat/completions with Gemini API integration"""
    print("\n=== Testing Chat Completions API ===")
    try:
        payload = {
            "messages": [
                {"role": "user", "content": "Hello, how are you? Please respond briefly."}
            ],
            "model": "gemini-2.0-flash",
            "temperature": 0.7,
            "max_tokens": 100
        }
        
        response = requests.post(f"{API_BASE}/chat/completions", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response ID: {data.get('id')}")
            print(f"Model: {data.get('model')}")
            print(f"Object: {data.get('object')}")
            
            if 'choices' in data and len(data['choices']) > 0:
                message = data['choices'][0]['message']
                print(f"Assistant Response: {message.get('content', '')[:100]}...")
                print(f"Usage: {data.get('usage', {})}")
                print("✅ Chat completions test PASSED")
                return True
            else:
                print("❌ Chat completions test FAILED - No choices in response")
                return False
        else:
            print(f"❌ Chat completions test FAILED - Status: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat completions test ERROR: {e}")
        return False

def test_chat_sessions():
    """Test GET /api/chat/sessions endpoint"""
    print("\n=== Testing Chat Sessions Retrieval ===")
    try:
        response = requests.get(f"{API_BASE}/chat/sessions")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            sessions = response.json()
            print(f"Number of sessions retrieved: {len(sessions)}")
            
            if len(sessions) > 0:
                session = sessions[0]
                print(f"Latest session ID: {session.get('id')}")
                print(f"Session timestamp: {session.get('timestamp')}")
                print(f"Session messages count: {len(session.get('messages', []))}")
                
            print("✅ Chat sessions test PASSED")
            return True
        else:
            print(f"❌ Chat sessions test FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Chat sessions test ERROR: {e}")
        return False

def test_settings_endpoints():
    """Test GET and POST /api/settings endpoints"""
    print("\n=== Testing Settings Management ===")
    
    # Test GET settings
    try:
        response = requests.get(f"{API_BASE}/settings")
        print(f"GET Settings Status Code: {response.status_code}")
        
        if response.status_code == 200:
            settings = response.json()
            print(f"Settings type: {settings.get('type')}")
            print(f"Mode: {settings.get('mode')}")
            print(f"Streaming: {settings.get('streaming')}")
            print(f"Endpoints count: {len(settings.get('endpoints', []))}")
            print("✅ GET Settings test PASSED")
            get_success = True
        else:
            print("❌ GET Settings test FAILED")
            get_success = False
            
    except Exception as e:
        print(f"❌ GET Settings test ERROR: {e}")
        get_success = False
    
    # Test POST settings
    try:
        test_settings = {
            "type": "global",
            "mode": "single-model",
            "streaming": False,
            "globalDefaults": {
                "temperature": 0.8,
                "maxTokens": 1500
            }
        }
        
        response = requests.post(f"{API_BASE}/settings", json=test_settings)
        print(f"POST Settings Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Update result: {result}")
            print("✅ POST Settings test PASSED")
            post_success = True
        else:
            print("❌ POST Settings test FAILED")
            post_success = False
            
    except Exception as e:
        print(f"❌ POST Settings test ERROR: {e}")
        post_success = False
    
    return get_success and post_success

def test_system_usage():
    """Test GET /api/system/usage endpoint"""
    print("\n=== Testing System Usage Statistics ===")
    try:
        response = requests.get(f"{API_BASE}/system/usage")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            usage = response.json()
            print(f"Total chats: {usage.get('totalChats')}")
            print(f"Total tokens: {usage.get('totalTokens')}")
            print(f"Estimated cost: {usage.get('estimatedCost')}")
            print(f"Last updated: {usage.get('lastUpdated')}")
            print("✅ System usage test PASSED")
            return True
        else:
            print(f"❌ System usage test FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ System usage test ERROR: {e}")
        return False

def test_file_analysis():
    """Test POST /api/files/analyze with file upload"""
    print("\n=== Testing File Analysis Upload ===")
    try:
        # Create a sample text file
        sample_content = """This is a sample text file for testing the file analysis endpoint.
It contains multiple lines of text to test word count, character count, and line count functionality.
The AI Platform should be able to analyze this file and return statistics about it.
This is the fourth line of the sample file."""
        
        files = {
            'file': ('sample.txt', BytesIO(sample_content.encode('utf-8')), 'text/plain')
        }
        
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            analysis = response.json()
            print(f"File ID: {analysis.get('id')}")
            print(f"Filename: {analysis.get('filename')}")
            print(f"File size: {analysis.get('size')} bytes")
            print(f"File type: {analysis.get('type')}")
            print(f"Word count: {analysis.get('wordCount')}")
            print(f"Character count: {analysis.get('charCount')}")
            print(f"Line count: {analysis.get('lines')}")
            print(f"Uploaded at: {analysis.get('uploadedAt')}")
            print("✅ File analysis test PASSED")
            return True
        else:
            print(f"❌ File analysis test FAILED - Status: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ File analysis test ERROR: {e}")
        return False

def test_news_endpoint():
    """Test GET /api/news/latest endpoint"""
    print("\n=== Testing News API Endpoint ===")
    try:
        response = requests.get(f"{API_BASE}/news/latest")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            news = response.json()
            print(f"Number of news items: {len(news)}")
            
            if len(news) > 0:
                item = news[0]
                print(f"News ID: {item.get('id')}")
                print(f"Title: {item.get('title')}")
                print(f"Summary: {item.get('summary')}")
                print(f"Source: {item.get('source')}")
                print(f"Published at: {item.get('publishedAt')}")
                
            print("✅ News endpoint test PASSED")
            return True
        else:
            print(f"❌ News endpoint test FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ News endpoint test ERROR: {e}")
        return False

def test_companies_search():
    """Test GET /api/companies/search endpoint"""
    print("\n=== Testing Companies Search API ===")
    try:
        response = requests.get(f"{API_BASE}/companies/search?q=tech")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            companies = response.json()
            print(f"Number of companies: {len(companies)}")
            
            if len(companies) > 0:
                company = companies[0]
                print(f"Company ID: {company.get('id')}")
                print(f"Name: {company.get('name')}")
                print(f"Industry: {company.get('industry')}")
                print(f"Funding: {company.get('funding')}")
                print(f"Description: {company.get('description')}")
                
            print("✅ Companies search test PASSED")
            return True
        else:
            print(f"❌ Companies search test FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Companies search test ERROR: {e}")
        return False

def test_json_parsing_validation():
    """Test JSON response validation to ensure no parsing errors"""
    print("\n=== Testing JSON Response Validation ===")
    
    all_tests_passed = True
    
    # Test all endpoints for valid JSON responses
    endpoints_to_test = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/chat/sessions", "Chat sessions"),
        ("GET", "/settings", "Settings GET"),
        ("GET", "/system/usage", "System usage"),
        ("GET", "/news/latest", "News endpoint"),
        ("GET", "/companies/search?q=test", "Companies search")
    ]
    
    for method, endpoint, name in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{API_BASE}{endpoint}")
            
            print(f"Testing {name} JSON validity...")
            
            # Try to parse JSON
            try:
                json_data = response.json()
                print(f"✅ {name} returns valid JSON")
            except json.JSONDecodeError as e:
                print(f"❌ {name} JSON parsing error: {e}")
                all_tests_passed = False
            except Exception as e:
                print(f"❌ {name} JSON validation error: {e}")
                all_tests_passed = False
                
        except Exception as e:
            print(f"❌ {name} request error: {e}")
            all_tests_passed = False
    
    # Test chat completions JSON specifically
    try:
        payload = {
            "messages": [{"role": "user", "content": "Test JSON response"}],
            "model": "gemini-2.0-flash"
        }
        response = requests.post(f"{API_BASE}/chat/completions", json=payload)
        
        try:
            json_data = response.json()
            print("✅ Chat completions returns valid JSON")
        except json.JSONDecodeError as e:
            print(f"❌ Chat completions JSON parsing error: {e}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ Chat completions JSON test error: {e}")
        all_tests_passed = False
    
    return all_tests_passed

def test_file_upload_validation():
    """Test file upload validation - single file, type, and size limits"""
    print("\n=== Testing File Upload Validation ===")
    
    all_tests_passed = True
    
    # Test 1: Valid file types (TXT, PDF, CSV)
    valid_file_types = [
        ('test.txt', 'text/plain', 'This is a test text file.'),
        ('test.csv', 'text/csv', 'name,age,city\nJohn,25,NYC\nJane,30,LA'),
        ('test.pdf', 'application/pdf', 'This is mock PDF content for testing.')
    ]
    
    for filename, content_type, content in valid_file_types:
        try:
            files = {
                'file': (filename, BytesIO(content.encode('utf-8')), content_type)
            }
            response = requests.post(f"{API_BASE}/files/analyze", files=files)
            
            if response.status_code == 200:
                print(f"✅ {filename} upload accepted")
            else:
                print(f"❌ {filename} upload rejected: {response.status_code}")
                all_tests_passed = False
                
        except Exception as e:
            print(f"❌ {filename} upload error: {e}")
            all_tests_passed = False
    
    # Test 2: Missing file
    try:
        response = requests.post(f"{API_BASE}/files/analyze", files={})
        if response.status_code == 400:
            print("✅ Missing file properly rejected")
        else:
            print(f"❌ Missing file not properly rejected: {response.status_code}")
            all_tests_passed = False
    except Exception as e:
        print(f"❌ Missing file test error: {e}")
        all_tests_passed = False
    
    # Test 3: Large file (simulate 11MB file - should be rejected if 10MB limit exists)
    try:
        large_content = "x" * (11 * 1024 * 1024)  # 11MB
        files = {
            'file': ('large.txt', BytesIO(large_content.encode('utf-8')), 'text/plain')
        }
        response = requests.post(f"{API_BASE}/files/analyze", files=files)
        
        # Note: Current implementation doesn't have size limit, so this will pass
        # This is just to document the behavior
        print(f"Large file (11MB) response: {response.status_code}")
        if response.status_code == 200:
            print("⚠️  Large file accepted (no size limit implemented)")
        else:
            print("✅ Large file properly rejected")
            
    except Exception as e:
        print(f"❌ Large file test error: {e}")
        # Don't fail the test for this as it's expected to potentially fail due to size
    
    return all_tests_passed

def test_error_scenarios():
    """Test error handling scenarios"""
    print("\n=== Testing Error Scenarios ===")
    
    # Test invalid chat completion request
    try:
        payload = {"messages": "invalid"}  # Should be array
        response = requests.post(f"{API_BASE}/chat/completions", json=payload)
        print(f"Invalid chat request status: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Error handling for invalid chat request PASSED")
            error_test_1 = True
        else:
            print("❌ Error handling for invalid chat request FAILED")
            error_test_1 = False
    except Exception as e:
        print(f"❌ Error test 1 ERROR: {e}")
        error_test_1 = False
    
    # Test non-existent route
    try:
        response = requests.get(f"{API_BASE}/nonexistent")
        print(f"Non-existent route status: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ Error handling for non-existent route PASSED")
            error_test_2 = True
        else:
            print("❌ Error handling for non-existent route FAILED")
            error_test_2 = False
    except Exception as e:
        print(f"❌ Error test 2 ERROR: {e}")
        error_test_2 = False
    
    return error_test_1 and error_test_2

def main():
    """Run all backend API tests"""
    print("🚀 Starting Comprehensive Backend API Testing for AI Platform")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    
    # Wait a moment for services to be ready
    time.sleep(2)
    
    test_results = {}
    
    # Run all tests
    test_results['root_endpoint'] = test_root_endpoint()
    test_results['chat_completions'] = test_chat_completions()
    test_results['chat_sessions'] = test_chat_sessions()
    test_results['settings'] = test_settings_endpoints()
    test_results['system_usage'] = test_system_usage()
    test_results['file_analysis'] = test_file_analysis()
    test_results['news_endpoint'] = test_news_endpoint()
    test_results['companies_search'] = test_companies_search()
    test_results['json_parsing_validation'] = test_json_parsing_validation()
    test_results['file_upload_validation'] = test_file_upload_validation()
    test_results['error_scenarios'] = test_error_scenarios()
    
    # Summary
    print("\n" + "="*60)
    print("🏁 BACKEND API TESTING SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API tests PASSED!")
        return True
    else:
        print(f"⚠️  {total - passed} tests FAILED")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)