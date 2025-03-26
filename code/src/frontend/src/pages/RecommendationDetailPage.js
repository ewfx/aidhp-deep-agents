import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link, 
  Button, 
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  StarRate as StarRateIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { config } from '../config';
import api from '../api';
import ChatInterface from '../components/ChatInterface';

/**
 * Page for displaying a detailed view of a single recommendation
 * with embedded product-specific chatbot
 */
const RecommendationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recommendation details
  useEffect(() => {
    const fetchRecommendationDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch the recommendation from the API
        // For now, we'll use a simulated API response
        if (config.features.enableMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock data for prototype
          const mockRecommendation = {
            id,
            name: "Premier Money Market Account",
            description: "A high-yield money market account that offers competitive interest rates with the flexibility to access your funds when needed.",
            detailed_description: "The Premier Money Market Account is designed for customers who want to maximize their savings while maintaining liquidity. With tiered interest rates that increase with your balance, you'll earn more as your savings grow. This account features check-writing privileges, online and mobile access, and no monthly service fee when you maintain a minimum daily balance.",
            short_description: "High-yield money market account with competitive rates and access to funds.",
            category: "Savings",
            tags: ["High Yield", "Flexible", "Low Fees"],
            interest_rate: "2.15%",
            minimum_balance: 5000,
            monthly_fee: 15,
            fee_waiver_requirements: "Maintain a minimum daily balance of $5,000 or have a linked Premier Checking account.",
            key_features: [
              "Competitive, tiered interest rates",
              "Check-writing privileges",
              "Online and mobile banking access",
              "Direct deposit capability",
              "No monthly service fee with minimum balance"
            ],
            benefits: [
              "Earn higher interest rates compared to standard savings accounts",
              "Maintain liquidity and access to your funds",
              "Automatic savings options available",
              "FDIC insured up to $250,000"
            ],
            why_recommended: "Based on your savings goals and current financial situation, the Premier Money Market Account offers an optimal balance of growth potential and accessibility. With your current cash reserves, you'll qualify for our higher interest rate tiers, maximizing your returns while keeping funds available for emergencies or future opportunities.",
            rating: 4.5,
            link: "https://example.com/premier-money-market",
            priority: "high",
            chatbot_context: "The Premier Money Market Account offers a balance of growth and flexibility. It's particularly well-suited for your emergency fund and shorter-term savings goals (1-3 years). With your current savings of approximately $30,000, you'd qualify for our Tier 2 interest rate of 2.15%. This recommendation aligns with your stated goal of building and maintaining a strong emergency fund while earning competitive interest."
          };
          
          setRecommendation(mockRecommendation);
        } else {
          // Real API call would go here
          const response = await api.recommendations.getRecommendationDetails(id);
          setRecommendation(response.data);
        }
      } catch (error) {
        console.error('Error fetching recommendation details:', error);
        setError('Failed to load recommendation details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationDetails();
  }, [id]);

  // Handle Back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle learn more click
  const handleLearnMore = () => {
    if (recommendation && recommendation.link) {
      window.open(recommendation.link, '_blank');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Typography color="text.primary">Recommendation Details</Typography>
      </Breadcrumbs>
      
      {/* Back button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>
      
      {/* Main content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : recommendation ? (
          <Grid container spacing={3}>
            {/* Product Details Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {recommendation.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {recommendation.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <StarRateIcon color="primary" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {recommendation.rating}/5
                          </Typography>
                        </Box>
                      )}
                      
                      {recommendation.category && (
                        <Chip 
                          label={recommendation.category} 
                          color="secondary"
                          size="small"
                        />
                      )}
                      
                      {recommendation.tags && recommendation.tags.map((tag, idx) => (
                        <Chip 
                          key={idx}
                          label={tag}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  {recommendation.priority === 'high' && (
                    <Chip 
                      label="Top Recommendation" 
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>
                
                <Typography variant="body1" paragraph>
                  {recommendation.detailed_description || recommendation.description}
                </Typography>
                
                {recommendation.interest_rate && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Interest Rate
                            </Typography>
                            <Typography variant="h5" component="div">
                              {recommendation.interest_rate}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Minimum Balance
                            </Typography>
                            <Typography variant="h5" component="div">
                              ${recommendation.minimum_balance?.toLocaleString() || '0'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                              Monthly Fee
                            </Typography>
                            <Typography variant="h5" component="div">
                              ${recommendation.monthly_fee?.toLocaleString() || '0'}
                            </Typography>
                            {recommendation.fee_waiver_requirements && (
                              <Typography variant="caption" color="text.secondary">
                                Can be waived: {recommendation.fee_waiver_requirements}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={4}>
                    {/* Key Features */}
                    {recommendation.key_features && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Key Features
                        </Typography>
                        <List>
                          {recommendation.key_features.map((feature, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <CheckCircleIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                    
                    {/* Benefits */}
                    {recommendation.benefits && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Benefits
                        </Typography>
                        <List>
                          {recommendation.benefits.map((benefit, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <CheckCircleIcon color="success" />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </Box>
                
                {/* Why Recommended Section */}
                {recommendation.why_recommended && (
                  <Box sx={{ 
                    mt: 4, 
                    p: 2, 
                    bgcolor: 'rgba(212, 27, 44, 0.05)', 
                    borderRadius: 1,
                    border: '1px solid rgba(212, 27, 44, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InfoIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Why We Recommended This For You
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {recommendation.why_recommended}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    onClick={handleLearnMore}
                  >
                    Learn More & Apply
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Product Chat Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" gutterBottom>
                  Ask About This Product
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Have questions about the {recommendation.name}? Our AI assistant can help you understand its features and benefits, and how it fits your financial needs.
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Embedded ChatInterface with product-specific context */}
                <ChatInterface 
                  isFullWidth={true}
                  productContext={recommendation.chatbot_context}
                  productId={recommendation.id}
                />
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography>Recommendation not found.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default RecommendationDetailPage; 