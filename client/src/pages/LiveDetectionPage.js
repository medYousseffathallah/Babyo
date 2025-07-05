import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Stack
} from '@mui/material';
import {
  CameraAlt,
  PlayArrow,
  Stop,
  Refresh,
  PhotoCamera
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AdvicePage from './AdvicePage';

const LiveDetectionPage = () => {
  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [emotionLog, setEmotionLog] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Emotion emoji mapping
  const getEmotionEmoji = (emotionName) => {
    const emojiMap = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'surprised': '😲',
      'fear': '😨',
      'disgust': '🤢',
      'neutral': '😐',
      'crying': '😭',
      'sleepy': '😴',
      'content': '🥰'
    };
    return emojiMap[emotionName?.toLowerCase()] || '👶';
  };

  const getEmotionDescription = (emotionName) => {
    const descriptions = {
      'happy': 'Your little one seems joyful! 💕',
      'sad': 'Baby might need some comfort 🤗',
      'angry': 'Something might be bothering them 🍼',
      'surprised': 'Baby is curious about something! ✨',
      'fear': 'Baby seems a bit worried 💝',
      'disgust': 'Baby doesn\'t like something 🤱',
      'neutral': 'Baby is calm and peaceful 😌',
      'crying': 'Baby needs attention right now! 🚨',
      'sleepy': 'Time for a nap! 🌙',
      'content': 'Baby is feeling loved and secure 💖'
    };
    return descriptions[emotionName?.toLowerCase()] || 'Monitoring your precious baby 👶';
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      await analyzeEmotion(imageSrc);
    }
  }, [webcamRef]);

  const analyzeEmotion = async (imageData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/detect-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze emotion');
      }
      
      const result = await response.json();
      const newEmotion = {
        ...result,
        timestamp: new Date().toISOString()
      };
      
      setEmotion(newEmotion);
      
      if (isLiveMode) {
        setEmotionLog(prev => [...prev, newEmotion].slice(-20));
      }
      
      setShowAdvice(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startLiveDetection = () => {
    setIsLiveMode(true);
    setEmotionLog([]);
    intervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          analyzeEmotion(imageSrc);
        }
      }
    }, 3000);
  };

  const stopLiveDetection = () => {
    setIsLiveMode(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    setEmotion(null);
    setEmotionLog([]);
    setCapturedImage(null);
    setError('');
    setShowAdvice(false);
    if (isLiveMode) {
      stopLiveDetection();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FAFBFF 0%, #F0E6FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Baby Elements */}
      <Box sx={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        fontSize: '2rem',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }}>🍼</Box>
      <Box sx={{
        position: 'fixed',
        top: '20%',
        right: '10%',
        fontSize: '1.5rem',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite 2s',
        zIndex: 0
      }}>🧸</Box>
      <Box sx={{
        position: 'fixed',
        bottom: '15%',
        left: '8%',
        fontSize: '1.8rem',
        opacity: 0.1,
        animation: 'float 7s ease-in-out infinite 1s',
        zIndex: 0
      }}>⭐</Box>
      <Box sx={{
        position: 'fixed',
        top: '60%',
        right: '5%',
        fontSize: '1.6rem',
        opacity: 0.1,
        animation: 'float 9s ease-in-out infinite 3s',
        zIndex: 0
      }}>🌙</Box>
      <Box sx={{
        position: 'fixed',
        bottom: '25%',
        right: '15%',
        fontSize: '1.4rem',
        opacity: 0.1,
        animation: 'float 5s ease-in-out infinite 4s',
        zIndex: 0
      }}>💕</Box>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}
      </style>
      
      <Navigation />

      <Container maxWidth="xl" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 700,
              color: '#8AAAE5',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              👶 Live Emotion Detection
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', mt: 1 }}>
              Understanding your baby's feelings in real-time ✨
            </Typography>
          </Box>
          {isLiveMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label="🔴 LIVE MONITORING"
                sx={{ 
                  bgcolor: '#FFB3BA',
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                  animation: 'glow 2s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': { 
                      boxShadow: '0 0 10px rgba(255, 179, 186, 0.5)'
                    },
                    '50%': { 
                      boxShadow: '0 0 20px rgba(255, 179, 186, 0.8), 0 0 30px rgba(255, 179, 186, 0.6)'
                    }
                  }
                }}
              />
              {emotion && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ fontSize: '2rem' }}>
                    {getEmotionEmoji(emotion.emotion)}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {emotion.emotion}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Main Detection Area */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3} sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,207,226,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 600,
                  color: '#8AAAE5'
                }}>
                  📹 Baby Monitor Feed
                </Typography>
                
                {/* Camera Feed */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Box sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: isLiveMode 
                      ? '0 0 30px rgba(138, 170, 229, 0.4), 0 0 60px rgba(138, 170, 229, 0.2)'
                      : '0 8px 32px rgba(0,0,0,0.1)',
                    border: isLiveMode 
                      ? '3px solid #8AAAE5'
                      : '2px solid rgba(138, 170, 229, 0.3)',
                    animation: isLiveMode ? 'borderPulse 2s ease-in-out infinite' : 'none',
                    '@keyframes borderPulse': {
                      '0%, 100%': {
                        borderColor: '#8AAAE5',
                        boxShadow: '0 0 30px rgba(138, 170, 229, 0.4)'
                      },
                      '50%': {
                        borderColor: '#F7CFE2',
                        boxShadow: '0 0 40px rgba(247, 207, 226, 0.6), 0 0 60px rgba(138, 170, 229, 0.3)'
                      }
                    }
                  }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </Box>
                </Box>

                {/* Control Buttons */}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCamera />}
                    onClick={capture}
                    disabled={loading || isLiveMode}
                    size="large"
                    sx={{
                      bgcolor: '#8AAAE5',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 16px rgba(138, 170, 229, 0.3)',
                      '&:hover': {
                        bgcolor: '#7A9ADF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(138, 170, 229, 0.4)'
                      },
                      '&:disabled': {
                        bgcolor: '#E0E0E0'
                      }
                    }}
                  >
                    📸 Capture Moment
                  </Button>
                  
                  {!isLiveMode ? (
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={startLiveDetection}
                      disabled={loading}
                      size="large"
                      sx={{
                        bgcolor: '#F7CFE2',
                        color: '#8B5A83',
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(247, 207, 226, 0.3)',
                        '&:hover': {
                          bgcolor: '#F5C2E7',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(247, 207, 226, 0.4)'
                        },
                        '&:disabled': {
                          bgcolor: '#E0E0E0'
                        }
                      }}
                    >
                      🎥 Begin Live Detection
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<Stop />}
                      onClick={stopLiveDetection}
                      size="large"
                      sx={{
                        color: '#FF6B6B',
                        border: '2px solid #FF6B6B',
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'rgba(255, 107, 107, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 16px rgba(255, 107, 107, 0.2)'
                        }
                      }}
                    >
                      ⏹️ Stop Monitoring
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={reset}
                    disabled={loading}
                    size="large"
                    sx={{
                      color: '#8AAAE5',
                      border: '2px solid #8AAAE5',
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(138, 170, 229, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(138, 170, 229, 0.2)'
                      }
                    }}
                  >
                    🔄 Reset
                  </Button>
                </Box>

                {/* Loading State */}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress sx={{ mr: 2 }} />
                    <Typography>Analyzing emotion...</Typography>
                  </Box>
                )}

                {/* Error Display */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Current Detection Results */}
                {emotion && (
                  <Box sx={{ 
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(138, 170, 229, 0.1) 0%, rgba(247, 207, 226, 0.1) 100%)',
                    border: '2px solid rgba(138, 170, 229, 0.2)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                      animation: 'shimmer 3s ease-in-out infinite',
                      '@keyframes shimmer': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' }
                      }
                    }} />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ fontSize: '4rem', mb: 1 }}>
                        {getEmotionEmoji(emotion.emotion)}
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700,
                        color: '#8AAAE5',
                        textTransform: 'capitalize',
                        mb: 1
                      }}>
                        {emotion.emotion}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: '#8B5A83',
                        mb: 2,
                        fontStyle: 'italic'
                      }}>
                        {getEmotionDescription(emotion.emotion)}
                      </Typography>
                      <Chip
                        label={`${(emotion.confidence * 100).toFixed(1)}% Confidence`}
                        sx={{
                          bgcolor: '#F7CFE2',
                          color: '#8B5A83',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Captured Image Display */}
                {capturedImage && (
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Captured Image:
                    </Typography>
                    <img
                      src={capturedImage}
                      alt="Captured"
                      style={{
                        maxWidth: '300px',
                        width: '100%',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }}
                    />
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Advice Section */}
              {showAdvice && emotion && (
                <AdvicePage emotion={emotion.emotion} />
              )}
              
              {/* Emotion History */}
              <Card sx={{ 
                p: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,207,226,0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="h5" gutterBottom sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 600,
                  color: '#8AAAE5'
                }}>
                  📊 Emotion Timeline
                </Typography>
                
                {emotionLog.length > 0 ? (
                  <Stack spacing={2} sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                    {emotionLog.slice(-8).reverse().map((emotion, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, rgba(138, 170, 229, 0.1) 0%, rgba(247, 207, 226, 0.1) 100%)',
                          borderRadius: 3,
                          border: '1px solid rgba(138, 170, 229, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 16px rgba(138, 170, 229, 0.2)'
                          }
                        }}
                      >
                        <Box sx={{ fontSize: '2rem' }}>
                          {getEmotionEmoji(emotion.emotion)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ 
                            color: '#8AAAE5',
                            textTransform: 'capitalize'
                          }}>
                            {emotion.emotion}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#8B5A83',
                            display: 'block'
                          }}>
                            {(emotion.confidence * 100).toFixed(1)}% confidence
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(emotion.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${(emotion.confidence * 100).toFixed(0)}%`}
                          sx={{
                            bgcolor: emotion.confidence > 0.8 ? '#C8E6C9' : emotion.confidence > 0.6 ? '#FFF9C4' : '#FFCDD2',
                            color: emotion.confidence > 0.8 ? '#2E7D32' : emotion.confidence > 0.6 ? '#F57F17' : '#C62828',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                  }}>
                    <Box sx={{ fontSize: '3rem', mb: 2 }}>👶</Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      Start monitoring to see your baby's emotions here
                    </Typography>
                  </Box>
                )}
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveDetectionPage;