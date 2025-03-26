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
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { config } from '../config';
import api from '../api';

const AdvisoryDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch advisory document details
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch the document from the API
        // For now, we'll use a simulated API response
        if (config.features.enableMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock data for prototype
          const mockDocument = {
            id,
            title: "Building a Strong Financial Foundation",
            description: "A comprehensive guide to establishing financial security through budgeting, emergency funds, and debt management.",
            categories: ["Budgeting", "Financial Planning"],
            content: `
# Building a Strong Financial Foundation

## Introduction
Financial security begins with a solid foundation. This guide will help you understand the essential elements of financial stability and provide practical steps to achieve it.

## Creating a Budget
A budget is the cornerstone of financial planning. It helps you track income and expenses, identify spending patterns, and make informed decisions about your money.

### Steps to Create a Budget
1. **Track your income**: List all sources of income, including salary, freelance work, and investments.
2. **List your expenses**: Document all monthly expenses, from rent and utilities to groceries and entertainment.
3. **Categorize expenses**: Separate needs (housing, food, healthcare) from wants (dining out, subscriptions).
4. **Set spending limits**: Allocate specific amounts to each category based on your income and financial goals.
5. **Review and adjust**: Regularly review your budget and make adjustments as needed.

## Building an Emergency Fund
An emergency fund provides financial security during unexpected events like job loss, medical emergencies, or home repairs.

### Guidelines for Emergency Funds
- Aim to save 3-6 months of essential expenses.
- Keep the funds in a liquid, easily accessible account.
- Only use the fund for true emergencies.

## Managing Debt
Effectively managing debt is crucial for financial health. Prioritize high-interest debt while maintaining minimum payments on all obligations.

### Debt Repayment Strategies
- **Avalanche Method**: Pay off debts with the highest interest rates first.
- **Snowball Method**: Pay off smallest debts first for psychological wins.

## Next Steps
Once you've established these fundamentals, you can move on to more advanced financial planning, including retirement savings, investments, and wealth building.
            `,
            download_url: "https://example.com/advisory-documents/financial-foundation.pdf",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setDocument(mockDocument);
        } else {
          // Real API call would go here
          const response = await api.advisory.getDocument(id);
          setDocument(response.data);
        }
      } catch (error) {
        console.error('Error fetching advisory document:', error);
        setError('Failed to load the document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Handle Back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle document download
  const handleDownload = () => {
    if (document && document.download_url) {
      window.open(document.download_url, '_blank');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Typography color="text.primary">Advisory Document</Typography>
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
      <Paper elevation={2} sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : document ? (
          <>
            {/* Document header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <ArticleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {document.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {document.categories && document.categories.map((category, idx) => (
                    <Chip 
                      key={idx}
                      label={category}
                      color="secondary"
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                  {document.description}
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ mt: 1 }}
                >
                  Download PDF Version
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Document content */}
            <Box sx={{ 
              mt: 2, 
              px: { xs: 0, md: 2 },
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                mt: 3,
                mb: 2,
                fontWeight: 600,
                color: theme => theme.palette.primary.main
              },
              "& p": {
                mb: 2,
                lineHeight: 1.7
              },
              "& ul, & ol": {
                mb: 2,
                pl: 4
              },
              "& li": {
                mb: 1
              }
            }}>
              {document.content ? (
                // Use a markdown renderer here if content is in markdown format
                <div dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br>').replace(/^#{1,6}\s+(.+)$/gm, '<h3>$1</h3>') }} />
              ) : (
                <Typography variant="body1">No content available for this document.</Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography>Document not found.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdvisoryDocumentPage; 