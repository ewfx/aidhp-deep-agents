import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.llm_service import LLMService
from app.models.user import User
from app.models.conversation import Conversation, Message, MessageRole
from app.models.document import Document, DocumentType

class TestLLMService:
    
    @pytest.fixture
    def llm_service(self):
        """Create a test LLM service instance."""
        service = LLMService()
        # Mock any external API dependencies
        service._client = MagicMock()
        return service
    
    @pytest.mark.asyncio
    async def test_generate_chat_response(self, llm_service):
        """Test generating a chat response from user input."""
        # Mock user and conversation
        user = User(
            user_id="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        conversation = Conversation(
            conversation_id="conv-123",
            user_id="testuser",
            messages=[
                Message(role=MessageRole.SYSTEM, content="You are a financial advisor."),
                Message(role=MessageRole.USER, content="I want to save for retirement.")
            ]
        )
        
        # Mock LLM response
        mock_response = MagicMock()
        mock_content = "To save for retirement, you should consider investing in a diversified portfolio including 401(k), IRA, and index funds."
        mock_response.choices = [MagicMock(message=MagicMock(content=mock_content))]
        llm_service._client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # Call the method
        response = await llm_service.generate_chat_response(user, conversation, "I want to save for retirement.")
        
        # Assertions
        assert response == mock_content
        # Verify the LLM API was called correctly with the right messages
        llm_service._client.chat.completions.create.assert_awaited_once()
        # You can add more specific assertions about the call parameters if needed
    
    @pytest.mark.asyncio
    async def test_generate_onboarding_question(self, llm_service):
        """Test generating onboarding questions."""
        # Mock user responses
        user_responses = [
            {"question": "What is your current age?", "answer": "35"},
            {"question": "What are your financial goals?", "answer": "Saving for a house and retirement"}
        ]
        
        # Mock LLM response
        mock_response = MagicMock()
        mock_content = "What is your current income level?"
        mock_response.choices = [MagicMock(message=MagicMock(content=mock_content))]
        llm_service._client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # Call the method
        next_question = await llm_service.generate_onboarding_question(user_responses)
        
        # Assertions
        assert next_question == mock_content
        llm_service._client.chat.completions.create.assert_awaited_once()
    
    @pytest.mark.asyncio
    async def test_generate_document(self, llm_service):
        """Test generating a financial planning document."""
        # Mock user
        user = User(
            user_id="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        # Mock user profile data
        user_profile = {
            "age": 35,
            "income": "$75,000",
            "goals": ["Buy a house", "Retirement"],
            "risk_tolerance": "Moderate"
        }
        
        # Mock document template
        template = "Financial Plan for {first_name} {last_name}\n\nAge: {age}\nIncome: {income}\n\nRecommendations:"
        
        # Mock LLM response
        mock_response = MagicMock()
        mock_content = """Financial Plan for Test User

Age: 35
Income: $75,000

Recommendations:
1. Establish an emergency fund of $15,000-$22,500
2. Max out 401(k) contributions up to employer match
3. Open a Roth IRA and contribute $6,000 annually
4. Save 20% of your income for house down payment
5. Consider index funds for long-term investments"""
        
        mock_response.choices = [MagicMock(message=MagicMock(content=mock_content))]
        llm_service._client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # Call the method
        document = await llm_service.generate_document(
            user, 
            DocumentType.FINANCIAL_PLAN, 
            user_profile,
            template
        )
        
        # Assertions
        assert isinstance(document, Document)
        assert document.user_id == "testuser"
        assert document.doc_type == DocumentType.FINANCIAL_PLAN
        assert document.content == mock_content
        llm_service._client.chat.completions.create.assert_awaited_once()
    
    @pytest.mark.asyncio
    async def test_analyze_financial_data(self, llm_service):
        """Test analyzing financial data."""
        # Mock financial data
        financial_data = {
            "income": 75000,
            "expenses": 50000,
            "savings": 25000,
            "investments": [
                {"type": "401k", "amount": 50000},
                {"type": "Stocks", "amount": 20000}
            ]
        }
        
        # Mock LLM response
        mock_response = MagicMock()
        mock_content = """Financial Analysis:
- Income exceeds expenses by $25,000 annually, which is good
- Current savings rate is 33%, which is excellent
- Retirement accounts make up 71% of investments, which is appropriate
- Consider diversifying with some bond investments for stability"""
        
        mock_response.choices = [MagicMock(message=MagicMock(content=mock_content))]
        llm_service._client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # Call the method
        analysis = await llm_service.analyze_financial_data(financial_data)
        
        # Assertions
        assert analysis == mock_content
        llm_service._client.chat.completions.create.assert_awaited_once()
    
    @pytest.mark.asyncio
    async def test_error_handling(self, llm_service):
        """Test handling of LLM service errors."""
        # Mock a failed API call
        llm_service._client.chat.completions.create = AsyncMock(side_effect=Exception("API Error"))
        
        # Mock user and conversation
        user = User(user_id="testuser", email="test@example.com")
        conversation = Conversation(
            conversation_id="conv-123",
            user_id="testuser",
            messages=[
                Message(role=MessageRole.USER, content="Test message")
            ]
        )
        
        # Call the method and check error handling
        with pytest.raises(Exception):
            await llm_service.generate_chat_response(user, conversation, "Test message")
        
        # Verify the LLM API was called
        llm_service._client.chat.completions.create.assert_awaited_once()
    
    @pytest.mark.asyncio
    async def test_system_prompt_customization(self, llm_service):
        """Test customizing system prompts based on user profile."""
        # Mock user with detailed profile
        user = User(
            user_id="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User",
            metadata={
                "profile": {
                    "age": 55,
                    "risk_tolerance": "Conservative",
                    "investment_experience": "Moderate",
                    "goals": ["Retirement in 10 years", "College fund"]
                }
            }
        )
        
        conversation = Conversation(
            conversation_id="conv-123",
            user_id="testuser",
            messages=[]
        )
        
        # Mock response
        mock_response = MagicMock()
        mock_content = "Here's my conservative retirement advice appropriate for someone nearing retirement..."
        mock_response.choices = [MagicMock(message=MagicMock(content=mock_content))]
        llm_service._client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # Call with a method that uses custom system prompts based on user profile
        # This is a hypothetical method name, adjust based on actual implementation
        response = await llm_service.generate_personalized_advice(user, conversation, "retirement planning")
        
        # Assertions
        llm_service._client.chat.completions.create.assert_awaited_once()
        
        # Verify that the system prompt was customized
        # This assumes the implementation uses customized system prompts
        # You'd need to adjust this based on the actual implementation
        call_args = llm_service._client.chat.completions.create.call_args[1]
        messages = call_args.get('messages', [])
        
        # Find system message
        system_messages = [msg for msg in messages if msg.get('role') == 'system']
        assert len(system_messages) > 0
        
        # Check for personalization in the system message
        system_content = system_messages[0].get('content', '')
        assert "Conservative" in system_content or "retirement" in system_content.lower() 