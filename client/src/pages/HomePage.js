import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Rating,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  Psychology,
  TrendingUp,
  Security,
  Speed,
  CloudUpload,
  Dashboard,
  Assessment,
  VideoCall,
  Timeline,
  FavoriteOutlined,
  ArrowForward,
  ChildCare,
  Favorite,
  Shield,
  Analytics,
  AutoAwesome
} from '@mui/icons-material';
import Navigation from '../components/Navigation';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <VideoCall sx={{ fontSize: 40, color: '#8AAAE5' }} />,
      emoji: '🎥',
      title: 'Real-time Detection',
      description: 'Monitor your baby\'s emotions instantly through live video feed',
      hoverDescription: 'Get instant alerts when your baby needs attention'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#F7CFE2' }} />,
      emoji: '🧠',
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms detect emotional states accurately',
      hoverDescription: 'Our AI understands subtle facial expressions and cues'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#E8D5FF' }} />,
      emoji: '📊',
      title: 'Emotion Tracking',
      description: 'Track emotional patterns and get insights over time',
      hoverDescription: 'Discover patterns in your baby\'s emotional development'
    },
    {
      icon: <Shield sx={{ fontSize: 40, color: '#A8E6CF' }} />,
      emoji: '🔒',
      title: 'Privacy First',
      description: 'Your data stays secure with end-to-end encryption',
      hoverDescription: 'Your baby\'s data never leaves your device'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'New Mom',
      rating: 5,
      comment: 'This app helped me understand my baby\'s needs better. Highly recommended!'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Pediatrician',
      rating: 5,
      comment: 'A valuable tool for parents to monitor their baby\'s emotional well-being.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Mother of Two',
      rating: 4,
      comment: 'Great insights into my baby\'s emotional patterns throughout the day.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #8AAAE5 0%, #F7CFE2 50%, #E8D5FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Navigation />
      {/* Floating Baby Elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '3rem',
        opacity: 0.3,
        animation: 'float 6s ease-in-out infinite'
      }}>
        🍼
      </Box>
      <Box sx={{
        position: 'absolute',
        top: '60%',
        left: '3%',
        fontSize: '2.5rem',
        opacity: 0.3,
        animation: 'float 8s ease-in-out infinite reverse'
      }}>
        🧸
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        fontSize: '2rem',
        opacity: 0.3,
        animation: 'float 7s ease-in-out infinite'
      }}>
        ⭐
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box textAlign={{ xs: 'center', md: 'left' }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Know what your baby feels, instantly 👶💕
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  mb: 4,
                  fontWeight: 300,
                  lineHeight: 1.4
                }}
              >
                Advanced AI technology to detect and understand your baby's emotions in real-time
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ChildCare />}
                  onClick={() => navigate('/live')}
                  sx={{
                    bgcolor: 'white',
                    color: '#8AAAE5',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🎥 Start Monitoring
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/live')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  ✨ Interactive Demo
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', position: 'relative' }}>
              {/* Hero Illustration */}
              <Box sx={{
                width: '100%',
                maxWidth: 400,
                height: 300,
                mx: 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                👶
                {/* Emotion Bubbles */}
                <Box sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  fontSize: '2rem',
                  animation: 'bounce 2s ease-in-out infinite'
                }}>
                  😊
                </Box>
                <Box sx={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '15%',
                  fontSize: '1.5rem',
                  animation: 'bounce 2s ease-in-out infinite 0.5s'
                }}>
                  😴
                </Box>
                <Box sx={{
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  fontSize: '1.8rem',
                  animation: 'bounce 2s ease-in-out infinite 1s'
                }}>
                  🥰
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Add CSS animations */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ color: 'white', mb: 6, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          How It Works ✨
        </Typography>
        
        {/* Flow Timeline */}
        <Box sx={{ position: 'relative', mb: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🎥</Box>
                <VideoCall sx={{ fontSize: 40, color: '#8AAAE5', mb: 2 }} />
                <Chip 
                  label="STEP 1" 
                  size="small" 
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#8AAAE5', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                  📹 Video Input
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Use your device's camera or upload a video of your precious little one
                </Typography>
              </Paper>
            </Grid>
            
            {/* Flow Arrow 1 */}
            <Grid size={{ xs: 12, md: 1 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ textAlign: 'center' }}>
                <ArrowForward sx={{ 
                  fontSize: 40, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🧠</Box>
                <AutoAwesome sx={{ fontSize: 40, color: '#F7CFE2', mb: 2 }} />
                <Chip 
                  label="STEP 2" 
                  size="small" 
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#F7CFE2', 
                    color: '#333',
                    fontWeight: 'bold'
                  }} 
                />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                  🤖 AI Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Our smart AI analyzes facial expressions and subtle cues
                </Typography>
              </Paper>
            </Grid>
            
            {/* Flow Arrow 2 */}
            <Grid size={{ xs: 12, md: 1 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ textAlign: 'center' }}>
                <ArrowForward sx={{ 
                  fontSize: 40, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'pulse 2s ease-in-out infinite 0.5s'
                }} />
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ fontSize: '4rem', mb: 2 }}>💝</Box>
                <Favorite sx={{ fontSize: 40, color: '#E8D5FF', mb: 2 }} />
                <Chip 
                  label="STEP 3" 
                  size="small" 
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#E8D5FF', 
                    color: '#333',
                    fontWeight: 'bold'
                  }} 
                />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                  💡 Smart Insights
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Get instant emotion detection and personalized care tips
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      {/* Add pulse animation */}
      <style jsx="true">{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ color: 'white', mb: 6, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          Amazing Features 🌟
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transformStyle: 'preserve-3d',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px) rotateX(5deg)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    '& .feature-front': {
                      opacity: 0,
                      transform: 'rotateY(-180deg)'
                    },
                    '& .feature-back': {
                      opacity: 1,
                      transform: 'rotateY(0deg)'
                    }
                  }
                }}
              >
                {/* Front Side */}
                <CardContent 
                  className="feature-front"
                  sx={{ 
                    p: 4,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transition: 'all 0.6s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ fontSize: '4rem', mb: 2 }}>
                    {feature.emoji}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
                
                {/* Back Side */}
                <CardContent 
                  className="feature-back"
                  sx={{ 
                    p: 4,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transition: 'all 0.6s ease',
                    opacity: 0,
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${feature.icon.props.sx.color} 0%, rgba(255, 255, 255, 0.9) 100%)`
                  }}
                >
                  <Box sx={{ fontSize: '3rem', mb: 3 }}>
                    {feature.emoji}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, textAlign: 'center' }}>
                    {feature.hoverDescription}
                  </Typography>
                  <Box sx={{ mt: 2, fontSize: '1.5rem' }}>
                    ✨
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ color: 'white', mb: 6, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          What Parents Say 💕
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: index === 0 ? '#8AAAE5' : index === 1 ? '#F7CFE2' : '#E8D5FF', 
                      mr: 2,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem',
                      color: index === 1 ? '#333' : 'white'
                    }}>
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role} 👶
                      </Typography>
                    </Box>
                  </Box>
                  <Rating 
                    value={testimonial.rating} 
                    readOnly 
                    sx={{ 
                      mb: 3,
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700'
                      }
                    }} 
                  />
                  <Typography variant="body1" color="text.secondary" sx={{ 
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    position: 'relative',
                    '&:before': {
                      content: '"💬"',
                      position: 'absolute',
                      left: -20,
                      top: -5,
                      fontSize: '1.2rem'
                    }
                  }}>
                    "{testimonial.comment}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Paper
          elevation={8}
          sx={{
            p: 6,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(138, 170, 229, 0.1) 50%, transparent 70%)',
              animation: 'shimmer 3s ease-in-out infinite'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>👶💕</Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#8AAAE5' }}>
              Ready to understand your baby better?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Join thousands of loving parents who trust our AI-powered emotion detection to better care for their little ones
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ChildCare />}
                onClick={() => navigate('/live')}
                sx={{
                  bgcolor: '#8AAAE5',
                  px: 5,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  boxShadow: '0 6px 25px rgba(138, 170, 229, 0.4)',
                  '&:hover': {
                    bgcolor: '#6B8DD6',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 30px rgba(138, 170, 229, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                🚀 Get Started Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/live')}
                sx={{
                  borderColor: '#F7CFE2',
                  color: '#8AAAE5',
                  px: 5,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#F4B8D4',
                    bgcolor: 'rgba(247, 207, 226, 0.1)',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                🎬 Watch Demo
              </Button>
              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/pwa-test')}
                sx={{
                  color: '#8AAAE5',
                  px: 3,
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  '&:hover': {
                    bgcolor: 'rgba(138, 170, 229, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                📱 Test PWA Features
              </Button>
            </Box>
            <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', fontStyle: 'italic' }}>
              ✨ Free to try • No credit card required • Privacy guaranteed
            </Typography>
          </Box>
        </Paper>
      </Container>
      
      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Disclaimer */}
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          * This application is not a medical diagnosis tool. Please consult with healthcare professionals for medical concerns.
        </Typography>
      </Container>
    </Box>
  );
};

export default HomePage;