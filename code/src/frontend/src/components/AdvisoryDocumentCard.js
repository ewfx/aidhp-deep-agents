import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  CardActionArea, 
  Chip, 
  Button, 
  CardActions 
} from '@mui/material';
import { 
  Article as ArticleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying an advisory document card
 * @param {Object} document - Document data object
 * @param {boolean} isClickable - Whether the card should be clickable to view details
 */
const AdvisoryDocumentCard = ({ document, isClickable = false }) => {
  const navigate = useNavigate();

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle view document click
  const handleViewDocument = () => {
    navigate(`/advisory-documents/${document.id}`);
  };

  // Handle download click
  const handleDownload = (e) => {
    e.stopPropagation(); // Prevent navigating to document page when clicking download
    
    // If there's an actual download URL, use it
    if (document.download_url) {
      // If the URL is absolute (starts with http), open in new tab
      if (document.download_url.startsWith('http')) {
        window.open(document.download_url, '_blank');
      } else {
        // For relative URLs, construct the full URL
        const baseUrl = window.location.origin;
        window.open(`${baseUrl}${document.download_url}`, '_blank');
      }
    }
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        ...(isClickable && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        })
      }}
    >
      {/* Card Content with optional click action */}
      {isClickable ? (
        <CardActionArea 
          onClick={handleViewDocument}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <CardMedia>
            {document.thumbnail ? (
              <img 
                src={document.thumbnail} 
                alt={document.title}
                style={{ 
                  width: '100%', 
                  height: '140px', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <Box 
                sx={{ 
                  height: '140px', 
                  bgcolor: 'primary.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}
              >
                <ArticleIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
            )}
          </CardMedia>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" gutterBottom noWrap>
              {document.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '4.5em' // Approximately 3 lines of text
              }}
            >
              {document.description}
            </Typography>
            
            {document.categories && document.categories.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                {document.categories.slice(0, 3).map((category, index) => (
                  <Chip 
                    key={index}
                    label={category}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {document.categories.length > 3 && (
                  <Chip 
                    label={`+${document.categories.length - 3}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      ) : (
        <>
          <CardMedia>
            {document.thumbnail ? (
              <img 
                src={document.thumbnail} 
                alt={document.title}
                style={{ 
                  width: '100%', 
                  height: '140px', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <Box 
                sx={{ 
                  height: '140px', 
                  bgcolor: 'primary.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}
              >
                <ArticleIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
            )}
          </CardMedia>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" gutterBottom noWrap>
              {document.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '4.5em' // Approximately 3 lines of text
              }}
            >
              {document.description}
            </Typography>
            
            {document.categories && document.categories.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                {document.categories.slice(0, 3).map((category, index) => (
                  <Chip 
                    key={index}
                    label={category}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {document.categories.length > 3 && (
                  <Chip 
                    label={`+${document.categories.length - 3}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </CardContent>
        </>
      )}
      
      {/* Card Actions - always shown */}
      <CardActions sx={{ justifyContent: 'space-between', mt: 'auto' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {document.updated_at ? `Updated: ${formatDate(document.updated_at)}` : ''}
          </Typography>
        </Box>
        
        <Box>
          {document.download_url && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          )}
          
          {isClickable && (
            <Button
              size="small"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleViewDocument}
            >
              Read
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default AdvisoryDocumentCard; 