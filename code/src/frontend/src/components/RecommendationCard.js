import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { 
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Star as StarIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { config } from '../config';
import api from '../api';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Custom styled components
const ExpandButton = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const RecommendationCard = ({ 
  recommendation, 
  isCompact = false,
  enableDetailPage = false
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(null);

  // Handle expand/collapse
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Provide feedback
  const handleFeedback = (isPositive) => {
    setLiked(isPositive);
    // Here you would typically send this feedback to your backend
    console.log(`User ${isPositive ? 'liked' : 'disliked'} recommendation ${recommendation.id}`);
  };

  // Navigate to detail page
  const handleViewDetails = () => {
    navigate(`/recommendations/${recommendation.id}`);
  };

  // Determine the appropriate icon color based on recommendation confidence or score
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'success.main';
    if (score >= 0.6) return 'warning.main';
    return 'info.main';
  };

  // Truncate long descriptions for the main view
  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        mb: 2,
        border: recommendation.priority === 'high' ? 2 : 0,
        borderColor: recommendation.priority === 'high' ? 'primary.main' : 'transparent',
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        {/* Header with title and rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant={isCompact ? "h6" : "h5"} component="div" gutterBottom>
              {recommendation.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {recommendation.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <StarIcon color="primary" />
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
                  variant="outlined"
                />
              )}
              
              {recommendation.priority === 'high' && (
                <Chip 
                  label="Top Recommendation" 
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Box>
          
          {enableDetailPage && (
            <Button 
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewDetails}
            >
              Details
            </Button>
          )}
        </Box>
        
        {/* Description */}
        <Typography variant="body2" color="text.secondary" paragraph>
          {recommendation.short_description || recommendation.description}
        </Typography>
        
        {/* Key details in compact mode */}
        {isCompact && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {recommendation.interest_rate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Interest Rate
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {recommendation.interest_rate}
                </Typography>
              </Box>
            )}
            
            {recommendation.minimum_balance && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Minimum Balance
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${recommendation.minimum_balance.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ pt: 0 }}>
        {/* Feedback buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => handleFeedback(true)}
            color={liked === true ? 'primary' : 'default'}
            size="small"
          >
            <ThumbUpIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            onClick={() => handleFeedback(false)}
            color={liked === false ? 'primary' : 'default'}
            size="small"
          >
            <ThumbDownIcon fontSize="small" />
          </IconButton>
          
          {liked !== null && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Thanks for your feedback!
            </Typography>
          )}
        </Box>
        
        {/* Expand button for details (not shown in compact mode) */}
        {!isCompact && (
          <ExpandButton
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandButton>
        )}
        
        {/* View details button in compact mode */}
        {isCompact && enableDetailPage && (
          <Button 
            size="small" 
            onClick={handleViewDetails}
            endIcon={<ArrowForwardIcon />}
            sx={{ ml: 'auto' }}
          >
            View Details
          </Button>
        )}
      </CardActions>
      
      {/* Expandable section with more details */}
      {!isCompact && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <CardContent>
            <List dense disablePadding>
              {/* Left column - Key Features */}
              <ListItem key="key-features" disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Key Features" />
              </ListItem>
              
              {recommendation.key_features && recommendation.key_features.length > 0 ? (
                recommendation.key_features.map((feature, index) => (
                  <ListItem key={`key-feature-${index}`} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))
              ) : (
                <ListItem disableGutters>
                  <ListItemText primary="No features listed." />
                </ListItem>
              )}
            </List>
            
            {/* Right column - Benefits */}
            <List dense disablePadding>
              <ListItem key="benefits" disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Benefits" />
              </ListItem>
              
              {recommendation.benefits && recommendation.benefits.length > 0 ? (
                recommendation.benefits.map((benefit, index) => (
                  <ListItem key={`benefit-${index}`} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))
              ) : (
                <ListItem disableGutters>
                  <ListItemText primary="No benefits listed." />
                </ListItem>
              )}
            </List>
            
            {/* Why recommended section */}
            {recommendation.why_recommended && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="primary">
                    Why We Recommend This For You
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {recommendation.why_recommended}
                </Typography>
              </Box>
            )}
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              {enableDetailPage && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleViewDetails}
                  endIcon={<ArrowForwardIcon />}
                >
                  See Full Details
                </Button>
              )}
            </Box>
          </CardContent>
        </Collapse>
      )}
    </Card>
  );
};

export default RecommendationCard; 