import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  AppBar,
  Toolbar,
  LinearProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { config } from '../config';
import TypingIndicator from '../components/TypingIndicator';

// Styled components
const OnboardingContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 64px)',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
}));

const MessagesBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
}));

const MessageContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUserMessage'
})(({ theme, isUserMessage }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  maxWidth: '70%',
  backgroundColor: isUserMessage ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUserMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  marginLeft: isUserMessage ? 'auto' : '10px',
  marginRight: isUserMessage ? '10px' : 'auto',
  position: 'relative',
  wordBreak: 'break-word',
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Wrapper component to properly handle props
const MessageContentWrapper = ({ isUserMessage, children, ...props }) => {
  return (
    <MessageContent 
      isUserMessage={isUserMessage} 
      component="div" 
      {...props}
    >
      {children}
    </MessageContent>
  );
};

const OnboardingChatPage = () => {
  // State for chat messages
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  
  // Reference for auto-scrolling to bottom
  const messagesEndRef = useRef(null);
  const { user, saveUserPersona } = useAuth();
  const navigate = useNavigate();

  // Constants
  const REQUIRED_TURNS = 4; // Number of conversation turns before showing CTA
  const STORAGE_KEY = 'onboarding_session';

  // Initialize chat on component mount
  useEffect(() => {
    // Debug the API object structure
    console.log('API object structure:', api);
    
    if (!api.onboarding) {
      console.warn('API onboarding methods are missing! This will cause fallback to mock data.');
      console.log('Available API methods:', Object.keys(api));
      
      // Try to provide helpful information for debugging
      if (config.features.enableMockData) {
        console.log('Mock data is enabled, will use fallback mock responses');
      } else {
        console.error('Mock data is disabled, but API onboarding methods are missing!');
        console.log('Consider enabling mock data in config.features.enableMockData');
      }
    } else {
      console.log('API onboarding methods found:', Object.keys(api.onboarding));
    }
    
    // Check if user has already completed onboarding
    const checkOnboardingStatus = () => {
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      
      if (onboardingCompleted === 'true') {
        // User has already completed onboarding, redirect to dashboard
        console.log('Onboarding already completed, redirecting to dashboard');
        navigate('/dashboard');
        return true;
      }
      return false;
    };
    
    // If already completed, don't proceed with the rest of the initialization
    if (checkOnboardingStatus()) {
      return;
    }
    
    // Load existing session or start new one
    const savedSession = sessionStorage.getItem(STORAGE_KEY);
    
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setMessages(parsedSession.messages || []);
        setSessionId(parsedSession.sessionId || '');
        setIsComplete(parsedSession.isComplete || false);
        setTurnCount(parsedSession.turnCount || 0);
        setProgress(calculateProgress(parsedSession.turnCount || 0));
      } catch (e) {
        console.error('Error parsing saved onboarding session:', e);
        // Start onboarding on next tick to avoid state updates during render
        setTimeout(() => {
          startOnboarding();
        }, 0);
      }
    } else {
      // Start onboarding on next tick to avoid state updates during render
      setTimeout(() => {
        startOnboarding();
      }, 0);
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate progress percentage
  const calculateProgress = (turns) => {
    return Math.min(100, (turns / REQUIRED_TURNS) * 100);
  };

  // Start onboarding process
  const startOnboarding = async () => {
    try {
      setLoading(true);
      
      // Initial welcome message
      const welcomeMessage = {
        text: "Welcome! Let's understand your financial goals and preferences to provide you with personalized recommendations.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
      
      let response;
      let useMockData = config.features.enableMockData;
      
      // Attempt to use the API if mock data is not enabled
      if (!useMockData) {
        try {
          // Check if API client and onboarding methods are available
          if (!api || !api.onboarding) {
            console.warn('API onboarding methods not available, falling back to mock data');
            useMockData = true;
          } else {
            // Call API to start onboarding
            console.log('Calling API to start onboarding session');
            const apiResponse = await api.onboarding.startSession();
            console.log('API response for start session:', apiResponse);
            response = apiResponse.data;
          }
        } catch (apiError) {
          console.error('Error calling API, falling back to mock data:', apiError);
          useMockData = true;
        }
      }
      
      // Use mock data if enabled or if API failed
      if (useMockData) {
        console.log('Using mock data for onboarding');
        response = await mockOnboardingResponse('start');
      }
      
      if (response && response.session_id) {
        setSessionId(response.session_id);
        
        // Add the bot's first question
        if (response.text) {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              text: response.text,
              sender: 'bot',
              timestamp: new Date().toISOString()
            }
          ]);
        }
        
        // Save to session storage
        saveSessionToStorage([
          welcomeMessage,
          {
            text: response.text,
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
        ], response.session_id, false, 0);
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setError('Failed to start onboarding process. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Mock API responses for development
  const mockOnboardingResponse = (endpoint, message) => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    return delay(1000).then(() => {
      const newTurn = turnCount + (endpoint === 'update' ? 1 : 0);
      
      switch (endpoint) {
        case 'start':
          return {
            session_id: 'mock-session-' + Date.now(),
            text: "What are your current financial goals? For example, are you interested in saving for retirement, buying a home, or perhaps paying off existing debt? Understanding your goals will help me provide more personalized recommendations.",
            complete: false
          };
        case 'update':
          let responseText = "";
          
          // Provide different responses based on the turn count
          if (newTurn === 1) {
            responseText = "Thanks for sharing your goals. Having clear financial objectives is a great first step. Risk tolerance is another important factor in financial planning. How comfortable are you with financial risk on a scale from 1 (very conservative) to 10 (very aggressive)?";
          } else if (newTurn === 2) {
            responseText = "I appreciate understanding your risk tolerance. This helps determine the right investment mix for your situation. Looking ahead, do you foresee any major life changes in the next 1-3 years that might impact your finances? For example, a career change, moving to a new location, or family changes?";
          } else if (newTurn === 3) {
            responseText = "Thank you for sharing those details about your future plans. This gives me a better picture of your financial timeline. As we wrap up, what specific financial areas would you like more guidance on? This might include budgeting, investing strategies, debt management, or retirement planning.";
          } else if (newTurn >= REQUIRED_TURNS) {
            responseText = "Thank you for sharing your financial preferences. I've gathered valuable information about your goals, risk tolerance, future plans, and areas where you'd like guidance. I now have all the details needed to provide you with personalized recommendations tailored to your financial situation.";
            return {
              session_id: sessionId,
              text: responseText,
              complete: true
            };
          }
          
          return {
            session_id: sessionId,
            text: responseText,
            complete: false
          };
        case 'complete':
          return {
            session_id: sessionId,
            text: "Thank you for completing the onboarding process! I've analyzed your responses and prepared personalized financial recommendations based on your goals, risk tolerance, and timeline. You can now view these tailored insights on your dashboard, which will help guide your financial decisions moving forward.",
            complete: true
          };
        default:
          return {
            error: "Invalid endpoint"
          };
      }
    });
  };

  // Save session data to storage
  const saveSessionToStorage = (messages, sessionId, isComplete, turns) => {
    const sessionData = {
      messages,
      sessionId,
      isComplete,
      turnCount: turns,
      lastUpdated: new Date().toISOString()
    };
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      console.log('Sending message:', inputMessage);
      
      // Add user message to chat
      const userMessage = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      console.log('Adding user message to chat:', userMessage);
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputMessage('');
      setLoading(true);
      setError('');
      
      let apiResponse;
      let useMockData = config.features.enableMockData;
      
      // Attempt to use the API if mock data is not enabled
      if (!useMockData) {
        try {
          // Check if API onboarding is available
          if (!api || !api.onboarding) {
            console.warn('API onboarding methods not available, falling back to mock data');
            useMockData = true;
          } else {
            // Determine if this is the first message or an update
            if (!sessionId) {
              console.log('First user message - starting new session');
              
              // Call API to start onboarding
              const response = await api.onboarding.startSession();
              console.log('Start session response:', response);
              apiResponse = response.data;
              
              if (apiResponse && apiResponse.session_id) {
                setSessionId(apiResponse.session_id);
                console.log('Set new session ID:', apiResponse.session_id);
              }
            } else {
              console.log('Updating existing session:', sessionId);
              
              // Call API to update onboarding
              const response = await api.onboarding.updateSession(sessionId, inputMessage);
              console.log('Update session response:', response);
              apiResponse = response.data;
            }
          }
        } catch (apiError) {
          console.error('Error calling API, falling back to mock data:', apiError);
          useMockData = true;
        }
      }
      
      // Use mock data if enabled or if API failed
      if (useMockData) {
        console.log('Using mock data for onboarding message');
        if (!sessionId) {
          // First message - generate a session ID
          const mockSessionId = 'mock-session-' + Date.now();
          setSessionId(mockSessionId);
          apiResponse = await mockOnboardingResponse('start');
        } else {
          apiResponse = await mockOnboardingResponse('update', inputMessage);
        }
      }
      
      // Process response and add bot message
      if (apiResponse && (apiResponse.text || apiResponse.response)) {
        const botMessage = {
          text: apiResponse.text || apiResponse.response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        
        console.log('Adding bot response to chat:', botMessage);
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        // Check if onboarding is complete
        if (apiResponse.is_complete || apiResponse.complete) {
          console.log('Onboarding is complete, finalizing session');
          setIsComplete(true);
          
          if (!useMockData) {
            await finalizeOnboarding(sessionId);
          } else {
            // Mock completion
            localStorage.setItem('onboarding_completed', 'true');
            // Redirect after a delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        }
        
        // Update turn count and progress
        const newTurnCount = turnCount + 1;
        setTurnCount(newTurnCount);
        setProgress(calculateProgress(newTurnCount));
        
        // Save session to storage
        saveSessionToStorage([...messages, userMessage, botMessage], sessionId, 
          apiResponse.is_complete || apiResponse.complete || false, newTurnCount);
      } else {
        console.warn('No text in API response:', apiResponse);
        setError('We encountered an issue. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle complete onboarding button click
  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      
      let response;
      let useMockData = config.features.enableMockData;
      
      // Attempt to use the API if mock data is not enabled
      if (!useMockData) {
        try {
          // Check if API client is available
          if (!api || !api.onboarding) {
            console.warn('API onboarding methods not available, falling back to mock data');
            useMockData = true;
          } else {
            // Call API to complete onboarding
            console.log('Calling API to complete onboarding session:', sessionId);
            const apiResponse = await api.onboarding.completeSession(sessionId);
            console.log('Complete session response:', apiResponse);
            response = apiResponse.data;
          }
        } catch (apiError) {
          console.error('Error calling API, falling back to mock data:', apiError);
          useMockData = true;
        }
      }
      
      // Use mock data if enabled or if API failed
      if (useMockData) {
        console.log('Using mock data for completing onboarding');
        response = await mockOnboardingResponse('complete');
      }
      
      if (response) {
        // Add final message if provided
        if (response.text) {
          const finalMessage = {
            text: response.text,
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          
          setMessages(prevMessages => [...prevMessages, finalMessage]);
        }
        
        // Mark onboarding as complete
        localStorage.setItem('onboarding_completed', 'true');
        
        // Redirect to dashboard after a short delay
        // Use navigate directly instead of setTimeout to avoid memory leaks and ensure cleanup
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
      
      // Fall back to local completion if API fails completely
      localStorage.setItem('onboarding_completed', 'true');
      
      // Redirect to dashboard immediately on error
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Finalize the onboarding process
  const finalizeOnboarding = async (sessionId) => {
    try {
      console.log('Finalizing onboarding for session:', sessionId);
      
      let completeResponse;
      let useMockData = config.features.enableMockData;
      
      // Attempt to use the API if mock data is not enabled
      if (!useMockData) {
        try {
          // Check if API client is available
          if (!api || !api.onboarding) {
            console.warn('API onboarding methods not available, falling back to mock data');
            useMockData = true;
          } else {
            // Call API to complete the onboarding session
            const response = await api.onboarding.completeSession(sessionId);
            console.log('Complete session response:', response);
            completeResponse = response.data;
          }
        } catch (apiError) {
          console.error('Error calling API, falling back to mock data:', apiError);
          useMockData = true;
        }
      }
      
      // Use mock data if enabled or if API failed
      if (useMockData) {
        console.log('Using mock data for finalizing onboarding');
        completeResponse = await mockOnboardingResponse('complete');
      }
      
      // Mark onboarding as completed in local storage
      localStorage.setItem('onboarding_completed', 'true');
      
      // Optionally, update the user context to reflect completion
      if (saveUserPersona) {
        const userPersona = completeResponse?.user_persona || {
          // Default values if the API doesn't return a persona
          risk_tolerance: 'moderate',
          goals: ['retirement', 'emergency_fund'],
          time_horizon: 'medium',
          completed_at: new Date().toISOString()
        };
        
        console.log('Saving user persona:', userPersona);
        saveUserPersona(userPersona);
      }
      
      // Add final message if provided
      if (completeResponse && completeResponse.text) {
        const finalMessage = {
          text: completeResponse.text,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, finalMessage]);
      }
      
      // Show completion message or redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error finalizing onboarding:', error);
      setError('There was an issue completing your profile. Please try again.');
      
      // Fall back to local completion if API fails completely
      localStorage.setItem('onboarding_completed', 'true');
      
      // Redirect after a delay even if there's an error
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Financial Advisor Onboarding
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <OnboardingContainer>
          {/* Progress indicator */}
          <Box sx={{ width: '100%' }}>
            <ProgressBar variant="determinate" value={progress} />
          </Box>
          
          {/* Header */}
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Welcome! Let's understand your financial goals.
          </Typography>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Chat messages */}
          <MessagesBox>
            {messages.map((message, index) => (
              <MessageContainer key={index}>
                <MessageContentWrapper isUserMessage={message.sender === 'user'}>
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                </MessageContentWrapper>
              </MessageContainer>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <Box sx={{ ml: 2, mb: 2 }}>
                <TypingIndicator />
              </Box>
            )}
            
            {/* CTA button when onboarding is complete */}
            {isComplete && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleCompleteOnboarding}
                >
                  View My Recommendations
                </Button>
              </Box>
            )}
            
            {/* Ref for auto-scrolling */}
            <div ref={messagesEndRef} />
          </MessagesBox>
          
          {/* Input area (hidden when complete) */}
          {!isComplete && (
            <InputArea>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                size="small"
                multiline
                maxRows={3}
                sx={{ mr: 1 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
              >
                Send
              </Button>
            </InputArea>
          )}
        </OnboardingContainer>
      </Container>
    </Box>
  );
};

export default OnboardingChatPage; 