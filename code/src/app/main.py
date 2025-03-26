import logging
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from starlette.responses import RedirectResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from PIL import Image
import io
import traceback
import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
from datetime import datetime

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.chatbot.enhanced_chatbot import EnhancedChatbot
from app.dependencies import get_chatbot, get_current_active_user
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.recommendations import router as recommendations_router
from app.repository.chat_repository import ChatRepository
from app.utils.import_csv import import_csv_to_collection, csv_to_dict
from app.api import auth, chat, document, financial, recommendations
from app.api import onboard  # Import the new onboarding API module
from app.data_initializer import initialize_database, add_synthetic_data

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app")

class HeaderSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Process the request as normal
        response = await call_next(request)
        return response

app = FastAPI(
    title="Financial Advisory API",
    description="API for financial advisory services",
    version="1.0.0",
)

# Add header size middleware
app.add_middleware(HeaderSizeMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files - comment out if causing issues
# app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers with the /api prefix to match frontend expectations
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(document.router, prefix="/api/documents", tags=["Documents"])
app.include_router(financial.router, prefix="/api/financial", tags=["Financial"])
app.include_router(onboard.router, prefix="/api/onboard", tags=["Onboarding"])

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up the application...")
    try:
        # Initialize the database with sample data
        await initialize_database()
        logger.info("Database initialized successfully")
        
        # Only add synthetic data if environment variable is set
        if os.environ.get("ADD_SYNTHETIC_DATA", "false").lower() == "true":
            await add_synthetic_data()
            logger.info("Synthetic data added successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down the application...")
    await close_mongo_connection()

# Pydantic models for request/response
class ChatResponse(BaseModel):
    response: str
    recommendations: List[Dict[str, Any]] = []

@app.get("/")
async def root():
    """Redirect to the frontend UI."""
    return RedirectResponse(url="/static/index.html")

@app.post("/simple_chat", response_model=ChatResponse)
async def simple_chat_endpoint(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    chatbot: EnhancedChatbot = Depends(get_chatbot),
):
    """
    Simple chat endpoint that doesn't require authentication.
    Accepts form data with a message and optional image.
    """
    try:
        # Process image if provided
        pil_image = None
        if image:
            try:
                image_bytes = await image.read()
                pil_image = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                logger.error(f"Error processing image: {e}")
                logger.error(traceback.format_exc())
                # Continue without image instead of failing
        
        # For unauthenticated users, use a generic user ID
        user_id = "guest-user"
        
        # Process message
        try:
            response, recommendations = await chatbot.process_message(
                user_id=user_id,
                message=message,
                image=pil_image
            )
            
            # Log response for debugging
            logger.info(f"Generated response for guest user: {response[:50]}...")
            
            return ChatResponse(
                response=response,
                recommendations=recommendations
            )
        except Exception as inner_e:
            logger.error(f"Error in chatbot processing: {inner_e}")
            logger.error(traceback.format_exc())
            # Return fallback response instead of raising exception
            return ChatResponse(
                response="I apologize, but I encountered an issue processing your message. I'm a financial advisor chatbot that can help with investment advice, savings strategies, and debt management. Could you try asking in a different way?",
                recommendations=[]
            )
    except Exception as e:
        logger.error(f"Error in simple chat endpoint: {e}")
        logger.error(traceback.format_exc())
        # Return a JSON response instead of raising an exception
        return ChatResponse(
            response="I apologize, but something went wrong. Please try again later.",
            recommendations=[]
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000,
        h11_max_incomplete_event_size=32768  # Increase header size limit
    ) 