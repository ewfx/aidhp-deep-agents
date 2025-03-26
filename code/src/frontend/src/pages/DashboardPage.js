import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Divider,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Alert,
  Tabs,
  Tab,
  CardActions
} from '@mui/material';
import { 
  AccountCircle,
  RefreshOutlined,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';
import RecommendationCard from '../components/RecommendationCard';
import ChatButton from '../components/ChatButton';
import api from '../api';
import AdvisoryDocumentCard from '../components/AdvisoryDocumentCard';

const DashboardPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [userInsights, setUserInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [advisoryDocuments, setAdvisoryDocuments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Handle profile menu open/close
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Fetch recommendations from API
  const fetchRecommendations = useCallback(async () => {
    if (dataFetched && !refreshing) return;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching recommendations from API...');
      const data = await api.recommendations.getRecommendations();
      
      if (data) {
        console.log('Recommendations data:', data);
        setRecommendations(data.recommendations || []);
        
        // If user insights are available in the response
        if (data.user_insights) {
          setUserInsights(data.user_insights);
        }
        
        // Mark as fetched to prevent redundant API calls
        setDataFetched(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again later.');
      
      // Set mock recommendations as fallback
      if (config.features.enableMockData) {
        console.log('Using mock recommendations data as fallback');
        setRecommendations([
          {
            id: "rec-001",
            name: "High-Yield Savings Account",
            category: "Savings",
            tags: ["Low Risk", "Liquid"],
            priority: "high",
            short_description: "Earn higher interest on your savings with no fees and easy access to your money.",
            description: "Our High-Yield Savings Account offers significantly better rates than traditional savings accounts.",
            key_features: ["No monthly fees", "FDIC insured", "Mobile banking access", "2.15% APY"],
            why_recommended: "Based on your cash reserves and short-term goals.",
            rating: 4.5,
            link: "https://example.com/high-yield-savings"
          },
          {
            id: "rec-002",
            name: "Wells Fargo Red Card™",
            category: "Credit Card",
            tags: ["Rewards", "No Annual Fee"],
            short_description: "Earn 2% cash back on all purchases with no annual fee and special Wells Fargo benefits.",
            description: "The Wells Fargo Red Card™ offers unlimited 2% cash back on all purchases.",
            key_features: ["2% unlimited cash back", "No annual fee", "Special financing", "Mobile app integration"],
            why_recommended: "This card complements your spending habits and offers better rewards.",
            rating: 4.0,
            link: "https://example.com/red-card"
          },
          {
            id: "rec-003",
            name: "Balanced Growth Portfolio",
            category: "Investment",
            tags: ["Moderate Risk", "Diversified"],
            short_description: "A professionally managed diversified portfolio designed for moderate growth with managed risk.",
            description: "Our Balanced Growth Portfolio offers a diversified mix of stocks, bonds, and alternative investments.",
            key_features: ["Professional management", "Quarterly rebalancing", "Tax optimization", "Performance reporting"],
            why_recommended: "Your risk tolerance and investment time horizon align well with this portfolio.",
            rating: 4.7,
            link: "https://example.com/balanced-growth"
          }
        ]);
        
        // Mock user insights
        setUserInsights({
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
        });
        
        setDataFetched(true);
      }
    } finally {
      setLoading(false);
    }
  }, [dataFetched, refreshing, config.features.enableMockData]);
  
  // Refresh recommendations
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      console.log('Refreshing recommendations...');
      await api.recommendations.refreshRecommendations();
      
      // Force a refetch by setting dataFetched to false
      setDataFetched(false);
      
      // Fetch the updated recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      setError('Failed to refresh recommendations. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Load recommendations on component mount
  useEffect(() => {
    if (!dataFetched) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, dataFetched]);

  // Fetch advisory documents
  useEffect(() => {
    const fetchAdvisoryDocuments = async () => {
      // Don't re-fetch if we already have documents
      if (advisoryDocuments.length > 0 && !refreshing) return;

      try {
        setDocumentLoading(true);
        setDocumentError(null);
        
        console.log('Fetching advisory documents...');
        
        if (config.features.enableMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock data for featured documents (subset of all documents)
          const mockDocuments = [
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
            },
            {
              id: '7',
              title: 'Debt Reduction Strategies',
              description: 'Practical approaches to tackling different types of debt.',
              categories: ['Debt Management', 'Budgeting', 'Education'],
              created_at: '2023-01-05T16:30:00Z',
              updated_at: '2023-02-20T10:15:00Z',
              download_url: '/documents/debt-reduction-guide.pdf',
              thumbnail: '/images/debt-reduction.jpg'
            }
          ];
          
          setAdvisoryDocuments(mockDocuments);
          console.log('Using mock advisory documents data');
        } else {
          try {
            // Try actual API call
            const response = await api.advisoryDocuments.getFeaturedDocuments();
            setAdvisoryDocuments(response.data || []);
          } catch (apiError) {
            console.error('API error fetching documents, using mock data:', apiError);
            // Fallback to mock data
            if (config.features.enableMockData) {
              setAdvisoryDocuments([
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
                  categories: ['Real Estate', 'Mortgages', 'Education']
                }
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching advisory documents:', error);
        setDocumentError('Failed to load advisory documents. Please try again later.');
      } finally {
        setDocumentLoading(false);
      }
    };

    fetchAdvisoryDocuments();
  }, [advisoryDocuments.length, refreshing, config.features.enableMockData]);
  
  // Menu ID
  const menuId = 'primary-account-menu';
  
  // Profile menu component
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={handleClose}>Profile</MenuItem>
      <MenuItem onClick={handleClose}>Settings</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}
          >
            Financial Advisor
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              color="inherit"
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Welcome Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}
            >
              {currentUser?.user_id?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5">
                Welcome back, {currentUser?.user_id || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here's your personalized financial dashboard
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 2 }}>
            <Tabs 
              value={selectedTab} 
              onChange={(event, newValue) => setSelectedTab(newValue)}
              centered
              sx={{ mb: 2 }}
            >
              <Tab icon={<DashboardIcon />} label="Overview" />
              <Tab icon={<AssessmentIcon />} label="Recommendations" />
              <Tab icon={<ArticleIcon />} label="Advisory Documents" />
            </Tabs>
          </Box>
        </Paper>
        
        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {selectedTab === 0 && (
            <Grid container spacing={4}>
              {/* User Insights Section */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Your Financial Insights
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Risk Tolerance:</strong> Moderate
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Investment Horizon:</strong> 10-15 years
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Top Goal:</strong> Retirement
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Emergency Fund:</strong> 4 months
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      fullWidth
                    >
                      Update Your Profile
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Top Recommendations Section */}
              <Grid item xs={12} md={8}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Top Recommendations
                    </Typography>
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedTab(1);
                      }}
                      size="small"
                    >
                      See All
                    </Button>
                  </Box>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : recommendations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No recommendations available yet. Please complete your profile to receive personalized recommendations.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {recommendations.slice(0, 2).map((recommendation) => (
                        <Grid item xs={12} key={recommendation.id}>
                          <RecommendationCard 
                            recommendation={recommendation} 
                            isCompact={true}
                            enableDetailPage={true}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
              
              {/* Featured Advisory Documents Section */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Featured Advisory Documents
                    </Typography>
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedTab(2);
                      }}
                      size="small"
                    >
                      See All
                    </Button>
                  </Box>
                  
                  {documentLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : documentError ? (
                    <Typography color="error">{documentError}</Typography>
                  ) : advisoryDocuments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No advisory documents available at this time.
                    </Typography>
                  ) : (
                    <Grid container spacing={3}>
                      {advisoryDocuments.map((document) => (
                        <Grid item xs={12} sm={6} md={4} key={document.id}>
                          <AdvisoryDocumentCard document={document} isClickable />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Recommendations Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Your Personalized Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on your financial profile and goals, we've curated these recommendations just for you.
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : recommendations.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No recommendations available yet. Please complete your profile to receive personalized recommendations.
                  </Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Update Profile
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {recommendations.map((recommendation) => (
                    <Grid item xs={12} key={recommendation.id}>
                      <RecommendationCard 
                        recommendation={recommendation}
                        enableDetailPage={true}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Advisory Documents Tab */}
          {selectedTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Advisory Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Educational resources to help you make informed financial decisions.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  to="/advisory-documents"
                  startIcon={<ArticleIcon />}
                >
                  Browse All Documents
                </Button>
              </Box>
              
              {documentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : documentError ? (
                <Typography color="error">{documentError}</Typography>
              ) : advisoryDocuments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No advisory documents available at this time.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {/* Featured Documents */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Featured Documents
                        </Typography>
                        <Grid container spacing={3}>
                          {advisoryDocuments.map((document) => (
                            <Grid item xs={12} sm={6} md={4} key={document.id}>
                              <AdvisoryDocumentCard document={document} isClickable />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center' }}>
                        <Button 
                          color="primary"
                          component={Link}
                          to="/advisory-documents"
                        >
                          View All Documents
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  
                  {/* Document Categories */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Browse by Category
                        </Typography>
                        <Grid container spacing={2}>
                          {['Retirement', 'Investing', 'Debt Management', 'Real Estate', 'Taxes', 'Insurance'].map((category) => (
                            <Grid item xs={6} sm={4} md={2} key={category}>
                              <Button 
                                variant="outlined" 
                                fullWidth
                                component={Link}
                                to={`/advisory-documents?category=${category}`}
                                sx={{ 
                                  height: '100px', 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  textTransform: 'none',
                                  borderRadius: 2
                                }}
                              >
                                <ArticleIcon sx={{ mb: 1 }} />
                                <Typography variant="body2">{category}</Typography>
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Chat Button */}
      <ChatButton />
    </Box>
  );
};

export default DashboardPage; 