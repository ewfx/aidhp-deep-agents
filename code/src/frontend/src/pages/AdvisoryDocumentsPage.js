import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link, 
  Grid, 
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Pagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { config } from '../config';
import AdvisoryDocumentCard from '../components/AdvisoryDocumentCard';

/**
 * Page for displaying a list of advisory documents with filtering and search capabilities
 */
const AdvisoryDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const documentsPerPage = 9;

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch documents from the API
        // For now, we'll use simulated data
        if (config.features.enableMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data for prototype
          const mockDocuments = [
            {
              id: '1',
              title: 'Essential Guide to Retirement Planning',
              description: 'Learn the fundamentals of planning for retirement at any age. Covers 401(k)s, IRAs, Social Security, and creating sustainable withdrawal strategies.',
              categories: ['Retirement', 'Planning', 'Education'],
              created_at: '2023-05-15T14:30:00Z',
              updated_at: '2023-06-20T09:15:00Z',
              download_url: '/documents/retirement-planning-guide.pdf',
              thumbnail: '/images/retirement-planning.jpg'
            },
            {
              id: '2',
              title: 'Understanding Market Volatility',
              description: 'A comprehensive overview of market volatility, its causes, historical patterns, and strategies for investors to manage portfolio risk during uncertain times.',
              categories: ['Investing', 'Markets', 'Risk Management'],
              created_at: '2023-02-10T11:20:00Z',
              updated_at: '2023-04-05T16:45:00Z',
              download_url: '/documents/market-volatility-guide.pdf',
              thumbnail: '/images/market-volatility.jpg'
            },
            {
              id: '3',
              title: 'Tax Optimization Strategies',
              description: 'Explore legal strategies to minimize tax burden across different investment accounts and income sources. Includes tax-loss harvesting, account location strategies, and more.',
              categories: ['Taxes', 'Investing', 'Planning'],
              created_at: '2023-01-22T09:00:00Z',
              updated_at: '2023-03-15T14:30:00Z',
              download_url: '/documents/tax-optimization.pdf',
              thumbnail: '/images/tax-optimization.jpg'
            },
            {
              id: '4',
              title: 'First-Time Home Buyer\'s Guide',
              description: 'Everything you need to know about purchasing your first home, from improving credit scores to understanding mortgages, closing costs, and the buying process.',
              categories: ['Real Estate', 'Mortgages', 'Education'],
              created_at: '2023-04-05T10:15:00Z',
              updated_at: '2023-05-18T13:20:00Z',
              download_url: '/documents/first-time-homebuyer-guide.pdf',
              thumbnail: '/images/homebuyer-guide.jpg'
            },
            {
              id: '5',
              title: 'College Savings and 529 Plans',
              description: 'A detailed guide on saving for education expenses, comparing 529 plans, Coverdell ESAs, and alternative approaches to fund college or vocational training.',
              categories: ['Education', 'Savings', 'Planning'],
              created_at: '2023-03-12T15:45:00Z',
              updated_at: '2023-04-28T11:10:00Z',
              download_url: '/documents/college-savings-guide.pdf',
              thumbnail: '/images/college-savings.jpg'
            },
            {
              id: '6',
              title: 'Estate Planning Essentials',
              description: 'An introduction to the key components of estate planning including wills, trusts, powers of attorney, and strategies to minimize estate taxes and ensure your wishes.',
              categories: ['Estate Planning', 'Legal', 'Planning'],
              created_at: '2023-06-03T13:25:00Z',
              updated_at: '2023-07-15T09:40:00Z',
              download_url: '/documents/estate-planning-guide.pdf',
              thumbnail: '/images/estate-planning.jpg'
            },
            {
              id: '7',
              title: 'Debt Reduction Strategies',
              description: 'Practical approaches to tackling different types of debt, from high-interest credit cards to student loans and mortgages. Includes debt avalanche vs. snowball methods.',
              categories: ['Debt Management', 'Budgeting', 'Education'],
              created_at: '2023-01-05T16:30:00Z',
              updated_at: '2023-02-20T10:15:00Z',
              download_url: '/documents/debt-reduction-guide.pdf',
              thumbnail: '/images/debt-reduction.jpg'
            },
            {
              id: '8',
              title: 'Sustainable and ESG Investing',
              description: 'Learn about environmental, social, and governance (ESG) investing approaches, performance considerations, and how to align your portfolio with your values.',
              categories: ['Investing', 'ESG', 'Education'],
              created_at: '2023-05-28T11:45:00Z',
              updated_at: '2023-06-30T14:20:00Z',
              download_url: '/documents/esg-investing-guide.pdf',
              thumbnail: '/images/esg-investing.jpg'
            },
            {
              id: '9',
              title: 'Small Business Retirement Plans',
              description: 'A comprehensive guide to retirement plan options for small business owners and self-employed individuals, including SEP IRAs, SIMPLE IRAs, Solo 401(k)s, and more.',
              categories: ['Retirement', 'Small Business', 'Planning'],
              created_at: '2023-03-18T10:30:00Z',
              updated_at: '2023-04-25T15:45:00Z',
              download_url: '/documents/small-business-retirement-guide.pdf',
              thumbnail: '/images/small-business-retirement.jpg'
            },
            {
              id: '10',
              title: 'Creating a Personal Financial Plan',
              description: 'Step-by-step guidance on developing a comprehensive financial plan tailored to your goals, timeline, and risk tolerance. Includes worksheets and action items.',
              categories: ['Planning', 'Budgeting', 'Education'],
              created_at: '2023-02-14T13:15:00Z',
              updated_at: '2023-04-10T09:30:00Z',
              download_url: '/documents/personal-financial-plan-guide.pdf',
              thumbnail: '/images/financial-plan.jpg'
            },
            {
              id: '11',
              title: 'Insurance Coverage Review',
              description: 'How to assess your insurance needs across life, health, disability, property, and liability coverage to ensure proper protection without overpaying.',
              categories: ['Insurance', 'Risk Management', 'Planning'],
              created_at: '2023-07-05T14:50:00Z',
              updated_at: '2023-07-05T14:50:00Z',
              download_url: '/documents/insurance-review-guide.pdf',
              thumbnail: '/images/insurance-review.jpg'
            },
            {
              id: '12',
              title: 'Guide to Alternative Investments',
              description: 'An exploration of alternative investment options beyond traditional stocks and bonds, including real estate, private equity, commodities, and structured products.',
              categories: ['Investing', 'Alternative Investments', 'Education'],
              created_at: '2023-04-22T15:10:00Z',
              updated_at: '2023-05-30T11:25:00Z',
              download_url: '/documents/alternative-investments-guide.pdf',
              thumbnail: '/images/alternative-investments.jpg'
            }
          ];
          
          setDocuments(mockDocuments);
          
          // Extract unique categories
          const allCategories = mockDocuments.flatMap(doc => doc.categories);
          const uniqueCategories = [...new Set(allCategories)].sort();
          setCategories(uniqueCategories);
          
        } else {
          // Real API call would go here
          // const response = await api.advisoryDocuments.getDocuments();
          // setDocuments(response.data);
          // 
          // Extract unique categories
          // const allCategories = response.data.flatMap(doc => doc.categories);
          // const uniqueCategories = [...new Set(allCategories)].sort();
          // setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching advisory documents:', error);
        setError('Failed to load advisory documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and search documents
  useEffect(() => {
    let filtered = [...documents];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => 
        doc.categories.includes(selectedCategory)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) || 
        doc.description.toLowerCase().includes(query) ||
        doc.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    setFilteredDocuments(filtered);
    setPage(1); // Reset to first page when filters change
  }, [documents, selectedCategory, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const currentPageDocuments = filteredDocuments.slice(
    (page - 1) * documentsPerPage,
    page * documentsPerPage
  );

  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Typography color="text.primary">Advisory Documents</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ArticleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" component="h1">
          Financial Advisory Documents
        </Typography>
      </Box>
      
      {/* Search and filter */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Documents"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by title, description, or category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Filter by Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Filter by Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Results section */}
      <Box>
        {/* Active filters */}
        {selectedCategory !== 'all' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            <Chip 
              label={selectedCategory} 
              onDelete={() => setSelectedCategory('all')} 
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>
        )}
        
        {/* Results count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {filteredDocuments.length === 0 ? 'No documents found' : 
            `Showing ${currentPageDocuments.length} of ${filteredDocuments.length} documents`}
        </Typography>
        
        {/* Document grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : filteredDocuments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6">No documents match your search</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search query
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {currentPageDocuments.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <AdvisoryDocumentCard document={document} isClickable />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Pagination */}
        {filteredDocuments.length > documentsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              size="large"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AdvisoryDocumentsPage; 