import pytest
from datetime import datetime
from app.models.document import Document, DocumentType, DocumentStatus

class TestDocumentModel:
    
    def test_document_creation(self):
        """Test creating a valid document object."""
        now = datetime.now()
        document_data = {
            "document_id": "doc-123",
            "user_id": "testuser",
            "title": "Financial Plan Q1 2023",
            "doc_type": DocumentType.FINANCIAL_PLAN,
            "content": "This is your customized financial plan for Q1 2023...",
            "created_at": now,
            "updated_at": now,
            "status": DocumentStatus.COMPLETED,
            "metadata": {
                "pages": 5,
                "version": "1.0",
                "tags": ["retirement", "investment"]
            }
        }
        
        document = Document(**document_data)
        
        assert document.document_id == document_data["document_id"]
        assert document.user_id == document_data["user_id"]
        assert document.title == document_data["title"]
        assert document.doc_type == DocumentType.FINANCIAL_PLAN
        assert document.content == document_data["content"]
        assert isinstance(document.created_at, datetime)
        assert isinstance(document.updated_at, datetime)
        assert document.status == DocumentStatus.COMPLETED
        assert document.metadata["pages"] == 5
        assert "retirement" in document.metadata["tags"]
    
    def test_document_type_enum(self):
        """Test the DocumentType enum values."""
        assert DocumentType.FINANCIAL_PLAN.value == "financial_plan"
        assert DocumentType.INVESTMENT_RECOMMENDATION.value == "investment_recommendation"
        assert DocumentType.TAX_PLANNING.value == "tax_planning"
        assert DocumentType.RETIREMENT_PLAN.value == "retirement_plan"
    
    def test_document_status_enum(self):
        """Test the DocumentStatus enum values."""
        assert DocumentStatus.DRAFT.value == "draft"
        assert DocumentStatus.IN_PROGRESS.value == "in_progress"
        assert DocumentStatus.COMPLETED.value == "completed"
        assert DocumentStatus.ARCHIVED.value == "archived"
    
    def test_document_with_minimal_data(self):
        """Test creating a document with only required fields."""
        document_data = {
            "document_id": "doc-123",
            "user_id": "testuser",
            "title": "Financial Plan",
            "doc_type": DocumentType.FINANCIAL_PLAN,
            "content": "This is a basic financial plan."
        }
        
        document = Document(**document_data)
        
        assert document.document_id == document_data["document_id"]
        assert document.user_id == document_data["user_id"]
        assert document.title == document_data["title"]
        assert document.doc_type == DocumentType.FINANCIAL_PLAN
        assert document.content == document_data["content"]
        assert isinstance(document.created_at, datetime)
        assert isinstance(document.updated_at, datetime)
        assert document.status == DocumentStatus.DRAFT  # Default value
        assert document.metadata == {}  # Default empty dict
    
    def test_invalid_document_type(self):
        """Test that an invalid document type raises error."""
        document_data = {
            "document_id": "doc-123",
            "user_id": "testuser",
            "title": "Financial Plan",
            "doc_type": "invalid_type",  # Invalid type
            "content": "This is a basic financial plan."
        }
        
        with pytest.raises(ValueError):
            Document(**document_data)
    
    def test_document_update(self):
        """Test updating document fields."""
        document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Initial Title",
            doc_type=DocumentType.FINANCIAL_PLAN,
            content="Initial content",
            status=DocumentStatus.DRAFT
        )
        
        # Initial state
        assert document.title == "Initial Title"
        assert document.content == "Initial content"
        assert document.status == DocumentStatus.DRAFT
        
        # Update the document
        document.title = "Updated Title"
        document.content = "Updated content"
        document.status = DocumentStatus.COMPLETED
        
        # Check the updates
        assert document.title == "Updated Title"
        assert document.content == "Updated content"
        assert document.status == DocumentStatus.COMPLETED
        # updated_at should be updated automatically in a real application
    
    def test_document_with_version_history(self):
        """Test document with version history in metadata."""
        version_history = [
            {"version": "1.0", "timestamp": datetime.now().isoformat(), "editor": "system"},
            {"version": "1.1", "timestamp": datetime.now().isoformat(), "editor": "advisor"}
        ]
        
        document = Document(
            document_id="doc-123",
            user_id="testuser",
            title="Financial Plan",
            doc_type=DocumentType.FINANCIAL_PLAN,
            content="Content with history",
            metadata={"version_history": version_history}
        )
        
        assert len(document.metadata["version_history"]) == 2
        assert document.metadata["version_history"][0]["version"] == "1.0"
        assert document.metadata["version_history"][1]["editor"] == "advisor" 