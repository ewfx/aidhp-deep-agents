# Financial Advisor Chatbot Test Suite

This directory contains automated tests for the Financial Advisor Chatbot application. The test suite is organized to mirror the application's structure, making it easy to locate and run tests for specific components.

## Directory Structure

```
test/
├── api/                # Tests for API endpoints
│   ├── test_auth.py    # Authentication API tests
│   ├── test_onboard.py # Onboarding API tests
│   └── ...
├── models/             # Tests for data models
│   ├── test_user.py    # User model tests
│   ├── test_conversation.py # Conversation model tests
│   ├── test_document.py     # Document model tests
│   └── ...
├── services/           # Tests for service layer
│   ├── test_llm_service.py  # LLM service tests
│   ├── test_document_processor.py # Document processing tests
│   └── ...
├── utils/              # Tests for utility functions
│   ├── test_db.py      # Database utility tests
│   └── ...
├── conftest.py         # Shared test fixtures
└── README.md           # This file
```

## Setup

Before running tests, make sure you have installed the required dependencies:

```bash
pip install pytest pytest-asyncio pytest-cov
```

## Running Tests

### Run All Tests

To run all tests:

```bash
cd code
python -m pytest test/
```

### Run Tests with Coverage

To run tests with coverage reporting:

```bash
cd code
python -m pytest test/ --cov=app
```

### Run Specific Test Files

To run a specific test file:

```bash
cd code
python -m pytest test/api/test_auth.py
```

### Run Tests by Category

To run all tests in a directory:

```bash
cd code
python -m pytest test/models/
```

## Test Fixtures

Common test fixtures are defined in `conftest.py`. These include:

- `mock_mongodb`: Mocks MongoDB database connections
- `mock_user_repo`: Provides a mock user repository with test data
- `mock_llm_service`: Mocks the language model service
- `mock_jwt_auth`: Mocks JWT authentication
- `test_client`: FastAPI test client for API testing
- `onboarding_session`: Sample onboarding session data
- `event_loop`: Event loop for asynchronous tests

## Best Practices

1. **Test Organization**: Keep tests organized by matching the application structure.
2. **Naming Convention**: Use `test_` prefix for all test files and test methods.
3. **Isolation**: Each test should be independent and not rely on the state from previous tests.
4. **Mocking**: Use mocks for external dependencies (databases, APIs, etc.).
5. **Coverage**: Aim for high test coverage, especially for critical components.
6. **Async Testing**: Use `pytest.mark.asyncio` for testing asynchronous functions.
7. **Descriptive Names**: Use descriptive test names that indicate what is being tested.
8. **Assertions**: Make specific assertions about the expected behavior.
9. **Comments**: Document complex test setups or non-obvious assertions.

## Adding New Tests

When adding new components to the application, follow these steps:

1. Create a corresponding test file in the appropriate test directory.
2. Define test classes and methods that cover the component's functionality.
3. Use fixtures from `conftest.py` when appropriate.
4. Run the tests to ensure they pass before committing.

## Continuous Integration

Tests are automatically run in the CI pipeline for every pull request. Make sure all tests pass before submitting your changes.

## Example Test

Here's an example of a test method:

```python
@pytest.mark.asyncio
async def test_login_successful(test_client, mock_user_repo):
    # Arrange: Set up test data
    credentials = {"username": "testuser", "password": "password123"}
    
    # Act: Call the API endpoint
    response = await test_client.post("/auth/token", data=credentials)
    
    # Assert: Check the response
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
```