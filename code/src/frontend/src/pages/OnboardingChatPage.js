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

const MessageContent = styled(Box)(({ theme, isUserMessage }) => ({
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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Constants
  const REQUIRED_TURNS = 4; // Number of conversation turns before showing CTA
  const STORAGE_KEY = 'onboarding_session';

  // Initialize chat on component mount
  useEffect(() => {
    // Check if user has already completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    
    if (onboardingCompleted === 'true') {
      // User has already completed onboarding, redirect to dashboard
      navigate('/dashboard');
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
        startOnboarding();
      }
    } else {
      startOnboarding();
    }
  }, [navigate]);

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
      
      // Call API to start onboarding
      const response = await callOnboardingAPI('start');
      
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

  // Call the onboarding API
  const callOnboardingAPI = async (endpoint, message = '') => {
    // For development, simulate API responses if mock data is enabled
    if (config.features.enableMockData) {
      return mockOnboardingResponse(endpoint, message);
    }
    
    try {
      let response;
      
      switch (endpoint) {
        case 'start':
          response = await api.onboarding.startSession();
          break;
        case 'update':
          response = await api.onboarding.updateSession(sessionId, message);
          break;
        case 'complete':
          response = await api.onboarding.completeSession(sessionId);
          break;
        default:
          throw new Error('Invalid endpoint');
      }
      
      return response;
    } catch (error) {
      console.error(`Error calling onboarding API (${endpoint}):`, error);
      throw error;
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
    if (!inputMessage.trim() || loading) return;
    
    // Add user message to UI
    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);
    
    try {
      // Update the conversation with user's message
      const updatedMessages = [...messages, userMessage];
      const newTurnCount = turnCount + 1;
      setTurnCount(newTurnCount);
      setProgress(calculateProgress(newTurnCount));
      
      // Call API to get next question or complete onboarding
      const response = await callOnboardingAPI('update', inputMessage);
      
      const botResponse = {
        text: response.text,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      // Add bot response to UI
      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Save updated conversation to session storage
      saveSessionToStorage(
        [...updatedMessages, botResponse],
        sessionId,
        response.complete,
        newTurnCount
      );
      
      // Check if onboarding is complete
      if (response.complete) {
        setIsComplete(true);
        // Set the completion flag to prevent further questions
        localStorage.setItem('onboarding_completed', 'true');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Finalize onboarding
  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      
      // Call API to complete onboarding and get final message
      const response = await callOnboardingAPI('complete');
      
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
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
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
                <MessageContent isUserMessage={message.sender === 'user'}>
                  <Typography variant="body1">
                    {message.text}
                  </Typography>
                </MessageContent>
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