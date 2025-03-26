import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId

# Assuming the database utilities are in app.utils.db module
from app.utils.db import get_database, connect_to_mongo, close_mongo_connection
from app.utils.db import BaseRepository, UserRepository

class TestDatabaseConnection:
    
    @pytest.mark.asyncio
    @patch('motor.motor_asyncio.AsyncIOMotorClient')
    async def test_connect_to_mongo(self, mock_motor_client):
        """Test connecting to MongoDB."""
        # Setup mock
        mock_client = MagicMock()
        mock_motor_client.return_value = mock_client
        
        # Mock database and server_info
        mock_db = MagicMock()
        mock_client.__getitem__.return_value = mock_db
        mock_client.admin.command = AsyncMock(return_value={"version": "5.0.0"})
        
        # Call the function
        await connect_to_mongo("mongodb://localhost:27017", "test_db")
        
        # Assertions
        mock_motor_client.assert_called_once_with("mongodb://localhost:27017")
        mock_client.admin.command.assert_awaited_once_with('ismaster')
    
    @pytest.mark.asyncio
    @patch('motor.motor_asyncio.AsyncIOMotorClient')
    async def test_connect_to_mongo_connection_failure(self, mock_motor_client):
        """Test handling connection failure to MongoDB."""
        # Setup mock to raise an exception
        mock_client = MagicMock()
        mock_motor_client.return_value = mock_client
        mock_client.admin.command = AsyncMock(side_effect=ConnectionFailure("Connection refused"))
        
        # Call the function and check for exception
        with pytest.raises(ConnectionFailure):
            await connect_to_mongo("mongodb://localhost:27017", "test_db")
        
        # Assertions
        mock_motor_client.assert_called_once_with("mongodb://localhost:27017")
        mock_client.admin.command.assert_awaited_once_with('ismaster')
    
    @pytest.mark.asyncio
    @patch('app.utils.db.client', new_callable=MagicMock)
    async def test_close_mongo_connection(self, mock_client):
        """Test closing MongoDB connection."""
        # Call the function
        await close_mongo_connection()
        
        # Assertions
        mock_client.close.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('app.utils.db.client')
    @patch('app.utils.db.db')
    async def test_get_database(self, mock_db, mock_client):
        """Test getting the database instance."""
        # Setup mocks
        mock_db_instance = MagicMock()
        mock_db.__bool__.return_value = True
        mock_db.return_value = mock_db_instance
        
        # Call the function
        result = get_database()
        
        # Assertions
        assert result == mock_db
        assert not mock_client.__getitem__.called  # Should not be called if db exists

class TestBaseRepository:
    
    @pytest.fixture
    def base_repo(self):
        """Create a base repository instance with mocked collection."""
        repo = BaseRepository("test_collection")
        repo.collection = MagicMock()
        return repo
    
    @pytest.mark.asyncio
    async def test_save(self, base_repo):
        """Test saving a document."""
        # Mock data
        test_doc = {"_id": "test_id", "name": "Test Document"}
        
        # Mock insert_one response
        mock_result = MagicMock()
        mock_result.inserted_id = "test_id"
        base_repo.collection.insert_one = AsyncMock(return_value=mock_result)
        
        # Call the method
        result = await base_repo.save(test_doc)
        
        # Assertions
        assert result == "test_id"
        base_repo.collection.insert_one.assert_awaited_once_with(test_doc)
    
    @pytest.mark.asyncio
    async def test_find_by_id(self, base_repo):
        """Test finding a document by ID."""
        # Mock document
        mock_doc = {"_id": "test_id", "name": "Test Document"}
        
        # Mock find_one response
        base_repo.collection.find_one = AsyncMock(return_value=mock_doc)
        
        # Call the method
        result = await base_repo.find_by_id("test_id")
        
        # Assertions
        assert result == mock_doc
        base_repo.collection.find_one.assert_awaited_once_with({"_id": "test_id"})
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, base_repo):
        """Test handling when a document is not found."""
        # Mock find_one response for not found
        base_repo.collection.find_one = AsyncMock(return_value=None)
        
        # Call the method
        result = await base_repo.find_by_id("non_existent_id")
        
        # Assertions
        assert result is None
        base_repo.collection.find_one.assert_awaited_once_with({"_id": "non_existent_id"})
    
    @pytest.mark.asyncio
    async def test_find_all(self, base_repo):
        """Test finding all documents."""
        # Mock documents
        mock_docs = [
            {"_id": "id1", "name": "Doc 1"},
            {"_id": "id2", "name": "Doc 2"}
        ]
        
        # Mock find response
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_docs)
        base_repo.collection.find = MagicMock(return_value=mock_cursor)
        
        # Call the method
        result = await base_repo.find_all()
        
        # Assertions
        assert result == mock_docs
        assert len(result) == 2
        base_repo.collection.find.assert_called_once_with({})
        mock_cursor.to_list.assert_awaited_once_with(length=None)
    
    @pytest.mark.asyncio
    async def test_update(self, base_repo):
        """Test updating a document."""
        # Mock document and update data
        doc_id = "test_id"
        update_data = {"name": "Updated Document"}
        
        # Mock update_one response
        mock_result = MagicMock()
        mock_result.modified_count = 1
        base_repo.collection.update_one = AsyncMock(return_value=mock_result)
        
        # Call the method
        result = await base_repo.update(doc_id, update_data)
        
        # Assertions
        assert result is True
        base_repo.collection.update_one.assert_awaited_once_with(
            {"_id": doc_id}, {"$set": update_data}
        )
    
    @pytest.mark.asyncio
    async def test_update_not_found(self, base_repo):
        """Test updating a non-existent document."""
        # Mock document and update data
        doc_id = "non_existent_id"
        update_data = {"name": "Updated Document"}
        
        # Mock update_one response for not found
        mock_result = MagicMock()
        mock_result.modified_count = 0
        base_repo.collection.update_one = AsyncMock(return_value=mock_result)
        
        # Call the method
        result = await base_repo.update(doc_id, update_data)
        
        # Assertions
        assert result is False
        base_repo.collection.update_one.assert_awaited_once_with(
            {"_id": doc_id}, {"$set": update_data}
        )
    
    @pytest.mark.asyncio
    async def test_delete(self, base_repo):
        """Test deleting a document."""
        # Mock document ID
        doc_id = "test_id"
        
        # Mock delete_one response
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        base_repo.collection.delete_one = AsyncMock(return_value=mock_result)
        
        # Call the method
        result = await base_repo.delete(doc_id)
        
        # Assertions
        assert result is True
        base_repo.collection.delete_one.assert_awaited_once_with({"_id": doc_id})
    
    @pytest.mark.asyncio
    async def test_delete_not_found(self, base_repo):
        """Test deleting a non-existent document."""
        # Mock document ID
        doc_id = "non_existent_id"
        
        # Mock delete_one response for not found
        mock_result = MagicMock()
        mock_result.deleted_count = 0
        base_repo.collection.delete_one = AsyncMock(return_value=mock_result)
        
        # Call the method
        result = await base_repo.delete(doc_id)
        
        # Assertions
        assert result is False
        base_repo.collection.delete_one.assert_awaited_once_with({"_id": doc_id})


