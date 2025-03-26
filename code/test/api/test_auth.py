import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import status
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

# Import app and dependencies
from app.api.auth import router, create_access_token, get_current_user, verify_password
from app.models.user import User, UserCreate

# Test authentication endpoints
class TestAuthAPI:
    
    def test_login_form_data_successful(self, test_client, mock_user_repo):
        """Test successful login with form data."""
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository', return_value=mock_user_repo):
                response = test_client.post(
                    "/api/auth/token",
                    data={"username": "testuser", "password": "password123"},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert "access_token" in data
                assert data["token_type"] == "bearer"
                assert data["user_id"] == "testuser"
    
    def test_login_json_successful(self, test_client, mock_user_repo):
        """Test successful login with JSON data."""
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository', return_value=mock_user_repo):
                response = test_client.post(
                    "/api/auth/token",
                    json={"username": "testuser", "password": "password123"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert "access_token" in data
                assert data["token_type"] == "bearer"
                assert data["user_id"] == "testuser"
    
    def test_login_invalid_credentials(self, test_client, mock_user_repo):
        """Test login with invalid credentials."""
        mock_user_repo.verify_password.return_value = False
        
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository', return_value=mock_user_repo):
                response = test_client.post(
                    "/api/auth/token",
                    json={"username": "testuser", "password": "wrongpassword"}
                )
                
                assert response.status_code == 401
                data = response.json()
                assert "detail" in data
                assert "Incorrect user ID or password" in data["detail"]
    
    def test_login_missing_credentials(self, test_client):
        """Test login with missing credentials."""
        response = test_client.post(
            "/api/auth/token",
            json={"username": "testuser"}  # Missing password
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Username and password are required" in data["detail"]
    
    def test_register_new_user(self, test_client, mock_user_repo):
        """Test registering a new user."""
        # Make get_by_user_id return None to simulate user not existing
        mock_user_repo.get_by_user_id.return_value = None
        
        new_user = UserCreate(
            user_id="newuser",
            email="new@example.com",
            password="newpassword",
            first_name="New",
            last_name="User"
        )
        
        # Create a mock for the newly created user
        created_user = MagicMock()
        created_user.user_id = new_user.user_id
        created_user.email = new_user.email
        created_user.first_name = new_user.first_name
        created_user.last_name = new_user.last_name
        
        mock_user_repo.create.return_value = created_user
        
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository', return_value=mock_user_repo):
                response = test_client.post(
                    "/api/auth/register",
                    json=new_user.dict()
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["user_id"] == new_user.user_id
                assert data["email"] == new_user.email
                
                # Verify user repo's create method was called
                mock_user_repo.create.assert_called_once()
    
    def test_register_existing_user(self, test_client, mock_user_repo):
        """Test registering a user that already exists."""
        existing_user = UserCreate(
            user_id="testuser",
            email="test@example.com",
            password="password123",
            first_name="Test",
            last_name="User"
        )
        
        with patch('app.database.mongodb.get_database', return_value=AsyncMock()):
            with patch('app.repository.user_repository.UserRepository', return_value=mock_user_repo):
                response = test_client.post(
                    "/api/auth/register",
                    json=existing_user.dict()
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["user_id"] == existing_user.user_id
                
                # Verify user repo's create method was not called
                mock_user_repo.create.assert_not_called()
    
    def test_get_current_user_info(self, test_client, mock_jwt_auth):
        """Test getting current user info with valid token."""
        with patch('app.api.auth.get_current_user', return_value=mock_jwt_auth):
            response = test_client.get(
                "/api/auth/me",
                headers={"Authorization": "Bearer fake_token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["user_id"] == mock_jwt_auth.user_id
            assert data["email"] == mock_jwt_auth.email
    
    def test_verify_token_valid(self, test_client, mock_jwt_auth):
        """Test verifying a valid token."""
        with patch('app.api.auth.get_current_user', return_value=mock_jwt_auth):
            response = test_client.get(
                "/api/auth/verify",
                headers={"Authorization": "Bearer fake_token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["valid"] is True
            assert data["user_id"] == mock_jwt_auth.user_id
    
    def test_create_access_token(self):
        """Test token creation function."""
        token_data = {"sub": "testuser"}
        expires = timedelta(minutes=30)
        
        token = create_access_token(token_data, expires)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """Test get_current_user with invalid token."""
        with pytest.raises(Exception):
            await get_current_user("invalid_token") 