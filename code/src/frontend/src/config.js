// Configuration for the Financial Advisor frontend application

const environment = process.env.NODE_ENV || 'development';

// Calculate the API base URL based on environment
const getApiUrl = () => {
  if (environment === 'production') {
    return '/api';
  }
  return 'http://localhost:8000';
};

// Export the configuration
export const config = {
  env: environment,
  
  // Top-level API URL for easier access
  apiUrl: getApiUrl(),
  
  // Environment-specific settings
  development: {
    apiUrl: 'http://localhost:8000',
    debug: true
  },
  
  production: {
    apiUrl: '/api',
    debug: false
  },
  
  // Application settings
  app: {
    name: 'Financial Advisor',
    version: '1.0.0',
    logoUrl: '/logo.png'
  },
  
  // API settings
  api: {
    baseUrl: getApiUrl(),
    timeout: 15000, // 15 seconds
    retryAttempts: 3
  },
  
  // Authentication settings
  auth: {
    tokenStorageKey: 'auth_token',
    userStorageKey: 'user_data',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 86400 // 24 hours in seconds
  },
  
  // Chat interface settings
  chat: {
    maxMessages: 10,
    typingIndicatorDelay: 1000,
    aiResponseDelay: 800,
    sessionStorageKey: 'chat_session',
    welcomeMessage: "Hello! I'm your AI financial assistant. How can I help you with your financial questions today?",
    inputPlaceholder: "Type your message...",
    fileUploadEnabled: true,
  },
  
  // API endpoints
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/token',
      verify: '/api/auth/verify',
      me: '/api/auth/me',
      userData: '/api/auth/user-data'
    },
    recommendations: {
      list: '/api/recommendations/',
      details: '/api/recommendations/:id',
      refresh: '/api/recommendations/',
      feedback: '/api/recommendations/feedback'
    },
    chat: {
      send: '/api/chat/send',
      history: '/api/chat/history'
    }
  },
  
  // Recommendation settings
  recommendations: {
    max: 5,
    storageKey: 'financial_advisor_recommendations',
    refreshInterval: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Feature flags
  features: {
    enableDebug: true,
    enableMockData: true, // Enable mock data as fallback when API is unavailable
    showNewFeatureBadge: true,
    useDarkMode: false
  },
  
  // Services (for component-specific integrations)
  services: {
    understander: {
      url: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000'
    }
  },
  
  // Debug settings
  debug: {
    logApiCalls: process.env.NODE_ENV === 'development'
  },
  
  // UI Configuration
  ui: {
    theme: {
      primary: '#D41B2C', // Wells Fargo red
      secondary: '#FFCD34', // Wells Fargo yellow
    },
    layout: {
      sidebarWidth: 240,
      headerHeight: 64
    }
  },
  
  // Onboarding settings
  onboarding: {
    sessionStorageKey: 'onboarding_session',
    completedStorageKey: 'onboarding_completed',
    welcomeMessage: "Welcome! Let's understand your financial goals and preferences to provide you with personalized recommendations."
  }
}; 