# Multi-Modal Financial Advisor Application Guide

## Introduction

This guide provides detailed instructions for connecting to and testing the Multi-Modal Financial Advisor Chatbot application. The system is designed to deliver hyper-personalized financial recommendations through an intuitive interface that responds to text, images, and future voice inputs.

## Connection Information

### Backend API

- **URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

### Frontend Application

- **URL**: http://localhost:3000
- **Default Credentials**: Username: `testuser`, Password: `password`

## Running the Application

1. **Start the Backend**:
   ```bash
   cd code/src
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**:
   ```bash
   cd code/src/frontend
   npm start
   ```

3. **Access the Application**:
   - Open your browser and navigate to http://localhost:3000
   - Log in with the provided test credentials or create a new account

## Database Information

The application is connected to a MongoDB database containing approximately 100 sample user profiles with varied financial data, personas, and transaction histories. This data is used to provide personalized recommendations and insights.

## Sample User Accounts

The following sample user accounts are available for testing. Each represents a distinct financial persona with different goals, risk tolerances, and financial circumstances:

### Conservative Saver

- **User ID**: `user_conservative`
- **Password**: `password`
- **Persona**: 
  - Age: 55-65
  - Risk Tolerance: Low
  - Income: $60,000-$80,000
  - Goals: Retirement security, wealth preservation
  - Key Characteristics: Prioritizes safety over growth, concerned about market volatility

### Young Professional

- **User ID**: `user_growth`
- **Password**: `password`
- **Persona**:
  - Age: 25-35
  - Risk Tolerance: Moderate-High
  - Income: $70,000-$100,000
  - Goals: Long-term wealth building, home purchase
  - Key Characteristics: Tech-savvy, interested in sustainable investing, comfortable with technology

### Family Planner

- **User ID**: `user_family`
- **Password**: `password`
- **Persona**:
  - Age: 35-45
  - Risk Tolerance: Moderate
  - Income: $90,000-$130,000
  - Goals: College savings, family security, moderate growth
  - Key Characteristics: Balances growth and security, interested in education funding options

### Pre-Retiree

- **User ID**: `user_preretiree`
- **Password**: `password`
- **Persona**:
  - Age: 50-60
  - Risk Tolerance: Moderate-Low
  - Income: $110,000-$150,000
  - Goals: Retirement optimization, tax efficiency
  - Key Characteristics: Focused on retirement planning, interested in reducing tax burden

### Business Owner

- **User ID**: `user_business`
- **Password**: `password`
- **Persona**:
  - Age: 40-55
  - Risk Tolerance: Moderate-High
  - Income: $150,000+
  - Goals: Business growth, wealth diversification
  - Key Characteristics: Needs both business and personal financial advice, interested in asset protection

## Testing Features

### 1. Onboarding Process

The application uses a comprehensive onboarding process with a dedicated AI agent to understand the user's financial situation, goals, and preferences. To test this feature:

1. Register a new account
2. Follow the guided onboarding flow
3. Observe how the system builds your financial profile

### 2. Advisory Documents

The system provides personalized educational content based on user goals and knowledge gaps:

1. Navigate to the "Advisory Documents" section
2. Browse through recommended financial education materials
3. Open documents to view personalized content with proper markdown formatting

### 3. Product-Specific Chatbots

Each recommended financial product comes with its own specialized chatbot:

1. Go to the "Recommendations" section
2. Select a recommended product
3. Click on "Chat with Product Specialist"
4. Ask specific questions about the product's features, benefits, and suitability

### 4. Multi-Modal Interaction

Test the system's ability to process different types of inputs:

1. Use the main chatbot interface for text-based questions
2. Upload financial documents using the document upload feature
3. Observe how the system extracts and analyzes information from these inputs

## Troubleshooting

- **Connection Issues**: Ensure both backend and frontend servers are running
- **Authentication Problems**: If you cannot log in, try the default test account
- **Database Connectivity**: Check MongoDB connection in the backend logs
- **API Errors**: Refer to the API documentation at http://localhost:8000/docs

## Support

For additional assistance, please contact the development team or refer to the project documentation in the `artifacts` directory. 