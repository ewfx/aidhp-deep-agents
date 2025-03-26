# Multi-Modal Financial Advisor Chatbot

## A Hyper-Personalized AI-Driven Financial Advisory Solution

---

## Project Overview

![Architecture Overview](https://via.placeholder.com/800x400?text=Multi-Modal+Financial+Advisor+Architecture)

### Key Features:

- **Hyper-personalized** financial recommendations
- **Dual-agent architecture** for deeper personalization
- **Multi-modal input processing** (text, images, future voice)
- **Ethical AI framework** promoting transparency and trust
- **Product-specific chatbots** for detailed product exploration

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Web Interface │    │   Mobile App    │    │   API Clients   │        │
│  │    (React.js)   │    │    (Future)     │    │                 │        │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
└───────────┼─────────────────────┼─────────────────────┼────────────────────┘
            │                     │                     │                    
┌───────────┼─────────────────────┼─────────────────────┼────────────────────┐
│           ▼                     ▼                     ▼                    │
│                           APPLICATION LAYER                                │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ Authentication  │    │   Onboarding    │    │  Recommendation │        │
│  │    Service      │    │     Engine      │    │     Engine      │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐                               │
│  │    FastAPI      │    │    Advisory     │                               │
│  │    Backend      │◄───►    Document     │                               │
│  │                 │    │    Generator    │                               │
│  └────────┬────────┘    └─────────────────┘                               │
└───────────┼─────────────────────────────────────────────────────────────────┘
            │                                                               
┌───────────┼─────────────────────────────────────────────────────────────────┐
│           ▼                            AI LAYER                            │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐        │
│  │    Dual-Agent System    │    │         LLM Services            │        │
│  │ ┌───────────┐ ┌───────┐ │    │ ┌─────────┐ ┌────────┐ ┌─────┐  │        │
│  │ │Onboarding │ │Advisory│ │    │ │OpenAI   │ │Mistral │ │Other│  │        │
│  │ │  Agent    │ │ Agent  │ │    │ │GPT-3.5/4│ │AI      │ │LLMs │  │        │
│  │ └───────────┘ └───────┘ │    │ └─────────┘ └────────┘ └─────┘  │        │
│  └─────────────────────────┘    └─────────────────────────────────┘        │
│                                                                           │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐        │
│  │  Product-Specific       │    │      Multi-Modal Processing     │        │
│  │  Chatbots               │    │    (Text, Images, Voice)        │        │
│  └─────────────────────────┘    └─────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
                                                                            
┌───────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                    │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │    MongoDB      │    │  Vector Store   │    │     Redis       │        │
│  │  (User Data)    │    │  (Embeddings)   │    │    (Caching)    │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
                                                                            
┌───────────────────────────────────────────────────────────────────────────┐
│                         ETHICAL AI LAYER                                  │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  Explainability │    │ Bias Detection  │    │  Transparency   │        │
│  │      Tools      │    │ & Mitigation    │    │   Mechanisms    │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

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

---

## User Personas

| Persona | Age | Risk Tolerance | Primary Goals | Key Characteristics |
|---------|-----|----------------|---------------|---------------------|
| **Conservative Saver** | 55-65 | Low | Retirement security | Prioritizes safety |
| **Young Professional** | 25-35 | Moderate-High | Wealth building | Tech-savvy, sustainability focus |
| **Family Planner** | 35-45 | Moderate | College savings, security | Balanced approach |
| **Pre-Retiree** | 50-60 | Moderate-Low | Retirement optimization | Tax efficiency focus |
| **Business Owner** | 40-55 | Moderate-High | Business growth | Complex financial needs |

---

## Technology Stack

- **Frontend**: React.js, Material-UI, Markdown rendering
- **Backend**: FastAPI (Python), JWT authentication
- **AI Services**: OpenAI GPT-3.5/4, Mistral AI (Mistral-7B), Hugging Face models
- **Database**: MongoDB for user data, Vector Store for embeddings, Redis for caching
- **Ethical AI**: Explainability tools, bias detection, transparency mechanisms

---

## User Flow

1. **User Registration & Authentication**
2. **Comprehensive Onboarding Process** (Onboarding Agent)
   - Financial goals, risk tolerance, existing products, knowledge level
3. **Profile Generation & Analysis**
4. **Personalized Recommendations & Advisory Documents** (Advisory Agent)
5. **Product-Specific Exploration** via dedicated chatbots
6. **Continuous Learning & Adaptation** based on user feedback

![User Flow](https://via.placeholder.com/800x300?text=User+Flow+Diagram)

---

## Benefits

### For Users
- Truly personalized financial advice
- Educational content tailored to knowledge gaps
- Transparent explanations for all recommendations
- Multi-modal interaction options
- Enhanced financial literacy

### For Financial Institutions
- Deeper customer engagement
- Higher conversion rates
- Operational efficiency
- Rich customer insights
- Competitive differentiation

---

## Getting Started

- Backend API: http://localhost:8000
- Frontend Application: http://localhost:3000
- Default Test Account: Username `testuser`, Password `password`
- Sample User Personas: See Application Guide for detailed testing scenarios
- Documentation: Available in `artifacts` directory

---

## Future Roadmap

- **Voice Interface Integration**
- **Mobile Application Development**
- **Advanced Predictive Analytics**
- **Community Learning Features**
- **Expanded Product Range Support**

---

## Contact

For additional assistance, please contact the development team or refer to the project documentation in the `artifacts` directory. 