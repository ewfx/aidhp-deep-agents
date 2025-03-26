import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def check_database():
    """Check the database for user accounts."""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        db = client.financial_db
        
        # Check if users collection exists
        users = await db.users.find({}).to_list(length=None)
        print(f"Found {len(users)} users in database")
        
        # Print user details
        for user in users:
            print(f"User ID: {user.get('_id')}, Username: {user.get('username')}")
            
        # If no users, check what collections exist
        if not users:
            collections = await db.list_collection_names()
            print(f"Available collections: {collections}")
            
        # Return a test user if one exists
        test_user = next((user for user in users if user.get('username') == 'test@example.com'), None)
        if test_user:
            return test_user.get('_id'), test_user.get('username')
        else:
            return None, None
            
    except Exception as e:
        logger.error(f"Error checking database: {str(e)}")
        return None, None

async def main():
    """Main function."""
    print("Checking database for user accounts...")
    user_id, username = await check_database()
    
    if user_id:
        print(f"\nTest user found: ID={user_id}, Username={username}")
    else:
        print("\nNo test user found in database")

if __name__ == "__main__":
    asyncio.run(main()) 