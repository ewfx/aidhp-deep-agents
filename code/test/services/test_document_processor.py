import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.document_processor import DocumentProcessor
from app.models.document import Document, DocumentType, DocumentStatus
from app.models.user import User

class TestDocumentProcessor:
    
    @pytest.fixture
    def document_processor(self):
        """Create a test document processor instance."""
        processor = DocumentProcessor()
        # Mock any dependencies
        processor.llm_service = MagicMock()
        processor.document_repository = MagicMock()
        return processor
    
    @pytest.mark.asyncio
    async def test_create_financial_plan(self, document_processor):
        """Test creating a financial plan document."""
        # Mock user
        user = User(
            user_id="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        # Mock profile data
        profile_data = {
            "age": 35,
            "income": "$75,000",
            "goals": ["Buy a house", "Retirement"],
            "risk_tolerance": "Moderate"
        }
        
        # Mock document
        mock_document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Financial Plan",
            doc_type=DocumentType.FINANCIAL_PLAN,
            content="This is a financial plan...",
            status=DocumentStatus.COMPLETED
        )
        
        # Mock LLM service response
        document_processor.llm_service.generate_document = AsyncMock(return_value=mock_document)
        
        # Mock repository save
        document_processor.document_repository.save = AsyncMock(return_value=mock_document)
        
        # Call the method
        result = await document_processor.create_financial_plan(user, profile_data)
        
        # Assertions
        assert result == mock_document
        document_processor.llm_service.generate_document.assert_awaited_once()
        document_processor.document_repository.save.assert_awaited_once()
        
        # Verify correct document type was used
        assert document_processor.llm_service.generate_document.call_args[0][1] == DocumentType.FINANCIAL_PLAN
    
    @pytest.mark.asyncio
    async def test_create_investment_recommendation(self, document_processor):
        """Test creating an investment recommendation document."""
        # Mock user
        user = User(
            user_id="testuser",
            email="test@example.com"
        )
        
        # Mock investment data
        investment_data = {
            "risk_profile": "Moderate",
            "investment_amount": "$10,000",
            "investment_horizon": "10 years",
            "goals": ["Growth", "Diversification"]
        }
        
        # Mock document
        mock_document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Investment Recommendation",
            doc_type=DocumentType.INVESTMENT_RECOMMENDATION,
            content="This is an investment recommendation...",
            status=DocumentStatus.COMPLETED
        )
        
        # Mock service response
        document_processor.llm_service.generate_document = AsyncMock(return_value=mock_document)
        document_processor.document_repository.save = AsyncMock(return_value=mock_document)
        
        # Call the method
        result = await document_processor.create_investment_recommendation(user, investment_data)
        
        # Assertions
        assert result == mock_document
        document_processor.llm_service.generate_document.assert_awaited_once()
        document_processor.document_repository.save.assert_awaited_once()
        
        # Verify correct document type was used
        assert document_processor.llm_service.generate_document.call_args[0][1] == DocumentType.INVESTMENT_RECOMMENDATION
    
    @pytest.mark.asyncio
    async def test_get_document_by_id(self, document_processor):
        """Test retrieving a document by ID."""
        # Mock document
        mock_document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Financial Plan",
            doc_type=DocumentType.FINANCIAL_PLAN,
            content="This is a financial plan..."
        )
        
        # Mock repository response
        document_processor.document_repository.get_by_id = AsyncMock(return_value=mock_document)
        
        # Call the method
        result = await document_processor.get_document_by_id("doc-123")
        
        # Assertions
        assert result == mock_document
        document_processor.document_repository.get_by_id.assert_awaited_once_with("doc-123")
    
    @pytest.mark.asyncio
    async def test_get_documents_for_user(self, document_processor):
        """Test retrieving all documents for a user."""
        # Mock documents
        mock_documents = [
            Document(
                document_id="doc-123",
                user_id="testuser",
                title="Financial Plan",
                doc_type=DocumentType.FINANCIAL_PLAN,
                content="This is a financial plan..."
            ),
            Document(
                document_id="doc-456",
                user_id="testuser",
                title="Investment Recommendation",
                doc_type=DocumentType.INVESTMENT_RECOMMENDATION,
                content="This is an investment recommendation..."
            )
        ]
        
        # Mock repository response
        document_processor.document_repository.get_by_user_id = AsyncMock(return_value=mock_documents)
        
        # Call the method
        result = await document_processor.get_documents_for_user("testuser")
        
        # Assertions
        assert result == mock_documents
        assert len(result) == 2
        document_processor.document_repository.get_by_user_id.assert_awaited_once_with("testuser")
    
    @pytest.mark.asyncio
    async def test_update_document(self, document_processor):
        """Test updating an existing document."""
        # Mock document
        mock_document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Financial Plan",
            doc_type=DocumentType.FINANCIAL_PLAN,
            content="This is a financial plan...",
            status=DocumentStatus.DRAFT
        )
        
        # Updated content
        updated_content = "This is an updated financial plan..."
        
        # Mock repository responses
        document_processor.document_repository.get_by_id = AsyncMock(return_value=mock_document)
        document_processor.document_repository.update = AsyncMock(return_value=mock_document)
        
        # Call the method
        result = await document_processor.update_document("doc-123", updated_content)
        
        # Assertions
        assert result.content == updated_content
        assert result.status == DocumentStatus.COMPLETED  # Assuming update changes status
        document_processor.document_repository.get_by_id.assert_awaited_once_with("doc-123")
        document_processor.document_repository.update.assert_awaited_once()
    
    @pytest.mark.asyncio
    async def test_delete_document(self, document_processor):
        """Test deleting a document."""
        # Mock repository response
        document_processor.document_repository.delete = AsyncMock(return_value=True)
        
        # Call the method
        result = await document_processor.delete_document("doc-123")
        
        # Assertions
        assert result is True
        document_processor.document_repository.delete.assert_awaited_once_with("doc-123")
    
    @pytest.mark.asyncio
    async def test_document_not_found(self, document_processor):
        """Test handling of document not found scenario."""
        # Mock repository response
        document_processor.document_repository.get_by_id = AsyncMock(return_value=None)
        
        # Call the method and check for exception
        with pytest.raises(Exception, match="Document not found"):
            await document_processor.get_document_by_id("non-existent-id")
        
        document_processor.document_repository.get_by_id.assert_awaited_once_with("non-existent-id")
    
    @pytest.mark.asyncio
    async def test_process_document_template(self, document_processor):
        """Test processing a document template with user data."""
        # Mock user
        user = User(
            user_id="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        # Mock template
        template = "Financial Plan for {first_name} {last_name}\n\nEmail: {email}\n\nRecommendations:"
        
        # Expected processed template
        expected = "Financial Plan for Test User\n\nEmail: test@example.com\n\nRecommendations:"
        
        # Call the method (assuming this is a method in DocumentProcessor)
        result = document_processor.process_template(template, user)
        
        # Assertions
        assert result == expected 