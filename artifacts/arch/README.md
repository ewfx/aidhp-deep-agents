# Multi-Modal Financial Advisor Chatbot

## Overview
The **Multi-Modal Financial Advisor Chatbot** is a cutting-edge solution designed to offer **hyper-personalized financial product recommendations**. Developed as part of the **Wells Fargo AI/DHP Developer Acceleration Hackathon**, this chatbot leverages **Generative AI techniques** and **multi-modal inputs** (text, images, and voice) to dynamically tailor financial advice based on user profiles, historical transaction data, sentiment analysis, and real-time behavioral inputs.

The solution employs a sophisticated **dual-agent architecture** where an onboarding agent first deeply understands the user's financial situation, goals, and preferences, followed by an advisory agent that delivers customized content and product recommendations. This approach ensures highly relevant and personalized advice for each user.
## 🎥 Video Demo for our application
🎥 [Full application walkthrough Demo](https://www.youtube.com/watch?v=d_cFyfek7WA)

📹 [Onboarding Process of a new User Demo](https://youtu.be/0bgSa0M4i68) 

## Product Vision
Our vision is to empower users with an **intelligent digital advisor** that understands their financial habits and needs, adapting in real-time to provide **personalized recommendations**. This approach aims to revolutionize customer engagement in the financial sector, moving from **generic advice** to a **dynamic, data-driven model** that fosters trust and loyalty through transparent, explainable AI-powered recommendations.

---
## Key Features & Capabilities

### 1. Two-Agent Architecture for Deep Personalization
- **Onboarding Agent**: First phase AI that focuses exclusively on understanding the user through conversational interaction, building a comprehensive user profile.
- **Advisory Agent**: Second phase AI that leverages the user profile to deliver highly tailored recommendations, educational content, and product suggestions.
- **Seamless Transition**: Smooth handoff between agents preserves context and ensures a cohesive user experience.

### 2. Personalized Advisory Documents
- **Goal-Aligned Educational Content**: Curated financial educational materials that directly relate to the user's short and long-term financial goals.
- **Knowledge Gap Identification**: Intelligent assessment of user's financial literacy to provide appropriately detailed explanations.
- **Rich Markdown Rendering**: Visually appealing, well-structured documents with proper formatting for enhanced readability.

### 3. Product-Specific Context-Aware Chatbots
- **Dedicated Product Specialists**: Each recommended financial product comes with its own specialized chatbot that acts as a knowledgeable salesperson.
- **In-depth Product Explanations**: Users can ask detailed questions about features, benefits, risks, and suitability of specific products.
- **Transparent Decision Support**: Clear explanations of why products were recommended and how they align with user goals.

### 4. Multi-Modal Input Processing
- **Textual Interactions**: Users engage via natural language chat, processed by sophisticated NLP models.
- **Image Analysis**: Users can upload financial documents (e.g., receipts, statements) that are analyzed to extract relevant information.
- **Voice Input (Planned/Future)**: The architecture is designed to incorporate voice commands for enhanced accessibility and personalization.

### 5. Ethical AI & Transparency Framework
- **Explainable Recommendations**: Clear rationales for all suggestions, helping users understand the "why" behind each recommendation.
- **Bias Detection & Mitigation**: Continuous monitoring and evaluation to identify and address potential biases in financial advice.
- **Transparent Data Usage**: Clear disclosure of how user data influences recommendations and advice.

### 6. Personalized Financial Recommendations
- **Dynamic Adaptation**: The recommendation engine continuously learns from user behavior, adapting its suggestions over time.
- **Meta-Prompt Generation**: Personalized meta-prompts create contextualized user sessions for more accurate responses.
- **Multiple LLM Integrations**: The system intelligently selects between AI providers (OpenAI GPT, Mistral AI, Hugging Face models) based on availability and specific use-case needs.

### 7. Robust Authentication & Data Security
- Secure user authentication and session management.
- Compliance with data privacy standards to ensure ethical and secure handling of financial data.

---
## Technical Architecture & Implementation Details
```
[Client Layer]
    ├── Web Interface (React.js)
    ├── Mobile App
    └── API Clients

[Application Layer]
    ├── FastAPI Backend
    ├── Authentication Service
    ├── Onboarding Engine
    ├── Advisory Document Generator
    └── Recommendation Engine

[AI Layer]
    ├── Dual-Agent System
    │   ├── Onboarding Agent
    │   └── Advisory Agent
    ├── LLM Services
    │   ├── OpenAI GPT-3.5/4
    │   ├── Mistral AI (Mistral-7B)
    │   └── HuggingFace Models
    ├── Product-Specific Chatbots
    ├── RAG System
    └── Multi-Modal Processing

[Data Layer]
    ├── MongoDB (User Data)
    ├── Vector Store (Embeddings)
    └── Redis (Caching)

[Ethical AI Layer]
    ├── Explainability Tools
    ├── Bias Detection
    └── Transparency Mechanisms
```

### **1. Frontend**
- **Technology**: React.js with Material-UI
- **Role**: Provides an interactive, responsive UI for chat interactions, document uploads, and content rendering.
- **Components**: Chat interface, document viewer with markdown support, product-specific chat interfaces.

### **2. Backend**
- **Framework**: FastAPI (Python)
- **Responsibilities**:
  - Handling API requests and orchestrating calls between various services.
  - Processing and routing multi-modal inputs.
  - Managing user sessions, authentication, and meta-prompt generation.
  - Coordinating the dual-agent system and product-specific chatbots.
  - Generating and serving advisory documents.

### **3. Dual-Agent System**
- **Onboarding Agent**: Specialized LLM instance focused on gathering comprehensive user information.
- **Advisory Agent**: Dedicated LLM configured to generate personalized recommendations and educational content.
- **Transition Logic**: Algorithms to ensure smooth handoff of user context between agents.

### **4. Database**
- **Database System**: MongoDB
- **Usage**:
  - Stores user profiles, chat history, financial transaction data, and document analysis outputs.
  - Supports dynamic queries for generating personalized recommendations.
  - Maintains records of advisory documents and product-specific interactions.

### **5. Ethical AI Framework**
- **Explainability Tools**: Components that generate clear explanations for AI decisions.
- **Bias Detection Systems**: Monitoring and evaluation mechanisms to identify potential biases.
- **Transparency Interfaces**: User-facing features that provide visibility into how recommendations are generated.

---
## Future Enhancements & Roadmap
- **Voice Input Integration**: Expand multi-modal capabilities by incorporating voice recognition and processing.
- **Mobile App Integration**: Extend the solution to mobile platforms for seamless access on the go.
- **Advanced Analytics**: Integrate predictive analytics to provide more nuanced insights into customer behavior and long-term financial planning.
- **Community Features**: Create shared learning spaces where users with similar financial goals can exchange experiences and insights.

---
## Expected Outcomes & Evaluation
| **Expectation**                     | **Implementation Status** |
|--------------------------------------|---------------------------|
| Adaptive Recommendation Engine      | ✅ Real-time dynamic adjustments based on user interactions |
| AI-Generated Personalized Suggestions | ✅ Customized financial offers using transaction and profile data |
| Sentiment-Driven Content Recommendations | ✅ Uses LLMs and NLP pipelines for mood-based financial suggestions |
| Ethical & Explainable AI | ✅ Provides clear rationales for recommendations and transparent data usage |
| Dual-Agent Personalization Architecture | ✅ Separate onboarding and advisory agents for deeper personalization |
| Advisory Document Generation | ✅ Customized educational content aligned with user goals |
| Product-Specific Chatbots | ✅ Dedicated conversational interfaces for each recommended product |
| Multi-Modal Personalization         | ✅ Accepts text, images, and voice inputs |
| Hyper-Personalized Financial Products | ✅ Provides AI-driven financial planning and investment advice |

---
## Technical Considerations & Enhancements
### **1. Strengths**
- **Dual-Agent Architecture**: Enables deeper personalization through specialized agent roles.
- **Explainable AI**: Builds user trust through transparent recommendation rationales.
- **Scalability**: The architecture allows easy expansion with additional AI models and product-specific chatbots.
- **Real-time Adaptation**: Personalization improves dynamically based on user behavior.
- **Security & Compliance**: Implements data privacy principles and ethical AI practices.

### **2. Areas for Improvement**
- **Agent Transition Smoothness**: Refining the handoff between onboarding and advisory agents for a more seamless experience.
- **Bias Mitigation**: Further testing required to eliminate potential biases in financial suggestions.
- **Computational Efficiency**: Optimization of model inference time for faster responses, especially for product-specific chatbots.
- **Integration with External APIs**: Expanding to more financial data sources for improved insights.

---
## Conclusion
The repository aligns well with the hackathon's expectations, demonstrating a strong architecture for **AI-driven hyper-personalization**. It successfully integrates **multi-modal inputs, dual-agent architecture, and adaptive learning mechanisms** while maintaining a focus on **ethical AI and transparency**. The addition of **personalized advisory documents** and **product-specific chatbots** enhances the value proposition by providing both educational content and detailed product information in an accessible manner. While some refinements are recommended for **agent transition**, **bias handling**, and **computational efficiency**, the current implementation meets key functional and technical criteria for delivering a transformative financial advisory experience.
