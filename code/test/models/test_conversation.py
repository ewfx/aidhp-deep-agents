import pytest
from datetime import datetime
from app.models.conversation import Conversation, Message, MessageRole

class TestConversationModel:
    
    def test_message_creation(self):
        """Test creating a valid message object."""
        message_data = {
            "role": MessageRole.USER,
            "content": "Hello, how can you help me with financial planning?",
            "timestamp": datetime.now()
        }
        
        message = Message(**message_data)
        
        assert message.role == MessageRole.USER
        assert message.content == message_data["content"]
        assert isinstance(message.timestamp, datetime)
    
    def test_message_role_enum(self):
        """Test the MessageRole enum values."""
        assert MessageRole.USER.value == "user"
        assert MessageRole.ASSISTANT.value == "assistant"
        assert MessageRole.SYSTEM.value == "system"
    
    def test_conversation_creation(self):
        """Test creating a valid conversation object."""
        now = datetime.now()
        messages = [
            Message(role=MessageRole.SYSTEM, content="You are a financial advisor.", timestamp=now),
            Message(role=MessageRole.USER, content="I need retirement advice.", timestamp=now),
            Message(role=MessageRole.ASSISTANT, content="I can help with that.", timestamp=now)
        ]
        
        conversation_data = {
            "conversation_id": "test-conv-123",
            "user_id": "testuser",
            "messages": messages,
            "created_at": now,
            "updated_at": now,
            "title": "Financial Planning Discussion"
        }
        
        conversation = Conversation(**conversation_data)
        
        assert conversation.conversation_id == conversation_data["conversation_id"]
        assert conversation.user_id == conversation_data["user_id"]
        assert len(conversation.messages) == 3
        assert conversation.messages[0].role == MessageRole.SYSTEM
        assert conversation.messages[1].role == MessageRole.USER
        assert conversation.messages[2].role == MessageRole.ASSISTANT
        assert isinstance(conversation.created_at, datetime)
        assert isinstance(conversation.updated_at, datetime)
        assert conversation.title == conversation_data["title"]
    
    def test_conversation_with_minimal_data(self):
        """Test creating a conversation with only required fields."""
        conversation_data = {
            "conversation_id": "test-conv-123",
            "user_id": "testuser",
            "messages": []
        }
        
        conversation = Conversation(**conversation_data)
        
        assert conversation.conversation_id == conversation_data["conversation_id"]
        assert conversation.user_id == conversation_data["user_id"]
        assert len(conversation.messages) == 0
        assert isinstance(conversation.created_at, datetime)
        assert isinstance(conversation.updated_at, datetime)
        assert conversation.title is None
    
    def test_add_message_to_conversation(self):
        """Test adding a message to an existing conversation."""
        conversation = Conversation(
            conversation_id="test-conv-123",
            user_id="testuser",
            messages=[]
        )
        
        # Initial state
        assert len(conversation.messages) == 0
        
        # Add a message
        new_message = Message(
            role=MessageRole.USER,
            content="New question",
            timestamp=datetime.now()
        )
        
        # In a real application, you'd have a method to add messages
        # Here we're simulating it by updating the messages list
        conversation.messages.append(new_message)
        
        # Check the message was added
        assert len(conversation.messages) == 1
        assert conversation.messages[0].role == MessageRole.USER
        assert conversation.messages[0].content == "New question"
    
    def test_conversation_with_metadata(self):
        """Test conversation with metadata field."""
        metadata = {
            "source": "web",
            "browser": "Chrome",
            "tags": ["retirement", "planning"]
        }
        
        conversation = Conversation(
            conversation_id="test-conv-123",
            user_id="testuser",
            messages=[],
            metadata=metadata
        )
        
        assert conversation.metadata == metadata
        assert conversation.metadata["source"] == "web"
        assert "retirement" in conversation.metadata["tags"] 