import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip
} from '@mui/material';
import {
  Lightbulb,
  FavoriteOutlined,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral
} from '@mui/icons-material';

const AdvicePage = ({ emotion, advice }) => {
  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy':
        return <SentimentSatisfied sx={{ fontSize: 40, color: '#4caf50' }} />;
      case 'sad':
        return <SentimentDissatisfied sx={{ fontSize: 40, color: '#2196f3' }} />;
      case 'angry':
        return <SentimentVeryDissatisfied sx={{ fontSize: 40, color: '#f44336' }} />;
      case 'normal':
        return <SentimentNeutral sx={{ fontSize: 40, color: '#ff9800' }} />;
      default:
        return <SentimentNeutral sx={{ fontSize: 40, color: '#9e9e9e' }} />;
    }
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'happy':
        return 'success';
      case 'sad':
        return 'info';
      case 'angry':
        return 'error';
      case 'normal':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Parenting Advice
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          {getEmotionIcon(emotion)}
          <Box ml={2}>
            <Chip 
              label={emotion.toUpperCase()} 
              color={getEmotionColor(emotion)}
              variant="filled"
              size="medium"
            />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom color="primary" textAlign="center">
          {advice.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
          Here are some helpful tips for interacting with your baby:
        </Typography>

        <List dense>
          {advice.tips.map((tip, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FavoriteOutlined color="secondary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={tip}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.primary'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Box mt={2} p={2} bgcolor="rgba(25, 118, 210, 0.08)" borderRadius={1}>
          <Typography variant="caption" color="primary" fontWeight="bold">
            💡 Remember: Every baby is unique, and these are general guidelines. Trust your instincts and consult your pediatrician if you have concerns.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvicePage;