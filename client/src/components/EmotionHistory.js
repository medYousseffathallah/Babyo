import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  History,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';

const EmotionHistory = () => {
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmotionHistory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchEmotionHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmotionHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/emotions');
      setEmotions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch emotion history');
      console.error('Error fetching emotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy':
        return <SentimentSatisfied sx={{ color: '#4caf50' }} />;
      case 'sad':
        return <SentimentDissatisfied sx={{ color: '#2196f3' }} />;
      case 'angry':
        return <SentimentVeryDissatisfied sx={{ color: '#f44336' }} />;
      case 'normal':
        return <SentimentNeutral sx={{ color: '#ff9800' }} />;
      default:
        return <SentimentNeutral sx={{ color: '#9e9e9e' }} />;
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <History sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Recent Detections
          </Typography>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert severity="error" size="small">
            {error}
          </Alert>
        )}

        {!loading && !error && emotions.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No emotions detected yet. Start by capturing a photo!
          </Typography>
        )}

        {!loading && !error && emotions.length > 0 && (
          <List dense>
            {emotions.map((emotion, index) => (
              <React.Fragment key={emotion._id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getEmotionIcon(emotion.emotion)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={emotion.emotion}
                          size="small"
                          color={getEmotionColor(emotion.emotion)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {(emotion.confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <AccessTime sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(emotion.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < emotions.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {emotions.length > 0 && (
          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Showing last {emotions.length} detection{emotions.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionHistory;