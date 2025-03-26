import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:8000"
AUTH_ENDPOINT = f"{BASE_URL}/api/auth/token"
ONBOARD_START_ENDPOINT = f"{BASE_URL}/api/onboard/start"
ONBOARD_UPDATE_ENDPOINT = f"{BASE_URL}/api/onboard/update"
ONBOARD_COMPLETE_ENDPOINT = f"{BASE_URL}/api/onboard/complete"

# Test user credentials
USERNAME = "testuser"
PASSWORD = "password123"

# Simulated user responses
USER_RESPONSES = [
    "I want to save for retirement and my child's education",
    "I'm thinking about 25 years for retirement and 15 years for education",
    "I'm moderately comfortable with risk, but prefer safer investments for education funds",
    "Yes, I'd like to see my personalized recommendations now"
]

def get_auth_token():
    """Authenticate and get token"""
    try:
        print(f"Authenticating with username: {USERNAME}")
        
        # Try both form data and JSON approaches
        # First with form data
        print("Trying form data authentication...")
        form_data = {
            "username": USERNAME,
            "password": PASSWORD
        }
        
        form_response = requests.post(
            AUTH_ENDPOINT,
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Form data response status: {form_response.status_code}")
        if form_response.status_code == 200:
            data = form_response.json()
            print("Authentication successful with form data!")
            return data.get("access_token")
            
        # If form data fails, try JSON
        print("Trying JSON authentication...")
        json_response = requests.post(
            AUTH_ENDPOINT,
            json={"username": USERNAME, "password": PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"JSON response status: {json_response.status_code}")
        if json_response.status_code == 200:
            data = json_response.json()
            print("Authentication successful with JSON!")
            return data.get("access_token")
        
        # If both fail, show detailed error
        print(f"Form data response: {form_response.text}")
        print(f"JSON response: {json_response.text}")
        return None
    except Exception as e:
        print(f"Error during authentication: {str(e)}")
        return None

def start_onboarding(token):
    """Start the onboarding process"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(ONBOARD_START_ENDPOINT, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"\nBot: {data['text']}")
            return data['session_id']
        else:
            print(f"Failed to start onboarding: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error starting onboarding: {str(e)}")
        return None

def update_onboarding(token, session_id, message):
    """Send user response and get next question"""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "session_id": session_id,
        "message": message
    }
    
    try:
        response = requests.post(ONBOARD_UPDATE_ENDPOINT, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"\nBot: {data['text']}")
            return data['complete']
        else:
            print(f"Failed to update onboarding: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error updating onboarding: {str(e)}")
        return False

def complete_onboarding(token, session_id):
    """Complete the onboarding process"""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"session_id": session_id}
    
    try:
        response = requests.post(ONBOARD_COMPLETE_ENDPOINT, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"\nBot: {data['text']}")
            return True
        else:
            print(f"Failed to complete onboarding: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error completing onboarding: {str(e)}")
        return False

def run_test():
    """Run through the complete onboarding flow"""
    print("Starting onboarding API test...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("Failed to authenticate. Exiting.")
        return False
    
    print("Successfully authenticated!")
    
    # Start onboarding session
    session_id = start_onboarding(token)
    if not session_id:
        print("Failed to start onboarding. Exiting.")
        return False
    
    # Go through conversation turns
    is_complete = False
    for i, response in enumerate(USER_RESPONSES):
        print(f"\nUser: {response}")
        time.sleep(1)  # Pause for readability
        
        is_complete = update_onboarding(token, session_id, response)
        if is_complete and i < len(USER_RESPONSES) - 1:
            print("Onboarding completed early!")
            break
    
    # Complete onboarding if not already marked as complete
    if not is_complete:
        print("\nFinalizing onboarding...")
        complete_onboarding(token, session_id)
    
    print("\nOnboarding test completed successfully!")
    return True

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1) 