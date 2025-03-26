#!/usr/bin/env python3
import asyncio
from app.database.mongodb import get_database

async def main():
    try:
        print("Getting database connection...")
        db = await get_database()
        print("Database connection established")
        
        # Find user by user_id
        user = await db["users"].find_one({"user_id": "testuser"})
        print("User document:", user)
        
        if user:
            # Check if hashed_password is present
            if "hashed_password" in user:
                print("hashed_password is present in the document")
            else:
                print("WARNING: hashed_password field is missing!")
                print("Available fields:", list(user.keys()))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 