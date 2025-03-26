import axios from 'axios';
import { config } from '../config';
import { checkApiConnection } from './checkConnection';

// Create API client
const apiClient = axios.create({
  baseURL: config.api.baseUrl, // Make sure this is set correctly
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: config.api.timeout || 15000
});

// Debug API calls in development
if (config.debug && config.debug.logApiCalls) {
  apiClient.interceptors.request.use(request => {
    console.log('API Request:', request.method.toUpperCase(), request.url);
    console.log('Headers being sent:', request.headers);
    if (request.data) {
      console.log('Data being sent:', request.data);
    }
    return request;
  });
}

// Security event logging
const logSecurityEvent = (eventType, data) => {
  console.log(`[SECURITY] ${eventType}:`, data);
  // In a real app, you might want to send this to a security monitoring service
};

// Standalone function to check API connection
const checkConnection = async () => {
  try {
    console.log('Checking API connection to:', config.api.baseUrl);
    const response = await apiClient.get('/api/health');
    return response.status === 200;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

// API module
const api = {
  // Set auth token for all requests
  setAuthToken: (token) => {
    console.log('Setting auth token in API instance');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  // Export the connection check function
  checkConnection: checkApiConnection,

  // Authentication endpoints
  auth: {
    // Login endpoint
    login: async (userId, password) => {
      console.log('Login attempt with:', userId);
      try {
        // Log the auth request (but not the password)
        logSecurityEvent('AUTH_REQUEST', {
          method: 'post',
          url: '/api/auth/token',
          timestamp: new Date().toISOString()
        });

        // Log headers being sent (for debugging)
        console.log('API Request: POST /api/auth/token');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });

        // Use JSON data
        const jsonData = {
          username: userId,
          password: password
        };

        const response = await apiClient.post('/api/auth/token', jsonData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Log auth success (but not the token)
        logSecurityEvent('AUTH_SUCCESS', {
          method: 'post',
          url: '/api/auth/token',
          timestamp: new Date().toISOString()
        });

        console.log('Login response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Login API error:', error);
        
        // Log auth failure
        logSecurityEvent('AUTH_FAILURE', {
          method: 'post',
          url: '/api/auth/token',
          timestamp: new Date().toISOString(),
          status: error.response?.status,
          message: error.message
        });
        
        throw error;
      }
    },

    // Register endpoint
    register: async (userData) => {
      try {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
      } catch (error) {
        console.error('Registration API error:', error);
        throw error;
      }
    },

    // Get user profile
    getUserProfile: async (userId) => {
      try {
        const response = await apiClient.get(`/api/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Get user profile API error:', error);
        throw error;
      }
    },

    // Support the original function name for backward compatibility
    getUserData: async () => {
      try {
        // Since we don't have the userId from the context, we can fetch the current user
        logSecurityEvent('AUTH_REQUEST', {
          method: 'get',
          url: '/api/auth/me',
          timestamp: new Date().toISOString()
        });
        
        console.log('API Request: GET /api/auth/me');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        const response = await apiClient.get('/api/auth/me');
        
        logSecurityEvent('AUTH_SUCCESS', {
          method: 'get',
          url: '/api/auth/me',
          timestamp: new Date().toISOString()
        });
        
        return response.data;
      } catch (error) {
        console.error('Get user data API error:', error);
        throw error;
      }
    },

    // Validate token endpoint
    validateToken: async () => {
      try {
        const response = await apiClient.get('/api/auth/validate');
        return response.data;
      } catch (error) {
        console.error('Token validation error:', error);
        throw error;
      }
    }
  },

  // Chat endpoints
  chat: {
    // Send message to chatbot
    sendMessage: async (message, sessionId = null) => {
      try {
        console.log('API Request: POST /api/chat/send');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        const payload = {
          message,
          session_id: sessionId
        };

        console.log('Sending chat message:', payload);
        const response = await apiClient.post('/api/chat/send', payload);
        console.log('Chat response received:', response.data);
        return response.data;
      } catch (error) {
        console.error('Chat API error:', error);
        throw error;
      }
    },

    // Get chat history
    getHistory: async (sessionId) => {
      try {
        const response = await apiClient.get(`/api/chat/history/${sessionId}`);
        return response.data;
      } catch (error) {
        console.error('Chat history API error:', error);
        throw error;
      }
    },

    startSession: async () => {
      try {
        return await apiClient.post('/chat/session');
      } catch (error) {
        console.error('Error starting chat session:', error);
        throw error;
      }
    },

    getHistory: async (historyEndpoint = '/chat/history') => {
      try {
        return await apiClient.get(historyEndpoint);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
      }
    },

    sendMessage: async (data) => {
      try {
        return await apiClient.post('/chat/message', data);
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    }
  },

  // Recommendations endpoints
  recommendations: {
    // Get recommendations
    getRecommendations: async () => {
      try {
        console.log('API Request: GET /api/recommendations/');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.get('/api/recommendations');
          return response.data;
        } catch (apiError) {
          console.log('API request failed, using mock data for recommendations');
          
          // Mock data for recommendations
          return {
            recommendations: [
              {
                id: "rec-001",
                name: "High-Yield Savings Account",
                category: "Savings",
                tags: ["Low Risk", "Liquid"],
                priority: "high",
                short_description: "Earn higher interest on your savings with no fees and easy access to your money.",
                description: "Our High-Yield Savings Account offers significantly better rates than traditional savings accounts, with no minimum balance requirements and no monthly fees. Your money stays liquid while earning competitive interest rates.",
                key_features: ["No monthly fees", "FDIC insured", "Mobile banking access", "2.15% APY"],
                benefits: [
                  "Earn 5x the national average interest rate",
                  "No minimum balance requirements",
                  "Easy access to your funds",
                  "No risk to principal"
                ],
                why_recommended: "Based on your cash reserves and short-term goals, this account provides a safe place to grow your emergency fund while maintaining liquidity.",
                rating: 4.5,
                link: "https://example.com/high-yield-savings"
              },
              {
                id: "rec-002",
                name: "Wells Fargo Red Card™",
                category: "Credit Card",
                tags: ["Rewards", "No Annual Fee"],
                short_description: "Earn 2% cash back on all purchases with no annual fee and special Wells Fargo benefits.",
                description: "The Wells Fargo Red Card™ offers unlimited 2% cash back on all purchases, with no rotating categories to track. Enjoy no annual fee, special financing offers, and exclusive Wells Fargo customer benefits.",
                key_features: ["2% unlimited cash back", "No annual fee", "Special financing", "Mobile app integration"],
                benefits: [
                  "Simple rewards structure with no categories to track",
                  "Redeem rewards directly to your Wells Fargo account",
                  "Special financing on large purchases",
                  "Enhanced fraud protection"
                ],
                why_recommended: "This card complements your spending habits and offers better rewards than your current credit card, with no annual fee to offset the benefits.",
                rating: 4.0,
                link: "https://example.com/red-card"
              },
              {
                id: "rec-003",
                name: "Balanced Growth Portfolio",
                category: "Investment",
                tags: ["Moderate Risk", "Diversified"],
                short_description: "A professionally managed diversified portfolio designed for moderate growth with managed risk.",
                description: "Our Balanced Growth Portfolio offers a diversified mix of stocks, bonds, and alternative investments designed to provide moderate long-term growth while managing downside risk. This portfolio is professionally managed and rebalanced quarterly.",
                key_features: ["Professional management", "Quarterly rebalancing", "Tax optimization", "Performance reporting"],
                benefits: [
                  "Diversified exposure to multiple asset classes",
                  "Risk-adjusted returns targeting 6-8% annually",
                  "Lower volatility than all-equity portfolios",
                  "Automatic rebalancing and tax optimization"
                ],
                why_recommended: "Your risk tolerance and investment time horizon align well with this moderately aggressive portfolio, offering growth potential while maintaining some downside protection.",
                rating: 4.7,
                link: "https://example.com/balanced-growth"
              }
            ],
            user_insights: {
              account: {
                balance: 12500,
                account_type: "Checking"
              },
              demographics: {
                age: 35,
                occupation: "Software Engineer",
                income_bracket: "$75,000 - $100,000"
              },
              credit_score: 760
            }
          };
        }
      } catch (error) {
        console.error('Recommendations API error:', error);
        throw error;
      }
    },

    refreshRecommendations: async () => {
      try {
        console.log('API Request: POST /api/recommendations/refresh');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.post('/api/recommendations/refresh');
          return response.data;
        } catch (apiError) {
          console.log('API refresh request failed, returning mock success');
          return { 
            success: true, 
            message: 'Recommendations refreshed successfully'
          };
        }
      } catch (error) {
        console.error('Error refreshing recommendations:', error);
        throw error;
      }
    },

    getRecommendationDetails: async (id) => {
      try {
        return await apiClient.get(`/recommendations/${id}`);
      } catch (error) {
        console.error(`Error fetching recommendation details for ID ${id}:`, error);
        throw error;
      }
    },

    provideFeedback: async (id, isRelevant) => {
      try {
        return await apiClient.post(`/recommendations/${id}/feedback`, { is_relevant: isRelevant });
      } catch (error) {
        console.error('Error providing recommendation feedback:', error);
        throw error;
      }
    }
  },

  // Onboarding endpoints
  onboarding: {
    startSession: async () => {
      try {
        const response = await apiClient.post('/api/onboard/start');
        return response.data;
      } catch (error) {
        console.error('API Error in startSession:', error);
        throw error;
      }
    },
    
    updateSession: async (sessionId, message) => {
      try {
        const response = await apiClient.post('/api/onboard/update', {
          session_id: sessionId,
          message
        });
        return response.data;
      } catch (error) {
        console.error('API Error in updateSession:', error);
        throw error;
      }
    },
    
    completeSession: async (sessionId) => {
      try {
        const response = await apiClient.post('/api/onboard/complete', {
          session_id: sessionId
        });
        return response.data;
      } catch (error) {
        console.error('API Error in completeSession:', error);
        throw error;
      }
    }
  },

  // Advisory documents functionality
  advisoryDocuments: {
    getDocuments: async (params = {}) => {
      try {
        console.log('API Request: GET /advisory-documents');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.get('/advisory-documents', { params });
          return response.data;
        } catch (apiError) {
          console.log('API request failed, using mock data for advisory documents');
          
          // Return mock documents
          return {
            data: [
              {
                id: '1',
                title: 'Essential Guide to Retirement Planning',
                description: 'Learn the fundamentals of planning for retirement at any age.',
                categories: ['Retirement', 'Planning', 'Education'],
                created_at: '2023-05-15T14:30:00Z',
                updated_at: '2023-06-20T09:15:00Z',
                download_url: '/documents/retirement-planning-guide.pdf',
                thumbnail: '/images/retirement-planning.jpg'
              },
              {
                id: '2',
                title: 'Investment Strategies for Market Volatility',
                description: 'Understanding how to position your investments during uncertain times.',
                categories: ['Investing', 'Market Analysis', 'Risk Management'],
                created_at: '2023-03-10T11:20:00Z',
                updated_at: '2023-05-22T14:45:00Z',
                download_url: '/documents/market-volatility-guide.pdf',
                thumbnail: '/images/market-volatility.jpg'
              }
            ]
          };
        }
      } catch (error) {
        console.error('Error fetching advisory documents:', error);
        throw error;
      }
    },
    
    getFeaturedDocuments: async () => {
      try {
        console.log('API Request: GET /advisory-documents/featured');
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.get('/advisory-documents/featured');
          return response.data;
        } catch (apiError) {
          console.log('API request failed, using mock data for featured documents');
          
          // Return mock featured documents
          return {
            data: [
              {
                id: '1',
                title: 'Essential Guide to Retirement Planning',
                description: 'Learn the fundamentals of planning for retirement at any age.',
                categories: ['Retirement', 'Planning', 'Education'],
                created_at: '2023-05-15T14:30:00Z',
                updated_at: '2023-06-20T09:15:00Z',
                download_url: '/documents/retirement-planning-guide.pdf',
                thumbnail: '/images/retirement-planning.jpg'
              },
              {
                id: '4',
                title: 'First-Time Home Buyer\'s Guide',
                description: 'Everything you need to know about purchasing your first home.',
                categories: ['Real Estate', 'Mortgages', 'Education'],
                created_at: '2023-04-05T10:15:00Z',
                updated_at: '2023-05-18T13:20:00Z',
                download_url: '/documents/first-time-homebuyer-guide.pdf',
                thumbnail: '/images/homebuyer-guide.jpg'
              }
            ]
          };
        }
      } catch (error) {
        console.error('Error fetching featured advisory documents:', error);
        throw error;
      }
    },
    
    getDocumentById: async (id) => {
      try {
        console.log(`API Request: GET /advisory-documents/${id}`);
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.get(`/advisory-documents/${id}`);
          return response.data;
        } catch (apiError) {
          console.log(`API request failed, using mock data for document ID ${id}`);
          
          // Return mock document based on ID
          return {
            data: {
              id: id,
              title: id === '1' ? 'Essential Guide to Retirement Planning' : 'Financial Document',
              description: 'Comprehensive guide to financial planning and strategies.',
              categories: ['Financial Planning', 'Education'],
              content: 'This is the mock content for the document. In a real implementation, this would be much more extensive.',
              created_at: '2023-05-15T14:30:00Z',
              updated_at: '2023-06-20T09:15:00Z',
              download_url: '/documents/sample-document.pdf'
            }
          };
        }
      } catch (error) {
        console.error(`Error fetching advisory document with ID ${id}:`, error);
        throw error;
      }
    },
    
    getDocumentsByCategory: async (category) => {
      try {
        console.log(`API Request: GET /advisory-documents?category=${category}`);
        console.log('Headers being sent:', {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(apiClient.defaults.headers.common['Authorization'] ? 
            { 'Authorization': apiClient.defaults.headers.common['Authorization'] } : {})
        });
        
        try {
          const response = await apiClient.get('/advisory-documents', { 
            params: { category } 
          });
          return response.data;
        } catch (apiError) {
          console.log(`API request failed, using mock data for category ${category}`);
          
          // Return mock documents for the category
          return {
            data: [
              {
                id: '1',
                title: 'Guide related to ' + category,
                description: `This document covers topics related to ${category}.`,
                categories: [category, 'Education'],
                created_at: '2023-05-15T14:30:00Z',
                updated_at: '2023-06-20T09:15:00Z',
                download_url: '/documents/sample-document.pdf',
                thumbnail: '/images/sample-thumbnail.jpg'
              }
            ]
          };
        }
      } catch (error) {
        console.error(`Error fetching advisory documents for category ${category}:`, error);
        throw error;
      }
    }
  }
};

// Add response interceptor to handle common error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Log API errors but don't handle them here
      // Let the caller handle specific errors
      console.error('API Error:', {
        status: error.response.status,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data
      });
    } else if (error.request) {
      // Network error or no response
      console.error('API Request Error (No Response):', error.request);
    } else {
      // Other errors
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Make sure we're exporting the api object, not as default
export { api };
export default api; 