class TestUserRepository:
    
    @pytest.fixture
    def user_repo(self):
        """Create a user repository instance with mocked collection."""
        repo = UserRepository()
        repo.collection = MagicMock()
        return repo
    
    @pytest.mark.asyncio
    async def test_find_by_email(self, user_repo):
        """Test finding a user by email."""
        # Mock user data
        mock_user = {
            "_id": "user123",
            "email": "test@example.com",
            "hashed_password": "hashed_password_here"
        }
        
        # Mock find_one response
        user_repo.collection.find_one = AsyncMock(return_value=mock_user)
        
        # Call the method
        result = await user_repo.find_by_email("test@example.com")
        
        # Assertions
        assert result == mock_user
        user_repo.collection.find_one.assert_awaited_once_with({"email": "test@example.com"})
    
    @pytest.mark.asyncio
    async def test_find_by_email_not_found(self, user_repo):
        """Test handling when a user email is not found."""
        # Mock find_one response for not found
        user_repo.collection.find_one = AsyncMock(return_value=None)
        
        # Call the method
        result = await user_repo.find_by_email("nonexistent@example.com")
        
        # Assertions
        assert result is None
        user_repo.collection.find_one.assert_awaited_once_with({"email": "nonexistent@example.com"})
    
    @pytest.mark.asyncio
    async def test_find_by_username(self, user_repo):
        """Test finding a user by username."""
        # Mock user data
        mock_user = {
            "_id": "user123",
            "username": "testuser",
            "email": "test@example.com"
        }
        
        # Mock find_one response
        user_repo.collection.find_one = AsyncMock(return_value=mock_user)
        
        # Call the method
        result = await user_repo.find_by_username("testuser")
        
        # Assertions
        assert result == mock_user
        user_repo.collection.find_one.assert_awaited_once_with({"username": "testuser"})
    
    @pytest.mark.asyncio
    async def test_create_user(self, user_repo):
        """Test creating a new user."""
        # Mock user data
        user_data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123"
        }
        
        # Mock hashed password
        hashed_password = "hashed_password_here"
        
        # Mock get_password_hash
        with patch('app.utils.db.get_password_hash', return_value=hashed_password):
            # Mock insert_one response
            mock_result = MagicMock()
            mock_result.inserted_id = "new_user_id"
            user_repo.collection.insert_one = AsyncMock(return_value=mock_result)
            
            # Call the method
            user_id = await user_repo.create_user(user_data)
            
            # Assertions
            assert user_id == "new_user_id"
            # Check that password was hashed
            assert "password" not in user_data
            assert user_data["hashed_password"] == hashed_password
            user_repo.collection.insert_one.assert_awaited_once() 