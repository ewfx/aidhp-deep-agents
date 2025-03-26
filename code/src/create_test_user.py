#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import logging
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define test user properties
TEST_USER_EMAIL = "testuser"  # Changed from test@example.com to testuser
TEST_USER_PASSWORD = "password123"

# Get MongoDB connection string from environment
MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DB = os.getenv("MONGODB_DB", "dataset")

async def create_test_user():
    """Create a test user in the database."""
    try:
        # Connect to MongoDB
        logger.info(f"Connecting to MongoDB at {MONGODB_URL}, database: {MONGODB_DB}")
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[MONGODB_DB]
        
        # Create users collection if it doesn't exist
        if "users" not in await db.list_collection_names():
            logger.info("Creating users collection")
        
        # Check if test user already exists
        existing_user = await db.users.find_one({"username": TEST_USER_EMAIL})
        if existing_user:
            logger.info(f"Test user already exists: {existing_user.get('_id')}")
            # Update password to ensure it's correct
            hashed_password = pwd_context.hash(TEST_USER_PASSWORD)
            await db.users.update_one(
                {"_id": existing_user.get('_id')},
                {"$set": {"hashed_password": hashed_password}}
            )
            logger.info("Updated password for existing test user")
            return existing_user.get('_id'), TEST_USER_EMAIL
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash(TEST_USER_PASSWORD)
        
        user_data = {
            "_id": user_id,
            "username": TEST_USER_EMAIL,
            "hashed_password": hashed_password,
            "full_name": "Test User",
            "email": TEST_USER_EMAIL,
            "disabled": False,
            "is_admin": False,
            "created_at": datetime.now().isoformat(),
            "last_login": None,
            "onboarding_completed": False
        }
        
        result = await db.users.insert_one(user_data)
        logger.info(f"Test user created with ID: {user_id}")
        
        # Create some sample demographic data
        demo_data = {
            "user_id": user_id,
            "age": 35,
            "occupation": "Software Engineer",
            "income_bracket": "$100,000 - $150,000",
            "created_at": datetime.now().isoformat()
        }
        
        await db.demographic_data.insert_one(demo_data)
        logger.info("Added demographic data for test user")
        
        # Create sample account data
        account_data = {
            "user_id": user_id,
            "account_type": "Checking",
            "balance": 15000.00,
            "created_at": datetime.now().isoformat()
        }
        
        await db.account_data.insert_one(account_data)
        logger.info("Added account data for test user")
        
        return user_id, TEST_USER_EMAIL
            
    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}")
        return None, None

async def main():
    """Main function."""
    print("Creating test user...")
    user_id, username = await create_test_user()
    
    if user_id:
        print(f"\nTest user created: ID={user_id}, Username={username}")
        print("\nYou can now use these credentials to test the API:")
        print("Username: testuser")
        print("Password: password123")
    else:
        print("\nFailed to create test user")

if __name__ == "__main__":
    asyncio.run(main()) 