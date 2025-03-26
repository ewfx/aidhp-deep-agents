#!/usr/bin/env python3
import asyncio
from app.repository.user_repository import UserRepository
from app.database.mongodb import get_database
from passlib.context import CryptContext

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    try:
        print("Getting database connection...")
        db = await get_database()
        print("Database connection established")
        
        # Create user repository
        user_repo = UserRepository(db)
        
        # Find user by user_id
        user_id = "testuser"
        password = "testpassword"
        
        # Get user from database
        print(f"Fetching user with ID: {user_id}")
        user = await user_repo.get_by_user_id(user_id)
        
        if not user:
            print(f"User not found: {user_id}")
            return
        
        print("User found:")
        print(f"User ID: {user.user_id}")
        print(f"Email: {user.email}")
        print(f"Has hashed_password attribute: {hasattr(user, 'hashed_password')}")
        
        if hasattr(user, 'hashed_password'):
            print(f"hashed_password: {user.hashed_password[:10]}...")
            
            # Verify password
            is_valid = user_repo.verify_password(password, user.hashed_password)
            print(f"Password verification result: {is_valid}")
        else:
            print("User object has no hashed_password attribute!")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 