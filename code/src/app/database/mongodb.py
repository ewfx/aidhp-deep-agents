import logging
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
from app.config import settings
import asyncio
from typing import Dict, List, Any, Optional
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database connection
_mongo_client: Optional[AsyncIOMotorClient] = None
_mongo_db: Optional[AsyncIOMotorDatabase] = None
mock_db: Dict[str, List[Dict[str, Any]]] = None

class MockCollection:
    def __init__(self, name: str, data: List[Dict[str, Any]] = None):
        self.name = name
        self.data = data or []
    
    async def find_one(self, query: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        if not query:
            return self.data[0] if self.data else None
        
        for item in self.data:
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                return item
        return None
    
    async def find(self, query: Dict[str, Any] = None):
        results = []
        if not query:
            return self.data
        
        for item in self.data:
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                results.append(item)
        
        class MockCursor:
            def __init__(self, items):
                self.items = items
            
            def sort(self, *args, **kwargs):
                # Simple sorting could be implemented here
                return self
            
            async def to_list(self, length=None):
                return self.items[:length] if length else self.items
        
        return MockCursor(results)
    
    async def insert_one(self, document: Dict[str, Any]):
        self.data.append(document)
        class MockInsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return MockInsertResult(document.get('_id', 'mock_id'))
    
    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        item = await self.find_one(query)
        if item:
            # Handle $set operator
            if '$set' in update:
                for key, value in update['$set'].items():
                    item[key] = value
            # Handle direct updates
            else:
                for key, value in update.items():
                    item[key] = value
            class MockUpdateResult:
                def __init__(self, matched_count, modified_count, upserted_id=None):
                    self.matched_count = matched_count
                    self.modified_count = modified_count
                    self.upserted_id = upserted_id
            return MockUpdateResult(1, 1)
        elif upsert:
            # Upsert: create if not exists
            new_doc = {**query}
            if '$set' in update:
                new_doc.update(update['$set'])
            else:
                new_doc.update(update)
            await self.insert_one(new_doc)
            return MockUpdateResult(0, 0, 'mock_id')
        else:
            return MockUpdateResult(0, 0)

class MockDatabase:
    def __init__(self):
        self.collections = {
            "users": MockCollection("users", [
                {"_id": "1", "user_id": "testuser", "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", "full_name": "Test User", "email": "test@example.com"}
            ]),
            "account_data": MockCollection("account_data"),
            "credit_history": MockCollection("credit_history"),
            "demographic_data": MockCollection("demographic_data"),
            "investment_data": MockCollection("investment_data"),
            "transaction_data": MockCollection("transaction_data"),
            "products": MockCollection("products"),
        }
    
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]
    
    async def list_collection_names(self):
        return list(self.collections.keys())
    
    async def command(self, command):
        # Mock ping command
        if command == "ping":
            return {"ok": 1}
        return {"ok": 0}

async def get_database() -> AsyncIOMotorDatabase:
    """
    Get the MongoDB database instance.
    
    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance.
    """
    if _mongo_db is None:
        await connect_to_mongo()
    return _mongo_db

async def connect_to_mongo():
    """
    Connect to MongoDB using settings from configuration.
    Updates the global _mongo_client and _mongo_db variables.
    """
    global _mongo_client, _mongo_db
    
    if _mongo_client is not None:
        return
    
    # Check if we should use local MongoDB
    if settings.USE_LOCAL_DB:
        logger.info("Using local MongoDB connection")
        # Use localhost with default port
        mongo_url = "mongodb://localhost:27017"
        db_name = settings.MONGODB_DB or "financial_assistant"
    else:
        logger.info("Using remote MongoDB connection")
        # URL encode username and password
        username = urllib.parse.quote_plus(settings.MONGODB_USER)
        password = urllib.parse.quote_plus(settings.MONGODB_PASSWORD)
        
        # Build connection string with encoded credentials
        mongo_url = settings.MONGODB_URL.replace(
            f"{settings.MONGODB_USER}:{settings.MONGODB_PASSWORD}",
            f"{username}:{password}"
        )
        db_name = settings.MONGODB_DB
    
    logger.info(f"Connecting to MongoDB at {mongo_url}, database: {db_name}")
    
    try:
        _mongo_client = AsyncIOMotorClient(mongo_url)
        _mongo_db = _mongo_client[db_name]
        
        # Validate connection by issuing a simple command
        await _mongo_db.command("ping")
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """
    Close the MongoDB connection.
    """
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB connection closed") 