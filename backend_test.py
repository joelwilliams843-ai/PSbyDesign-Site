#!/usr/bin/env python3
"""
CLARITY Executive Coaching Dashboard - Backend API Test Suite
Tests all API endpoints with proper authentication and role-based access control.
"""

import requests
import sys
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

class ClarityAPITester:
    def __init__(self, base_url="https://progress-hub-204.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Test data
        self.admin_email = "admin@clarity.coach"
        self.admin_password = "ClarityAdmin2026!"
        self.test_participant_email = "jane@test.com"
        self.test_participant_password = "TestPass123!"
        self.test_participant_name = "Jane Smith"
        
        # Test results
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.critical_issues = []
        
        # Store IDs for cleanup
        self.participant_id = None
        self.session_id = None
        self.resource_id = None
        self.schedule_request_id = None
        self.post_id = None

    def log_result(self, test_name: str, success: bool, details: str = "", critical: bool = False):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            if critical:
                self.critical_issues.append({"test": test_name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Dict = None, files: Dict = None, 
                    expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/api/{endpoint}"
        
        try:
            if method == "GET":
                response = self.session.get(url)
            elif method == "POST":
                if files:
                    response = self.session.post(url, data=data, files=files)
                else:
                    response = self.session.post(url, json=data)
            elif method == "PUT":
                response = self.session.put(url, json=data)
            elif method == "DELETE":
                response = self.session.delete(url)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json() if response.content else {}
            except:
                response_data = {"raw_response": response.text}
            
            if not success:
                response_data["status_code"] = response.status_code
                response_data["expected_status"] = expected_status
            
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_admin_login(self):
        """Test admin login and cookie authentication"""
        success, data = self.make_request("POST", "auth/login", {
            "email": self.admin_email,
            "password": self.admin_password
        })
        
        if success and data.get("role") == "admin":
            self.log_result("Admin Login", True, f"Logged in as {data.get('name')}")
            return True
        else:
            self.log_result("Admin Login", False, f"Login failed: {data}", critical=True)
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard stats"""
        success, data = self.make_request("GET", "dashboard/admin")
        
        if success and "total_participants" in data:
            stats = f"Participants: {data.get('total_participants')}, Sessions: {data.get('total_sessions')}, Completion: {data.get('completion_rate')}%"
            self.log_result("Admin Dashboard", True, stats)
            return True
        else:
            self.log_result("Admin Dashboard", False, f"Dashboard failed: {data}")
            return False

    def test_create_participant(self):
        """Test creating a new participant"""
        success, data = self.make_request("POST", "participants", {
            "name": self.test_participant_name,
            "email": self.test_participant_email,
            "password": self.test_participant_password
        }, expected_status=200)
        
        if success and data.get("role") == "participant":
            self.participant_id = data.get("id")
            self.log_result("Create Participant", True, f"Created participant: {data.get('name')} ({data.get('email')})")
            return True
        else:
            self.log_result("Create Participant", False, f"Creation failed: {data}", critical=True)
            return False

    def test_list_participants(self):
        """Test listing all participants"""
        success, data = self.make_request("GET", "participants")
        
        if success and isinstance(data, list):
            participant_count = len(data)
            found_test_participant = any(p.get("email") == self.test_participant_email for p in data)
            details = f"Found {participant_count} participants, test participant included: {found_test_participant}"
            self.log_result("List Participants", True, details)
            return True
        else:
            self.log_result("List Participants", False, f"List failed: {data}")
            return False

    def test_get_participant_sessions(self):
        """Test getting participant sessions"""
        if not self.participant_id:
            self.log_result("Get Participant Sessions", False, "No participant ID available")
            return False
        
        success, data = self.make_request("GET", f"sessions/{self.participant_id}")
        
        if success and isinstance(data, list) and len(data) == 10:
            upcoming_sessions = [s for s in data if s.get("status") == "upcoming"]
            details = f"Found {len(data)} sessions, {len(upcoming_sessions)} upcoming"
            self.log_result("Get Participant Sessions", True, details)
            
            # Store first session ID for testing
            if data:
                self.session_id = data[0].get("id")
            return True
        else:
            self.log_result("Get Participant Sessions", False, f"Sessions failed: {data}")
            return False

    def test_mark_session_complete(self):
        """Test marking a session as complete"""
        if not self.session_id:
            self.log_result("Mark Session Complete", False, "No session ID available")
            return False
        
        success, data = self.make_request("PUT", f"sessions/{self.session_id}", {
            "status": "completed",
            "notes": "Test session completed successfully"
        })
        
        if success:
            self.log_result("Mark Session Complete", True, "Session marked as completed")
            return True
        else:
            self.log_result("Mark Session Complete", False, f"Update failed: {data}")
            return False

    def test_schedule_request(self):
        """Test participant logout and login, then schedule request"""
        # Logout admin
        self.make_request("POST", "auth/logout")
        
        # Login as participant
        success, data = self.make_request("POST", "auth/login", {
            "email": self.test_participant_email,
            "password": self.test_participant_password
        })
        
        if not success:
            self.log_result("Participant Login", False, f"Login failed: {data}", critical=True)
            return False
        
        # Create schedule request
        success, data = self.make_request("POST", "schedule/request", {
            "requested_date": "2024-12-20",
            "requested_time": "10:00",
            "notes": "Test scheduling request"
        })
        
        if success and data.get("status") == "pending":
            self.schedule_request_id = data.get("id")
            self.log_result("Schedule Request", True, "Schedule request created")
            return True
        else:
            self.log_result("Schedule Request", False, f"Request failed: {data}")
            return False

    def test_participant_dashboard(self):
        """Test participant dashboard"""
        success, data = self.make_request("GET", "dashboard/participant")
        
        if success and "sessions" in data and "progress_percent" in data:
            details = f"Progress: {data.get('progress_percent')}%, Completed: {data.get('completed_sessions')}/{data.get('total_sessions')}"
            self.log_result("Participant Dashboard", True, details)
            return True
        else:
            self.log_result("Participant Dashboard", False, f"Dashboard failed: {data}")
            return False

    def test_community_post(self):
        """Test creating a community post"""
        success, data = self.make_request("POST", "feed", {
            "content": "This is a test best practice post for the coaching community.",
            "type": "best_practice"
        })
        
        if success and data.get("id"):
            self.post_id = data.get("id")
            self.log_result("Create Community Post", True, "Post created successfully")
            return True
        else:
            self.log_result("Create Community Post", False, f"Post failed: {data}")
            return False

    def test_get_community_feed(self):
        """Test getting community feed"""
        success, data = self.make_request("GET", "feed")
        
        if success and isinstance(data, list):
            post_count = len(data)
            found_test_post = any(p.get("id") == self.post_id for p in data) if self.post_id else False
            details = f"Found {post_count} posts, test post included: {found_test_post}"
            self.log_result("Get Community Feed", True, details)
            return True
        else:
            self.log_result("Get Community Feed", False, f"Feed failed: {data}")
            return False

    def test_like_post(self):
        """Test liking a community post"""
        if not self.post_id:
            self.log_result("Like Post", False, "No post ID available")
            return False
        
        success, data = self.make_request("POST", f"feed/{self.post_id}/like")
        
        if success and "likes_count" in data:
            details = f"Likes: {data.get('likes_count')}, Liked: {data.get('liked')}"
            self.log_result("Like Post", True, details)
            return True
        else:
            self.log_result("Like Post", False, f"Like failed: {data}")
            return False

    def test_admin_schedule_management(self):
        """Test admin schedule management"""
        # Login back as admin
        self.make_request("POST", "auth/logout")
        success, data = self.make_request("POST", "auth/login", {
            "email": self.admin_email,
            "password": self.admin_password
        })
        
        if not success:
            self.log_result("Admin Re-login", False, f"Login failed: {data}")
            return False
        
        # Get all schedule requests
        success, data = self.make_request("GET", "schedule/all")
        
        if success and isinstance(data, list):
            pending_requests = [r for r in data if r.get("status") == "pending"]
            details = f"Found {len(data)} requests, {len(pending_requests)} pending"
            self.log_result("Admin Schedule Management", True, details)
            
            # Approve the test request if found
            if self.schedule_request_id and pending_requests:
                test_request = next((r for r in pending_requests if r.get("id") == self.schedule_request_id), None)
                if test_request:
                    approve_success, approve_data = self.make_request("PUT", f"schedule/{self.schedule_request_id}", {
                        "status": "approved",
                        "admin_notes": "Test approval",
                        "adjusted_date": "2024-12-20",
                        "adjusted_time": "10:30"
                    })
                    if approve_success:
                        self.log_result("Approve Schedule Request", True, "Request approved")
                    else:
                        self.log_result("Approve Schedule Request", False, f"Approval failed: {approve_data}")
            
            return True
        else:
            self.log_result("Admin Schedule Management", False, f"Schedule failed: {data}")
            return False

    def test_resource_management(self):
        """Test resource upload (simulated)"""
        # Note: We can't easily test file upload without actual files
        # But we can test getting resources for a participant
        if not self.participant_id:
            self.log_result("Resource Management", False, "No participant ID available")
            return False
        
        success, data = self.make_request("GET", f"resources/{self.participant_id}")
        
        if success and isinstance(data, list):
            resource_count = len(data)
            self.log_result("Resource Management", True, f"Found {resource_count} resources for participant")
            return True
        else:
            self.log_result("Resource Management", False, f"Resources failed: {data}")
            return False

    def test_auth_security(self):
        """Test authentication security features"""
        # Test invalid login (should increment attempt counter)
        success, data = self.make_request("POST", "auth/login", {
            "email": self.admin_email,
            "password": "wrong_password"
        }, expected_status=401)
        
        if success:  # success means we got expected 401
            self.log_result("Auth Security - Invalid Login", True, "Invalid login properly rejected")
        else:
            self.log_result("Auth Security - Invalid Login", False, f"Security test failed: {data}")
        
        # Test accessing protected endpoint without auth
        self.make_request("POST", "auth/logout")  # Ensure logged out
        success, data = self.make_request("GET", "dashboard/admin", expected_status=401)
        
        if success:  # success means we got expected 401
            self.log_result("Auth Security - Protected Endpoint", True, "Protected endpoint properly secured")
            return True
        else:
            self.log_result("Auth Security - Protected Endpoint", False, f"Security test failed: {data}")
            return False

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting CLARITY Executive Coaching Dashboard API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 70)
        
        # Core authentication tests
        if not self.test_admin_login():
            print("\n❌ CRITICAL: Admin login failed - stopping tests")
            return self.generate_report()
        
        # Admin functionality tests
        self.test_admin_dashboard()
        self.test_create_participant()
        self.test_list_participants()
        self.test_get_participant_sessions()
        self.test_mark_session_complete()
        
        # Participant functionality tests
        self.test_schedule_request()
        self.test_participant_dashboard()
        self.test_community_post()
        self.test_get_community_feed()
        self.test_like_post()
        
        # Admin management tests
        self.test_admin_schedule_management()
        self.test_resource_management()
        
        # Security tests
        self.test_auth_security()
        
        return self.generate_report()

    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 70)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 70)
        
        success_rate = (self.tests_passed / max(self.tests_run, 1)) * 100
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Critical Issues: {len(self.critical_issues)}")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        if self.critical_issues:
            print("\n🚨 CRITICAL ISSUES:")
            for issue in self.critical_issues:
                print(f"  • {issue['test']}: {issue['details']}")
        
        print("\n" + "=" * 70)
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": success_rate,
            "failed_tests": self.failed_tests,
            "critical_issues": self.critical_issues,
            "participant_id": self.participant_id
        }

def main():
    """Main test execution"""
    tester = ClarityAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results["critical_issues"]:
        return 2  # Critical failures
    elif results["failed_tests"]:
        return 1  # Some failures
    else:
        return 0  # All passed

if __name__ == "__main__":
    sys.exit(main())