import pytest
import uuid
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import status
from fastapi.testclient import TestClient
from datetime import datetime

# Import app and dependencies
from app.api.onboard import router, onboarding_sessions
from app.models.user import User

# Test onboarding endpoints
class TestOnboardAPI:
    
    def test_start_onboarding(self, test_client, mock_jwt_auth, mock_llm_service):
        """Test starting a new onboarding session."""
        # Clear any existing onboarding sessions
        onboarding_sessions.clear()
        
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository') as mock_repo:
                # Mock user repository
                repo_instance = mock_repo.return_value
                repo_instance.get_user_data.return_value = {
                    "demographics": {
                        "age": 35,
                        "occupation": "Software Engineer",
                        "income_bracket": "$100,000-$150,000"
                    }
                }
                
                response = test_client.post(
                    "/api/onboard/start",
                    headers={"Authorization": "Bearer fake_token"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert "session_id" in data
                assert "text" in data
                assert data["complete"] is False
                
                # Verify session was stored
                assert len(onboarding_sessions) == 1
                session_id = data["session_id"]
                assert session_id in onboarding_sessions
                assert onboarding_sessions[session_id]["user_id"] == mock_jwt_auth.user_id
    
    def test_update_onboarding(self, test_client, mock_jwt_auth, mock_llm_service):
        """Test updating an onboarding session with user input."""
        # Create a test session
        session_id = str(uuid.uuid4())
        onboarding_sessions[session_id] = {
            "user_id": mock_jwt_auth.user_id,
            "meta_prompt": "You are a financial advisor chatbot...",
            "messages": [
                {
                    "role": "system",
                    "content": "Welcome! What are your financial goals?",
                    "timestamp": datetime.now().isoformat()
                }
            ],
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "complete": False
        }
        
        # Test user message
        user_message = "I want to save for retirement and my child's education"
        
        response = test_client.post(
            "/api/onboard/update",
            json={"session_id": session_id, "message": user_message},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert "text" in data
        
        # Verify message was added to session
        session = onboarding_sessions[session_id]
        assert len(session["messages"]) == 3  # Initial + user + response
        assert session["messages"][1]["role"] == "user"
        assert session["messages"][1]["content"] == user_message
        assert session["messages"][2]["role"] == "system"
    
    def test_update_onboarding_session_not_found(self, test_client, mock_jwt_auth):
        """Test updating a non-existent session."""
        # Clear any existing sessions
        onboarding_sessions.clear()
        
        response = test_client.post(
            "/api/onboard/update",
            json={"session_id": "non-existent-session", "message": "Hello"},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_update_onboarding_unauthorized(self, test_client, mock_jwt_auth):
        """Test updating a session owned by another user."""
        # Create a test session owned by a different user
        session_id = str(uuid.uuid4())
        onboarding_sessions[session_id] = {
            "user_id": "another-user",  # Different from mock_jwt_auth.user_id
            "meta_prompt": "You are a financial advisor chatbot...",
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "complete": False
        }
        
        response = test_client.post(
            "/api/onboard/update",
            json={"session_id": session_id, "message": "Hello"},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data
        assert "not authorized" in data["detail"].lower()
    
    def test_complete_onboarding(self, test_client, mock_jwt_auth, mock_llm_service):
        """Test completing an onboarding session."""
        # Create a test session
        session_id = str(uuid.uuid4())
        onboarding_sessions[session_id] = {
            "user_id": mock_jwt_auth.user_id,
            "meta_prompt": "You are a financial advisor chatbot...",
            "messages": [
                {
                    "role": "system",
                    "content": "Welcome! What are your financial goals?",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "role": "user",
                    "content": "I want to save for retirement",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "role": "system",
                    "content": "That's a great goal. How much do you want to save?",
                    "timestamp": datetime.now().isoformat()
                }
            ],
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "complete": False
        }
        
        response = test_client.post(
            "/api/onboard/complete",
            json={"session_id": session_id},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["complete"] is True
        
        # Verify session was marked as complete
        assert onboarding_sessions[session_id]["complete"] is True
    
    def test_complete_onboarding_session_not_found(self, test_client, mock_jwt_auth):
        """Test completing a non-existent session."""
        # Clear any existing sessions
        onboarding_sessions.clear()
        
        response = test_client.post(
            "/api/onboard/complete",
            json={"session_id": "non-existent-session"},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_auto_complete_after_many_turns(self, test_client, mock_jwt_auth, mock_llm_service):
        """Test that onboarding auto-completes after sufficient turns."""
        # Create a test session with multiple user messages
        session_id = str(uuid.uuid4())
        onboarding_sessions[session_id] = {
            "user_id": mock_jwt_auth.user_id,
            "meta_prompt": "You are a financial advisor chatbot...",
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "complete": False
        }
        
        # Add 3 user messages (the 4th will trigger completion)
        for i in range(3):
            onboarding_sessions[session_id]["messages"].append({
                "role": "user",
                "content": f"User message {i+1}",
                "timestamp": datetime.now().isoformat()
            })
            onboarding_sessions[session_id]["messages"].append({
                "role": "system",
                "content": f"Bot response {i+1}",
                "timestamp": datetime.now().isoformat()
            })
        
        # Send the 4th user message
        response = test_client.post(
            "/api/onboard/update",
            json={"session_id": session_id, "message": "User message 4"},
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["complete"] is True 