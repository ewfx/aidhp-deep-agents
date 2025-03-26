# 🚀 Project Name

## 📌 Table of Contents
- [Introduction](#introduction)
- [Demo](#demo)
- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges We Faced](#challenges-we-faced)
- [How to Run](#how-to-run)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## 🎯 Introduction
The project focuses on solving the challenge of hyper-personalized financial product recommendations while also leveraging Generative AI and multi-modal data processing (text, images, and voice) to provide tailored financial insights based on user profiles, transaction history, sentiment analysis, and behavioral patterns.The primary goal is to move beyond traditional, generic financial advice and create an AI-driven digital financial advisor that dynamically adapts to users' evolving needs. The system utilizes Large Language Models (LLMs) (e.g., OpenAI GPT, Mistral AI, Hugging Face models) for intelligent financial recommendations, while multi-modal input processing enhances personalization through document analysis and future voice-based interactions.

Key technical components include a FastAPI backend, MongoDB for data storage, and a real-time recommendation engine using Reinforcement Learning from Human Feedback (RLHF). The system ensures data security and compliance with financial privacy standards.This project aims to revolutionize digital banking by providing highly personalized, AI-driven financial planning, ultimately enhancing user engagement, financial literacy, and decision-making through a smart, adaptive chatbot.

## 🎥 Demo
🔗 [Live Demo](#) (if applicable)  
📹 [Video Demo](#) (if applicable)  
## 🖼️ Screenshots:
<p align="center">
  <img src="https://github.com/user-attachments/assets/2eb8472e-9ff6-43c1-8080-ed9b85de9917" width="45%">
  <img src="https://github.com/user-attachments/assets/13a78482-da94-4658-9b95-1a792043eb39" width="45%">
  <img src="https://github.com/user-attachments/assets/3ef29604-e986-4453-97ff-907238c4edc3" width="45%">
</p>



## 💡 Inspiration
​The Multi-Modal Financial Advisor Chatbot was inspired by the need to enhance customer engagement in the financial sector through personalized and adaptive advisory services. Traditional financial advice often lacks personalization and fails to adapt to individual user behaviors and preferences. This project aims to address this gap by developing an AI-driven digital advisor that leverages multi-modal inputs—such as text, images, and voice—to provide hyper-personalized financial recommendations. By integrating advanced Generative AI techniques and real-time behavioral analysis, the chatbot dynamically tailors its advice to align with each user's unique financial habits and needs, fostering greater trust and loyalty.

## ⚙️ What It Does
The **Multi-Modal Financial Advisor Chatbot** project, is designed to deliver hyper-personalized financial product recommendations by integrating advanced AI techniques with multi-modal data inputs. This approach aims to provide users with tailored financial advice that adapts dynamically to their unique profiles and behaviors.

**Key Features and Functionalities:**

1. **Multi-Modal Input Processing:**
   - **Textual Interactions:** Users can engage with the chatbot through natural language conversations, facilitated by sophisticated Natural Language Processing (NLP) models.
   - **Image Analysis:** The system allows users to upload financial documents, such as receipts or statements, which are analyzed to extract pertinent information for personalized advice.
   - **Voice Input (Planned/Future):** Future enhancements include incorporating voice commands to improve accessibility and user experience.

2. **Personalized Financial Recommendations:**
   - **Dynamic Adaptation:** The recommendation engine continuously learns from user interactions, enabling it to adjust suggestions in real-time as user preferences and behaviors evolve.
   - **Meta-Prompt Generation:** Personalized meta-prompts are created to provide context for each user session, ensuring responses are accurate and relevant.
   - **Multiple LLM Integrations:** The system intelligently selects from various Large Language Models (LLMs), including OpenAI GPT, Mistral AI, and Hugging Face models, based on availability and specific use-case requirements.

3. **Robust Authentication & Data Security:**
   - Secure user authentication and session management protocols are implemented to protect sensitive information.
   - The system complies with data privacy standards, ensuring that financial data is handled ethically and securely.

4. **Real-Time Engagement & Adaptive Learning:**
   - The chatbot captures real-time interaction data to refine and enhance financial recommendations continually.
   - Utilizing Reinforcement Learning from Human Feedback (RLHF), the system improves its AI-driven suggestions based on user feedback, promoting continuous learning and adaptation.

By combining these features, the project aspires to revolutionize digital banking by offering an intelligent, adaptive financial advisor that understands and responds to individual user needs, thereby enhancing user engagement and trust. 

## 🛠️ How We Built It
The [**Multi-Modal Financial Advisor Chatbot**]utilizes a robust technology stack to deliver hyper-personalized financial recommendations:

- **Frontend**: Developed with **React.js**, the interface offers users an interactive platform for chat interactions and document uploads.

- **Backend**: Built using **FastAPI** (Python), it manages API requests, processes multi-modal inputs, and integrates with various AI services.

- **AI Services**: Incorporates multiple Large Language Models (LLMs) such as **OpenAI GPT-3.5/4**, **Mistral AI (Mistral-7B)**, and models from **Hugging Face** to generate personalized financial advice.

- **Data Storage**: Employs **MongoDB** for storing user profiles and transaction data, a **Vector Store** for embeddings, and **Redis** for caching to enhance performance.

- **Multi-Modal Processing**: Designed to handle text, images, and voice inputs, enabling comprehensive analysis and personalized recommendations.

- **Security**: Implements secure authentication and adheres to data privacy standards to ensure user data protection.

This combination of technologies ensures a scalable, efficient, and secure system capable of delivering real-time, personalized financial guidance. 

## 🚧 Challenges We Faced
In developing the **Multi-Modal Financial Advisor Chatbot**, our team encountered several significant challenges:

1. **Integrating Multi-Modal Inputs**: Processing and synthesizing diverse data types—text, images, and voice—posed technical complexities. Ensuring seamless integration and accurate interpretation of these inputs required advanced algorithms and robust data pipelines.

2. **Ensuring Data Privacy and Security**: Handling sensitive financial information necessitated strict adherence to data protection regulations. Implementing secure authentication, encryption, and compliance measures was critical to maintain user trust and legal compliance.

3. **Maintaining Real-Time Performance**: Delivering timely financial recommendations demanded efficient data processing and low-latency responses. Optimizing system performance while managing computational loads was a continuous balancing act.

4. **Addressing AI Bias and Accuracy**: Ensuring the AI models provided unbiased and accurate financial advice was paramount. Regular auditing, diverse training data, and incorporating feedback loops were essential to mitigate biases and enhance reliability.

Overcoming these challenges was instrumental in creating a responsive, secure, and trustworthy financial advisory chatbot. 

## 🏃 How to Run

### Prerequisites

- Python 3.8+
- MongoDB
- LLM API keys (one of the following):
  - OpenAI API key
  - Mistral API key
  - HuggingFace API token

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Configuration
MONGODB_URL=mongodb+srv://dataset-db.ky0bo.mongodb.net/
MONGODB_DB=financial_advisor
MONGODB_USER=wf-hack
MONGODB_PASSWORD=eAzy@123

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# API Keys (choose one or more)
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_TOKEN=your-huggingface-token
MISTRAL_API_KEY=your-mistral-api-key

# Model Configuration
DEFAULT_MODEL=gpt-4-turbo-preview
FINANCE_MODEL=pixiu-financial
CHAT_MODEL=mistralai/Mistral-7B-v0.1
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Application Settings
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/financial-advisor-chatbot.git
   cd financial-advisor-chatbot
   ```

2. Create a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application using one of these options:

   a. Using the provided start script (recommended):
   ```
   chmod +x start.sh  # Make the script executable (only needed once)
   ./start.sh
   ```
   This will start both the backend server and frontend application together.

   b. Manually start the backend:
   ```
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

5. Visit `http://localhost:3000` to access the application interface, or `http://localhost:8000/docs` to see the API documentation.

## Using the Application

After starting the application with `./start.sh`, you can access:
- Frontend interface at `http://localhost:3000`
- Backend API at `http://localhost:8000`

The application comes with a pre-configured test user:
- Username: `testuser`
- Password: `password`

## API Endpoints

- **Authentication**
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/token`: Get authentication token
  - `GET /api/auth/me`: Get current user information

- **Chat**
  - `POST /api/chat/message`: Send a message to the chatbot
  - `GET /api/chat/conversations`: List user conversations
  - `GET /api/chat/conversations/{id}`: Get a specific conversation
  - `DELETE /api/chat/conversations/{id}`: Delete a conversation

- **Recommendations**
  - `GET /api/recommendations`: Get personalized recommendations
  - `GET /api/recommendations/history`: Get recommendation history
  - `POST /api/recommendations/feedback`: Provide feedback on recommendations

- **Images**
  - `POST /api/images/upload`: Upload and analyze a financial document
  - `GET /api/images/analyses`: List document analyses
  - `GET /api/images/analyses/{id}`: Get specific document analysis
  - `DELETE /api/images/analyses/{id}`: Delete a document analysis

## LLM Provider Configuration

The application supports multiple LLM providers:

### OpenAI
Set `OPENAI_API_KEY` to use GPT models.

### Mistral AI
Set `MISTRAL_API_KEY` to use Mistral models.

### HuggingFace
Set `HUGGINGFACE_TOKEN` to use models hosted on HuggingFace.

The application will automatically select a provider based on available API keys with this priority order:
1. Mistral AI
2. HuggingFace
3. OpenAI

If no API keys are provided, the application will use a basic keyword-based mock response system.

## Database Configuration

The application uses MongoDB for storing user data, financial information, chat history, and more. 

If MongoDB is not available or credentials are incorrect, the application will:
1. Log warnings about the unavailable database
2. Use fallback mock data for financial profiles
3. Continue functioning with limited personalization features

## 🏗️ Tech Stack
The **Multi-Modal Financial Advisor Chatbot** utilizes a comprehensive technology stack to deliver hyper-personalized financial recommendations:

**Frontend:**
- **React.js**: Provides an interactive and responsive user interface for chat interactions, document uploads, and content display.

**Backend:**
- **FastAPI (Python)**: Manages API requests, orchestrates service interactions, processes multi-modal inputs, handles user sessions and authentication, and integrates with various AI service providers.

**Database:**
- **MongoDB**: Stores user profiles, chat histories, financial transaction data, and document analysis results, supporting dynamic queries for personalized recommendations.

**AI Services:**
- **Large Language Models (LLMs)**: Integrates models such as OpenAI GPT-3.5/4, Mistral AI's Mistral-7B, and Hugging Face models to generate intelligent financial recommendations.
- **Retrieval-Augmented Generation (RAG) System**: Enhances response accuracy by retrieving relevant information to augment the generative process.
- **Multi-Modal Processing**: Handles text, image, and voice inputs to provide a comprehensive understanding of user data.

**Data Storage and Caching:**
- **Vector Store (Embeddings)**: Manages embeddings for efficient similarity searches and recommendations.
- **Redis**: Utilized for caching to improve system performance and responsiveness.

**Authentication and Security:**
- Implements secure user authentication and session management, ensuring compliance with data privacy standards for ethical and secure handling of financial data.

This robust and scalable architecture enables the chatbot to adapt dynamically to user behaviors, providing personalized and secure financial advice. 

## 👥 Team
- **Lakshay Sharma** - [GitHub](https://github.com/laksh42) | [LinkedIn](https://www.linkedin.com/in/lakshay-sharma-93a4431a9/)
- **Apurva Singh** - [GitHub](https://github.com/apourva14) | [LinkedIn](https://www.linkedin.com/in/apurva-singh-15232327b/)
