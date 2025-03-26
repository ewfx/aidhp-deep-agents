from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, status, Body, Form, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import logging
import bcrypt  # Add explicit import for bcrypt

from app.models.user import User, UserInDB, UserCreate, Token, TokenData, UserData
from app.repository.user_repository import UserRepository
from app.database.mongodb import get_database
from app.config import settings

# Security configurations
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/get-token")

router = APIRouter()

logger = logging.getLogger(__name__)

# Request models
class LoginRequest(BaseModel):
    username: str
    password: str

def verify_password(plain_password, hashed_password):
    try:
        logger.debug(f"Verifying password with bcrypt version: {bcrypt.__version__}")
        # Use bcrypt directly instead of passlib
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Error in password verification: {str(e)}")
        # Fallback to passlib if bcrypt direct approach fails
        return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(user_id: str):
    db = await get_database()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_user_id(user_id)
    if user:
        return user
    return None

async def authenticate_user(user_repo, username: str, password: str):
    user = await get_user(username)
    if not user:
        logger.warning(f"User not found: {username}")
        return False
    # More detailed logging
    logger.debug(f"Authenticating user: {username}")
    logger.debug(f"User object: {type(user).__name__}")
    logger.debug(f"User attributes: {[attr for attr in dir(user) if not attr.startswith('_')]}")
    
    if not hasattr(user, 'hashed_password'):
        logger.error(f"User object has no hashed_password attribute")
        return False
        
    logger.debug(f"Hashed password: {user.hashed_password[:10]}...")
    
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Invalid password for user: {username}")
        return False
    logger.info(f"Authentication successful for user: {username}")
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(sub=user_id, user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = await get_user(user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(request: Request):
    """
    Handle login and issue JWT token.
    Supports both form data and JSON for flexibility.
    """
    try:
        content_type = request.headers.get("Content-Type", "")
        
        # Handle form data (OAuth2 password flow)
        if "application/x-www-form-urlencoded" in content_type:
            form_data = await request.form()
            username = form_data.get("username")
            password = form_data.get("password")
        # Handle JSON data
        else:
            try:
                json_data = await request.json()
                username = json_data.get("username")
                password = json_data.get("password")
            except Exception as e:
                logger.error(f"Error parsing JSON: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid request format: {str(e)}"
                )
        
        # Validate username and password are provided
        if not username or not password:
            logger.warning(f"Login attempt with missing credentials: username={username is not None}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )
        
        # Log login attempt
        logger.info(f"Login attempt for user: {username}")
        
        # Get database and user repository
        db = await get_database()
        user_repo = UserRepository(db)
        
        # Authenticate user
        user = await authenticate_user(user_repo, username, password)
        if not user:
            logger.warning(f"Failed login attempt for user: {username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect user ID or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.user_id}, expires_delta=access_token_expires
        )
        
        # Update last login time
        await user_repo.update_user_last_login(user.user_id)
        
        # Return token
        return {"access_token": access_token, "token_type": "bearer", "user_id": user.user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        # Return a generic error to avoid exposing implementation details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login: {str(e)}"
        )

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate = Body(...)):
    logger.info(f"Registration attempt for user: {user_data.user_id}")
    db = await get_database()
    user_repo = UserRepository(db)
    
    # Check if user already exists
    existing_user = await user_repo.get_by_user_id(user_data.user_id)
    if existing_user:
        logger.info(f"User already exists: {user_data.user_id}")
        # User exists, return the existing user
        return existing_user
    
    try:
        # Create new user
        created_user = await user_repo.create(user_data)
        logger.info(f"Successfully registered new user: {created_user.user_id}")
        return created_user
    except ValueError as e:
        logger.error(f"Error registering user {user_data.user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/verify", response_model=dict)
async def verify_token(current_user: User = Depends(get_current_user)):
    """
    Verify if the current token is valid.
    This is used by the frontend to check if a stored token is still valid.
    """
    return {"valid": True, "user_id": current_user.user_id}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    This is used by the frontend to get user details after login or token verification.
    """
    return current_user

@router.get("/user-data", response_model=UserData)
async def get_user_data(current_user: User = Depends(get_current_user)):
    """
    Get comprehensive user data from various CSV sources.
    """
    db = await get_database()
    user_repo = UserRepository(db)
    raw_user_data = await user_repo.get_user_data(current_user.user_id)
    
    if not raw_user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User data not found"
        )
    
    # Use the UserData model to validate and serialize the data
    try:
        user_data = UserData.model_validate({
            "user_id": current_user.user_id,
            "demographic_data": raw_user_data.get("demographics"),
            "account_data": raw_user_data.get("account"),
            "credit_history": raw_user_data.get("credit"),
            "investment_data": raw_user_data.get("investments"),
            "recent_transactions": raw_user_data.get("recent_transactions")
        })
        return user_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing user data: {str(e)}"
        )

@router.get("/validate")
async def validate_token(current_user: User = Depends(get_current_user)):
    """
    Validate the current token and return user information if valid
    """
    return {
        "valid": True,
        "user_id": current_user.user_id,
        "email": current_user.email
    } 