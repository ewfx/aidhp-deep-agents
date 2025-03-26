import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Send as SendIcon, 
  AutoAwesome as AutoAwesomeIcon,
  AttachFile as AttachFileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import axios from 'axios';
import { config } from '../config';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { styled } from '@mui/material/styles';
import RecommendationList from './RecommendationList';
import TypingIndicator from './TypingIndicator';
import MarkdownRenderer from './MarkdownRenderer';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(3),
  alignItems: 'flex-start',
  position: 'relative',
}));

const MessageContent = styled(Box)(({ theme, isUserMessage }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  maxWidth: '80%',
  wordBreak: 'break-word',
  backgroundColor: isUserMessage ? theme.palette.primary.light : theme.palette.grey[100],
  color: isUserMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 100px)',
  maxHeight: 700,
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.background.default 
      : theme.palette.grey[50], // Lighter background
  borderRadius: theme.shape.borderRadius * 2, // More rounded corners
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', // Softer shadow
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden', // Prevent overflow issues
}));

const MessagesBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.grey[400],
  },
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const TypingBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  position: 'absolute',
  bottom: theme.spacing(8),
  left: theme.spacing(8),
}));

const FeedbackContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(1),
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ScrollDownButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

const ChatInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const MessageWrapper = styled(MessageContainer)(({ isUser }) => ({
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

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

const ChatInterface = ({ 
  isFullWidth = false, 
  productContext = null,
  productId = null,
  initialMessage = null
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [apiData, setApiData] = useState(null);
  const [hasInitialQuestion, setHasInitialQuestion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  
  // Update messages on scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollDown(isScrolledUp);
    }
  };

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsTyping(true);
        
        // If we have a product ID, use it to fetch product-specific history
        const historyEndpoint = productId 
          ? `/chat/history/${productId}` 
          : '/chat/history';
        
        if (config.features.enableMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Default welcome message if there's no history
          const initialMessages = [
            {
              id: '1',
              content: initialMessage || productContext || "Hello! I'm your AI financial assistant. How can I help you today?",
              isUser: false,
              timestamp: new Date().toISOString(),
              recommendations: []
            }
          ];
          
          setMessages(initialMessages);
          setSessionId('mock-session-id');
        } else {
          // Real API call would go here
          const response = await api.chat.getHistory(historyEndpoint);
          
          if (response.data.messages && response.data.messages.length > 0) {
            setMessages(response.data.messages);
            setSessionId(response.data.sessionId);
          } else {
            // No history found, set initial welcome message
            const welcomeMessage = {
              id: '1',
              content: initialMessage || productContext || "Hello! I'm your AI financial assistant. How can I help you today?",
              isUser: false,
              timestamp: new Date().toISOString(),
              recommendations: []
            };
            setMessages([welcomeMessage]);
            
            // Create a new session
            const sessionResponse = await api.chat.startSession();
            setSessionId(sessionResponse.data.sessionId);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError('Failed to load chat history. Please try refreshing the page.');
        
        // Fallback to a default welcome message
        const welcomeMessage = {
          id: '1',
          content: initialMessage || productContext || "Hello! I'm your AI financial assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date().toISOString(),
          recommendations: []
        };
        setMessages([welcomeMessage]);
        setSessionId('fallback-session-id');
      } finally {
        setIsTyping(false);
      }
    };

    fetchHistory();
  }, [productId, initialMessage, productContext]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    try {
      // Add user message to chat
      const userMessage = {
        id: `user-${Date.now()}`,
        content: input,
        isUser: true,
        timestamp: new Date().toISOString(),
        recommendations: []
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsTyping(true);
      setError(null);
      
      // Prepare context for the API request
      let context = '';
      
      // If we have product-specific context, include it
      if (productContext) {
        context = productContext;
      }
      
      // Make API request
      if (config.features.enableMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate API response
        const mockResponses = [
          "That's a great question about your finances. Based on your profile and current financial situation, I would recommend considering a high-yield savings account for your emergency fund. This will give you both liquidity and a better return than a traditional savings account.",
          "I understand your concern about market volatility. It's important to remember that market fluctuations are normal, and investing should be viewed with a long-term perspective. Your portfolio is already well-diversified, which helps mitigate risk.",
          "When it comes to retirement planning, you're on the right track by maxing out your 401(k) contributions. Given your current age and retirement goals, you might also consider opening a Roth IRA to diversify your tax treatment in retirement.",
          "Regarding your question about debt repayment, prioritizing high-interest debt like credit cards would give you the best financial return. Once those are paid off, you can focus on lower-interest debts while continuing to invest."
        ];
        
        let responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        // If we're in a product-specific context, tailor the response
        if (productContext) {
          responseText = `Based on the specific features of this financial product and your current situation, ${responseText.toLowerCase()}`;
        }
        
        // Add a random recommendation 25% of the time
        const includeRecommendation = Math.random() < 0.25;
        
        let recommendations = [];
        if (includeRecommendation) {
          recommendations = [
            {
              id: `rec-${Date.now()}`,
              name: "High-Yield Savings Account",
              description: "Earn more interest on your savings with our premium account.",
              rating: 4.5,
              link: "#"
            }
          ];
        }
        
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          content: responseText,
          isUser: false,
          timestamp: new Date().toISOString(),
          recommendations: recommendations
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        // Real API call
        const response = await api.chat.sendMessage({
          message: input,
          sessionId: sessionId,
          context: context,
          productId: productId
        });
        
        const assistantMessage = {
          id: response.data.id || `assistant-${Date.now()}`,
          content: response.data.response,
          isUser: false,
          timestamp: response.data.timestamp || new Date().toISOString(),
          recommendations: response.data.recommendations || []
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        
        // Update session ID if provided in response
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
        
        // If there are any new recommendations, update state
        if (response.data.recommendations && response.data.recommendations.length > 0) {
          setRecommendation(response.data.recommendations[0]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle initial question
  useEffect(() => {
    if (apiData && !hasInitialQuestion) {
      setHasInitialQuestion(true);
      // Logic for setting initial question based on API data
    }
  }, [apiData, hasInitialQuestion]);

  // Container width style based on isFullWidth prop
  const containerWidthStyle = isFullWidth 
    ? { width: '100%' } 
    : { width: { xs: '100%', sm: 'auto' } };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App Bar - Only show in standalone mode */}
      {!isFullWidth && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Financial Assistant Chat
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* Information card for onboarding */}
        {!isFullWidth && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Welcome to Your Financial Profile Setup
              </Typography>
              <Typography variant="body2">
                I'll ask you a few questions to understand your financial situation and goals.
                This helps me provide personalized recommendations tailored to your needs.
                Your information is kept secure and will only be used to improve your experience.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Chat area */}
        <ChatContainer elevation={3} sx={{ ...containerWidthStyle, height: isFullWidth ? 'auto' : { xs: '80vh', sm: '500px' }, maxHeight: isFullWidth ? 'none' : { xs: '80vh', sm: '500px' } }}>
          {/* Chat header */}
          <ChatHeader
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="h6" component="div">
              {productId ? 'Product Chat Assistant' : 'Financial Assistant'}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
            </IconButton>
          </ChatHeader>

          {/* Collapsible chat body */}
          {isExpanded && (
            <>
              {/* Messages area */}
              <MessagesBox
                ref={messagesContainerRef}
                onScroll={handleScroll}
                sx={{
                  height: isFullWidth ? '500px' : 'calc(100% - 130px)',
                  maxHeight: isFullWidth ? '500px' : 'calc(100% - 130px)',
                }}
              >
                {messages.map((message, index) => (
                  <MessageWrapper
                    key={message.id || index}
                    isUser={message.isUser}
                  >
                    <MessageContentWrapper isUserMessage={message.isUser}>
                      {message.content.includes('```') ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        message.content
                      )}
                    </MessageContentWrapper>
                    
                    {/* Only render recommendations if they exist and limit to one per message */}
                    {!message.isUser && 
                     message.recommendations && 
                     message.recommendations.length > 0 && (
                      <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
                        <RecommendationList 
                          recommendations={message.recommendations.slice(0, 1)} 
                        />
                      </Box>
                    )}
                  </MessageWrapper>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <MessageWrapper isUser={false}>
                    <MessageContentWrapper isUserMessage={false}>
                      <TypingIndicator />
                    </MessageContentWrapper>
                  </MessageWrapper>
                )}
                
                {/* Error message if any */}
                {error && (
                  <MessageWrapper isUser={false}>
                    <MessageContentWrapper 
                      isUserMessage={false}
                      sx={{ color: 'error.main', bgcolor: 'error.light' }}
                    >
                      {error}
                    </MessageContentWrapper>
                  </MessageWrapper>
                )}
                
                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </MessagesBox>
              
              {/* Scroll to bottom button */}
              {showScrollDown && (
                <ScrollDownButton
                  color="primary"
                  onClick={scrollToBottom}
                  sx={{ bottom: '70px' }}
                >
                  <ExpandMoreIcon />
                </ScrollDownButton>
              )}
              
              {/* Input area */}
              <ChatInputWrapper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type your message here..."
                  value={input}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  disabled={isTyping}
                  InputProps={{
                    sx: { 
                      pr: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  disabled={!input.trim() || isTyping}
                  type="submit"
                  sx={{ ml: 1, borderRadius: 2 }}
                >
                  Send
                </Button>
              </ChatInputWrapper>
            </>
          )}
        </ChatContainer>
      </Container>
    </Box>
  );
};

export default ChatInterface; 