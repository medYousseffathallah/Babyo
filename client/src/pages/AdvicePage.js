import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function AdvicePage({ emotion }) {
  const getAdvice = () => {
    const adviceMap = {
      happy: 'Enjoy these joyful moments with your baby! Keep interacting and smiling.',
      sad: 'Try gentle rocking, soft singing, or offering a comfort object.',
      angry: 'Check for discomfort like hunger, wet diaper, or temperature.',
      surprised: 'Maintain a calm environment to avoid overstimulation.',
      fear: 'Provide reassuring touch and verbal comfort.',
      disgust: 'Check for unpleasant textures or tastes in their environment.',
      neutral: 'Great time for learning activities or quiet play.',
      crying: 'Immediate attention needed - check basic needs and comfort.',
      sleepy: 'Create a soothing bedtime routine with dim lights.',
      content: 'Perfect time for bonding through gentle play.'
    };
    return adviceMap[emotion?.toLowerCase()] || 'Observe and respond to your baby\'s cues with loving attention.';
  };

  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      mb: 3,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,207,226,0.1) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <Typography variant="h6" sx={{ 
        color: '#8AAAE5',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        👶 Care Advice
      </Typography>
      <Box sx={{ 
        bgcolor: 'rgba(138, 170, 229, 0.1)',
        p: 2,
        borderRadius: 2,
        borderLeft: '4px solid #8AAAE5'
      }}>
        <Typography variant="body1" sx={{ color: '#333' }}>
          {getAdvice()}
        </Typography>
      </Box>
    </Paper>
  );
}