from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List
import logging
import uuid
import traceback
from app.models.user import User
from app.api.auth import get_current_user
from app.services.llm_service import get_llm_service
from app.repository.user_repository import UserRepository
from app.database.mongodb import get_database

router = APIRouter()
logger = logging.getLogger(__name__)

# Request and response models
class OnboardingRequest(BaseModel):
    session_id: Optional[str] = None
    message: Optional[str] = None
    user_id: Optional[str] = None

class OnboardingResponse(BaseModel):
    session_id: str
    text: str
    complete: bool = False

# Session store (in-memory for prototype)
# In production, this should be stored in a database
onboarding_sessions = {}

@router.post("/start", response_model=OnboardingResponse)
async def start_onboarding(current_user: User = Depends(get_current_user)):
    """
    Initialize a new onboarding session for the user.
    Generates an initial prompt based on user data.
    """
    try:
        logger.info(f"Starting onboarding session for user: {current_user.user_id}")
        
        # Create a new session ID
        session_id = str(uuid.uuid4())
        
        # Get user data from database to personalize the onboarding
        db = await get_database()
        user_repo = UserRepository(db)
        user_data = await user_repo.get_user_data(current_user.user_id)
        
        # Get LLM service
        llm_service = get_llm_service()
        logger.info(f"Using LLM provider: {llm_service.provider} with model: {llm_service.model}")
        
        # Create initial meta-prompt
        meta_prompt = f"""You are a financial advisor chatbot helping with onboarding a new user.
User ID: {current_user.user_id}
Today's date: {datetime.now().strftime('%Y-%m-%d')}

Your goal is to ask the user a series of questions to understand their financial goals and needs better. 
Be conversational, friendly, and concise. Ask one question at a time.

Your response should follow this format:
1. Acknowledge what the user said (if applicable)
2. Provide a brief insight or context related to the topic
3. Ask a clear, specific question to gather more information

Start with asking about their primary financial goals.
"""
        
        # Add user data to meta-prompt if available
        if user_data:
            if "demographics" in user_data and user_data["demographics"]:
                demo = user_data["demographics"]
                meta_prompt += f"\nUser demographics: Age: {demo.get('age', 'Unknown')}, Occupation: {demo.get('occupation', 'Unknown')}, Income bracket: {demo.get('income_bracket', 'Unknown')}"
            
            if "account" in user_data and user_data["account"]:
                account = user_data["account"]
                meta_prompt += f"\nAccount balance: ${account.get('balance', 0):,.2f}, Account type: {account.get('account_type', 'Unknown')}"
            
            if "credit" in user_data and user_data["credit"]:
                credit = user_data["credit"]
                meta_prompt += f"\nCredit score: {credit.get('credit_score', 'Unknown')}"
        
        # Store the session with initial meta-prompt
        onboarding_sessions[session_id] = {
            "user_id": current_user.user_id,
            "meta_prompt": meta_prompt,
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "complete": False
        }
        
        # Format messages for LLM
        messages = [
            {"role": "system", "content": meta_prompt},
            {"role": "user", "content": "Please ask the user about their primary financial goals."}
        ]
        
        # Generate the first question from the LLM
        try:
            logger.info(f"Generating first question for session: {session_id}")
            first_question = await llm_service.generate_response(messages)
            logger.info(f"Generated first question: {first_question[:50]}...")
        except Exception as llm_error:
            logger.error(f"Error generating first question: {str(llm_error)}")
            logger.error(traceback.format_exc())
            first_question = "Welcome! I'd like to understand your financial goals better. What are your main financial priorities right now? For example, are you looking to save for a specific goal, invest for the future, or manage debt?"
        
        # Store the first bot message
        onboarding_sessions[session_id]["messages"].append({
            "role": "system",
            "content": first_question,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"Onboarding session started successfully: {session_id}")
        return OnboardingResponse(
            session_id=session_id,
            text=first_question,
            complete=False
        )
        
    except Exception as e:
        logger.error(f"Error starting onboarding: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start onboarding session: {str(e)}"
        )

@router.post("/update", response_model=OnboardingResponse)
async def update_onboarding(
    request: OnboardingRequest = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Update an onboarding session with new user input.
    Generates the next question or completes the session.
    """
    try:
        session_id = request.session_id
        message = request.message
        
        logger.info(f"Updating onboarding session: {session_id} for user: {current_user.user_id}")
        logger.info(f"User message: {message[:50]}..." if message else "No message provided")
        
        # Validate session exists
        if not session_id or session_id not in onboarding_sessions:
            logger.warning(f"Session not found: {session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding session not found"
            )
        
        # Get session
        session = onboarding_sessions[session_id]
        
        # Validate user owns the session
        if session["user_id"] != current_user.user_id:
            logger.warning(f"Unauthorized access attempt to session {session_id} by user {current_user.user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        # Add user message to session
        session["messages"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Get LLM service
        llm_service = get_llm_service()
        logger.info(f"Using LLM provider: {llm_service.provider} with model: {llm_service.model}")
        
        # Construct messages for the LLM
        messages = [{"role": "system", "content": session["meta_prompt"]}]
        
        # Add conversation history
        for msg in session["messages"]:
            role = "assistant" if msg["role"] == "system" else msg["role"]
            messages.append({"role": role, "content": msg["content"]})
        
        # Determine if we should complete the onboarding
        turn_count = sum(1 for msg in session["messages"] if msg["role"] == "user")
        should_complete = turn_count >= 4  # After 4 user messages, complete onboarding
        
        # Add completion instruction if needed
        if should_complete:
            messages.append({
                "role": "system", 
                "content": "Onboarding is complete. Thank the user and inform them you have all the information needed to provide personalized recommendations."
            })
        else:
            messages.append({
                "role": "system", 
                "content": "Based on the conversation so far, ask the next relevant question to understand the user's financial situation better. Follow the specified format: acknowledge their response, provide brief context, and ask a clear question."
            })
        
        # Generate response from LLM
        try:
            logger.info(f"Generating response for session: {session_id}, turn: {turn_count}")
            bot_response = await llm_service.generate_response(messages)
            logger.info(f"Generated response: {bot_response[:50]}...")
        except Exception as llm_error:
            logger.error(f"Error generating response: {str(llm_error)}")
            logger.error(traceback.format_exc())
            
            if should_complete:
                bot_response = "Thank you for sharing your financial information! I have all the details I need to provide you with personalized recommendations. You can now view your dashboard to see tailored insights for your financial situation."
            else:
                bot_response = "Thank you for that information. Could you tell me more about your financial timeline? Are you planning for short-term goals, long-term retirement, or perhaps something in between?"
        
        # Add bot response to session
        session["messages"].append({
            "role": "system",
            "content": bot_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update session metadata
        session["last_updated"] = datetime.now().isoformat()
        session["complete"] = should_complete
        
        logger.info(f"Onboarding session updated successfully: {session_id}, complete: {should_complete}")
        return OnboardingResponse(
            session_id=session_id,
            text=bot_response,
            complete=should_complete
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating onboarding: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update onboarding session: {str(e)}"
        )

@router.post("/complete", response_model=OnboardingResponse)
async def complete_onboarding(
    request: OnboardingRequest = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Mark an onboarding session as complete and update user's financial persona.
    """
    try:
        session_id = request.session_id
        
        logger.info(f"Completing onboarding session: {session_id} for user: {current_user.user_id}")
        
        # Validate session exists
        if not session_id or session_id not in onboarding_sessions:
            logger.warning(f"Session not found: {session_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding session not found"
            )
        
        # Get session
        session = onboarding_sessions[session_id]
        
        # Validate user owns the session
        if session["user_id"] != current_user.user_id:
            logger.warning(f"Unauthorized access attempt to session {session_id} by user {current_user.user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        # Mark session as complete
        session["complete"] = True
        session["last_updated"] = datetime.now().isoformat()
        
        # Get LLM service
        llm_service = get_llm_service()
        
        # Prepare messages for final response
        messages = [
            {"role": "system", "content": session["meta_prompt"] + "\n\nThe onboarding is now complete."},
            {"role": "user", "content": "Thank the user for completing the onboarding and tell them their personalized recommendations are ready to view."}
        ]
        
        # Generate final message
        try:
            logger.info(f"Generating final message for session: {session_id}")
            final_message = await llm_service.generate_response(messages)
            logger.info(f"Generated final message: {final_message[:50]}...")
        except Exception as llm_error:
            logger.error(f"Error generating final message: {str(llm_error)}")
            logger.error(traceback.format_exc())
            final_message = "Thank you for completing the onboarding process! Your personalized financial recommendations are now ready to view on your dashboard. I've analyzed your information and prepared insights tailored specifically to your situation and goals."
        
        # Add final message to session
        session["messages"].append({
            "role": "system",
            "content": final_message,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Onboarding session completed successfully: {session_id}")
        return OnboardingResponse(
            session_id=session_id,
            text=final_message,
            complete=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing onboarding: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding session: {str(e)}"
        ) 