import os
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
import sys
import logging

# Add src directory to Python path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set up logging for tests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB mock
@pytest.fixture
def mock_mongodb():
    """Mock MongoDB database connection."""
    db_mock = AsyncMock()
    with patch('app.database.mongodb.get_database', return_value=db_mock):
        yield db_mock

# User repository mock
@pytest.fixture
def mock_user_repo():
    """Mock user repository."""
    repo = AsyncMock()
    
    # Default user for tests
    test_user = MagicMock()
    test_user.user_id = "testuser"
    test_user.email = "test@example.com"
    test_user.hashed_password = "$2b$12$t8JMy5iUU8A7hXLkj0CeMOpGLyImIUHhgKDzf31fzJYfKQ/0KXLZe"  # 'password123'
    test_user.first_name = "Test"
    test_user.last_name = "User"
    test_user.is_active = True
    
    # Mock implementations
    repo.get_by_user_id.return_value = test_user
    repo.verify_password.return_value = True
    repo.create.return_value = test_user
    repo.update_user_last_login.return_value = True
    
    yield repo

# LLM Service mock
@pytest.fixture
def mock_llm_service():
    """Mock LLM service for generating responses."""
    service = AsyncMock()
    service.provider = "test-provider"
    service.model = "test-model"
    service.generate_response.return_value = "This is a mock LLM response."
    
    with patch('app.services.llm_service.get_llm_service', return_value=service):
        yield service

# JWT token auth mock
@pytest.fixture
def mock_jwt_auth():
    """Mock JWT authentication."""
    # Test user data
    test_user = MagicMock()
    test_user.user_id = "testuser"
    test_user.email = "test@example.com"
    test_user.is_active = True
    
    with patch('app.api.auth.get_current_user', return_value=test_user):
        yield test_user

# FastAPI TestClient
@pytest.fixture
def test_client():
    """Create a FastAPI test client."""
    # Import here to avoid circular imports
    from app.main import app
    with TestClient(app) as client:
        yield client

# Fixture for onboarding session
@pytest.fixture
def onboarding_session():
    """Create a mock onboarding session."""
    return {
        "session_id": "test-session-id",
        "user_id": "testuser",
        "meta_prompt": "You are a financial advisor chatbot...",
        "messages": [
            {
                "role": "system",
                "content": "Welcome! What are your financial goals?",
                "timestamp": "2023-03-26T12:00:00"
            }
        ],
        "created_at": "2023-03-26T12:00:00",
        "last_updated": "2023-03-26T12:00:00",
        "complete": False
    }

# Event loop for async tests
@pytest.fixture
def event_loop():
    """Create an event loop for the test."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close() 