import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  PlayArrow,
  Stop,
  Refresh,
  PhotoCamera
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Navigation from '../components/Navigation';
import AdvicePage from './AdvicePage';
import ObjectTracker from '../objectTracker';


const LiveDetectionPage = () => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  // Initialize object tracker
  const trackerRef = useRef(new ObjectTracker());


  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emotionLog, setEmotionLog] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  

  

  // Camera constraints for better compatibility
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Draw bounding boxes on canvas overlay
  const drawBoundingBoxes = useCallback((predictions, imageInfo) => {
    console.log('=== drawBoundingBoxes called ===');
    console.log('Predictions:', predictions);
    console.log('ImageInfo:', imageInfo);
    
    if (!canvasRef.current || !webcamRef.current) {
      console.log('Early return - missing canvas or webcam');
      return;
    }

    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    const ctx = canvas.getContext('2d');

    // Always clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!predictions || predictions.length === 0) {
      console.log('No predictions - canvas cleared');
      return;
    }

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready yet');
      return;
    }

    // Wait for video to be fully loaded
    if (video.readyState < 2) {
      console.log('Video not loaded yet, retrying...');
      setTimeout(() => drawBoundingBoxes(predictions, imageInfo), 100);
      return;
    }

    // Get the actual displayed dimensions of the video element
    const videoRect = video.getBoundingClientRect();
    const displayWidth = Math.round(videoRect.width);
    const displayHeight = Math.round(videoRect.height);
    
    console.log('Video info:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      displayWidth,
      displayHeight,
      readyState: video.readyState
    });

  // Always ensure canvas matches the current video display size
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  console.log('Canvas dimensions set to:', { width: displayWidth, height: displayHeight });

  // Clear again after resize
  ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use the original image dimensions from Roboflow
    // Roboflow sends coordinates based on the original image size it processed
    const originalWidth = imageInfo?.width || video.videoWidth;
    const originalHeight = imageInfo?.height || video.videoHeight;
    
    console.log('Coordinate system info:', {
      originalWidth,
      originalHeight,
      displayWidth,
      displayHeight
    });

    predictions.forEach((prediction, index) => {
      console.log(`\n--- Processing prediction ${index} ---`);
      console.log('Raw prediction:', prediction);
      
      const { x, y, width, height, class: className, confidence } = prediction;
      
      // Skip low confidence predictions
      if (confidence < 0.6) return;
      
      let pixelX = x;
      let pixelY = y;
      let pixelWidth = width;
      let pixelHeight = height;
      
      // Check if coordinates are normalized (0-1 range)
      if (x <= 1 && y <= 1 && width <= 1 && height <= 1) {
        // Convert normalized to pixels
        pixelX = x * originalWidth;
        pixelY = y * originalHeight;
        pixelWidth = width * originalWidth;
        pixelHeight = height * originalHeight;
      } else {
        // Already in pixel coordinates (from tracker)
        console.log('Using pixel coordinates directly');
      }
      
      // Calculate scaling factors preserving aspect ratio
      const aspectRatioOriginal = originalWidth / originalHeight;
      const aspectRatioDisplay = displayWidth / displayHeight;
      let effectiveWidth = displayWidth;
      let effectiveHeight = displayHeight;
      let offsetX = 0;
      let offsetY = 0;
      if (aspectRatioDisplay > aspectRatioOriginal) {
        // Letterboxed horizontally
        effectiveWidth = displayHeight * aspectRatioOriginal;
        offsetX = (displayWidth - effectiveWidth) / 2;
      } else if (aspectRatioDisplay < aspectRatioOriginal) {
        // Letterboxed vertically
        effectiveHeight = displayWidth / aspectRatioOriginal;
        offsetY = (displayHeight - effectiveHeight) / 2;
      }
      const scaleX = effectiveWidth / originalWidth;
      const scaleY = effectiveHeight / originalHeight;
      
      console.log('Scale factors:', { scaleX, scaleY });
      
      // Scale the pixel coordinates to display space
      const scaledCenterX = pixelX * scaleX;
      const scaledCenterY = pixelY * scaleY;
      const scaledWidth = pixelWidth * scaleX;
      const scaledHeight = pixelHeight * scaleY;
      
      // Convert from center coordinates to top-left corner coordinates
      const x1 = offsetX + scaledCenterX - scaledWidth / 2;
      const y1 = offsetY + scaledCenterY - scaledHeight / 2;

      console.log('Coordinate transformation:', {
        original: { x: pixelX, y: pixelY, width: pixelWidth, height: pixelHeight },
        scaled: { 
          centerX: scaledCenterX, 
          centerY: scaledCenterY, 
          width: scaledWidth, 
          height: scaledHeight 
        },
        final: { x1, y1, width: scaledWidth, height: scaledHeight }
      });

      // Ensure coordinates are within canvas bounds
      const clampedX1 = Math.max(0, Math.min(x1, displayWidth - scaledWidth));
      const clampedY1 = Math.max(0, Math.min(y1, displayHeight - scaledHeight));
      const clampedWidth = Math.min(scaledWidth, displayWidth - clampedX1);
      const clampedHeight = Math.min(scaledHeight, displayHeight - clampedY1);

      console.log('Clamped coordinates:', {
        x1: clampedX1,
        y1: clampedY1,
        width: clampedWidth,
        height: clampedHeight
      });

      // Draw bounding box with different style based on tracking status
      const isTracked = prediction.missingFrames !== undefined;
      const missingFrames = prediction.missingFrames || 0;
      
      // Use different colors for detected vs tracked objects
      if (isTracked && missingFrames > 0) {
        // Object is being tracked but not directly detected
        // Fade the color based on how long it's been missing
        const opacity = Math.max(0.3, 1 - (missingFrames / 15));
        ctx.strokeStyle = `rgba(255, 165, 0, ${opacity})`; // Orange with fading opacity
      } else {
        // Object is directly detected
        ctx.strokeStyle = '#8AAAE5'; // Original blue color
      }
      
      ctx.lineWidth = 3;
      ctx.strokeRect(clampedX1, clampedY1, clampedWidth, clampedHeight);

      // Draw label background
      let label = `${className} (${Math.round(confidence * 100)}%)`;
      if (isTracked && prediction.id) {
        label += ` #${prediction.id}`; // Add tracking ID to label
      }
      ctx.font = '16px Arial';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 20;

      const labelY = clampedY1 > textHeight + 5 ? clampedY1 - textHeight - 5 : clampedY1 + clampedHeight + 5;

      ctx.fillStyle = 'rgba(138, 170, 229, 0.8)';
      ctx.fillRect(clampedX1, labelY, textWidth + 10, textHeight + 5);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, clampedX1 + 5, labelY + textHeight - 2);
      
      console.log(`✓ Drew bounding box for ${className} (${Math.round(confidence * 100)}%)`);
    });
    
    console.log('=== Finished drawing all bounding boxes ===\n');
  }, []);

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

  // Analyze emotion function - defined early to avoid hoisting issues
  const analyzeEmotion = useCallback(async (imageData) => {
    console.log('Analyzing new frame');
    setLoading(true);
    setError('');
    
    try {
      // Get emotion detection from the server
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
      console.log('Full API response:', result);
      const newEmotion = {
        ...result,
        timestamp: new Date().toISOString()
      };
      
      setEmotion(newEmotion);
      
      // Store predictions for bounding box drawing
      console.log('Full result:', result);
      
      let localPredictions = [];
      let localImageInfo = null;
      
      if (result && result.roboflowData && result.roboflowData.predictions) {
        console.log('Raw predictions:', result.roboflowData.predictions);
        console.log('Image info:', {
          width: result.roboflowData.image?.width,
          height: result.roboflowData.image?.height
        });
        
        localImageInfo = result.roboflowData.image;
        
        result.roboflowData.predictions.forEach((pred, index) => {
          console.log(`Prediction ${index}:`, {
            class: pred.class,
            confidence: pred.confidence,
            x: pred.x,
            y: pred.y,
            width: pred.width,
            height: pred.height,
            coordinates_type: 'Center coordinates'
          });
        });
        
        // Update tracker with new predictions
        localPredictions = trackerRef.current.update(result.roboflowData.predictions, localImageInfo);
      } else {
        console.log('No predictions found in result');
        
        // Update tracker with no new predictions
        localPredictions = trackerRef.current.update([], localImageInfo);
      }
      
      // Update state with new predictions
      setPredictions(localPredictions);
      setLastImageInfo(localImageInfo);
      
      // Immediately draw bounding boxes
      if (canvasRef.current && webcamRef.current && webcamRef.current.video) {
        drawBoundingBoxes(localPredictions, localImageInfo);
      }
      
      if (isLiveMode) {
        setEmotionLog(prev => [...prev, newEmotion].slice(-20));
      }
      
      setShowAdvice(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLiveMode]);

  // Camera event handlers
  const handleUserMedia = () => {
    setCameraReady(true);
    setCameraError('');
    console.log('Camera access granted');
  };

  const handleUserMediaError = (error) => {
    setCameraReady(false);
    console.error('Camera access error:', error);
    
    let errorMessage = 'Camera access failed. ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Please allow camera permissions and refresh the page.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera found on this device.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage += 'Camera not supported in this browser. Try Chrome or Firefox.';
    } else if (error.name === 'NotReadableError') {
      errorMessage += 'Camera is being used by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage += 'Camera constraints not supported. Trying with basic settings.';
    } else {
      errorMessage += 'Please check your camera settings and try again.';
    }
    
    // Add HTTPS requirement note for production
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      errorMessage += ' Note: HTTPS is required for camera access in production.';
    }
    
    setCameraError(errorMessage);
  };

  const capture = useCallback(async () => {
    if (!cameraReady || !webcamRef.current) {
      setError('Camera not ready. Please ensure camera access is granted.');
      return;
    }
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        await analyzeEmotion(imageSrc);
      } else {
        setError('Failed to capture image. Please try again.');
      }
    } catch (err) {
      setError('Error capturing image: ' + err.message);
    }
  }, [webcamRef, cameraReady, analyzeEmotion]);

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    try {
      const response = await fetch('http://localhost:5002/detect_emotion', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({image: imageSrc.split(',')[1]})
      });
      if (!response.ok) throw new Error('Failed to detect emotion');
      const data = await response.json();
      const mainEmotion = data.classes_detectees[0] || 'neutral';
      const maxConfidence = data.predictions.length > 0 ? Math.max(...data.predictions.map(p => p.confidence)) : 0;
      setEmotion({
        emotion: mainEmotion,
        confidence: maxConfidence,
        predictions: data.predictions,
        timestamp: data.timestamp
      });
      setPredictions(data.predictions);
      setLastImageInfo(data.image);
      if (canvasRef.current && webcamRef.current.video) {
        drawBoundingBoxes(data.predictions, data.image);
      }
      if (isLiveMode) {
        setEmotionLog(prev => [...prev, {emotion: mainEmotion, confidence: maxConfidence, timestamp: data.timestamp}].slice(-20));
      }
    } catch (err) {
      setError(err.message);
    }
  }, [isLiveMode]);

  const startLiveDetection = () => {
    setIsLiveMode(true);
    setError('');
    intervalRef.current = setInterval(async () => {
  console.log('Interval firing, starting new analysis');
  if (!webcamRef.current) return;
  const imageSrc = webcamRef.current.getScreenshot();
  if (imageSrc) await analyzeEmotion(imageSrc);
}, 500);
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
    setPredictions([]);
    setLastImageInfo(null);
    
    // Reset the tracker
    trackerRef.current.reset();
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    if (isLiveMode) {
      stopLiveDetection();
    }
  };

  // Store the last image info for redrawing
  const [lastImageInfo, setLastImageInfo] = useState(null);

  // Handle canvas resizing and redrawing
  useEffect(() => {
    const handleResize = () => {
      // Immediately redraw without setTimeout to prevent flickering
      if (canvasRef.current && webcamRef.current && webcamRef.current.video) {
        drawBoundingBoxes(predictions, lastImageInfo);
      }
    };

    // Create a ResizeObserver to watch for video element size changes
    let resizeObserver;
    if (webcamRef.current?.video) {
      resizeObserver = new ResizeObserver(() => {
        // Immediately redraw without setTimeout to prevent flickering
        if (canvasRef.current && webcamRef.current.video) {
          drawBoundingBoxes(predictions, lastImageInfo);
        }
      });
      resizeObserver.observe(webcamRef.current.video);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [predictions, drawBoundingBoxes, lastImageInfo]);

  // Redraw bounding boxes when predictions change
  useEffect(() => {
    // Immediately redraw without setTimeout to prevent flickering
    if (canvasRef.current && webcamRef.current && webcamRef.current.video) {
      drawBoundingBoxes(predictions, lastImageInfo);
    }
  }, [predictions, drawBoundingBoxes, lastImageInfo]);

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
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card elevation={3} sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,207,226,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    color: '#8AAAE5'
                  }}>
                    📹 Baby Monitor Feed
                  </Typography>
                  
                  {/* Camera Status Indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: cameraReady ? '#4CAF50' : cameraError ? '#F44336' : '#FFC107',
                      animation: cameraReady ? 'none' : 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: cameraReady ? '#4CAF50' : cameraError ? '#F44336' : '#FFC107',
                      fontWeight: 'bold'
                    }}>
                      {cameraReady ? 'Camera Ready' : cameraError ? 'Camera Error' : 'Connecting...'}
                    </Typography>
                  </Box>
                </Box>
                
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
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      onUserMedia={handleUserMedia}
                      onUserMediaError={handleUserMediaError}
                      mirrored={true}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                    
                    {/* Canvas overlay for bounding boxes */}
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    />
                  </Box>
                  
                  {/* Bounding Box Info */}
                  {predictions.length > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'rgba(138, 170, 229, 0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(138, 170, 229, 0.3)'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#8AAAE5' }}>
                        🎯 Detected Objects: {predictions.length}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {predictions.map((pred, index) => (
                          <Chip
                            key={index}
                            label={`${pred.class} (${Math.round(pred.confidence * 100)}%)`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(138, 170, 229, 0.2)',
                              color: '#8AAAE5',
                              fontWeight: 'bold'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Control Buttons */}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCamera />}
                    onClick={capture}
                    disabled={loading || isLiveMode || !cameraReady}
                    size="large"
                    title={!cameraReady ? 'Camera not ready' : 'Capture a photo for emotion analysis'}
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
                      disabled={loading || !cameraReady}
                      size="large"
                      title={!cameraReady ? 'Camera not ready' : 'Start continuous emotion monitoring'}
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

                {/* Camera Error Display */}
                {cameraError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      📷 Camera Access Issue
                    </Typography>
                    {cameraError}
                    
                    {/* Camera Setup Guide */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        💡 Quick Setup Guide:
                      </Typography>
                      <Typography variant="body2" component="div">
                        1. Click the camera icon in your browser's address bar<br/>
                        2. Select "Allow" for camera permissions<br/>
                        3. Refresh this page<br/>
                        4. If using Chrome, ensure you're on HTTPS or localhost
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => window.location.reload()}
                        sx={{ mr: 1 }}
                      >
                        🔄 Refresh Page
                      </Button>
                      <Button 
                        size="small" 
                        variant="text" 
                        onClick={() => setCameraError('')}
                      >
                        Dismiss
                      </Button>
                    </Box>
                  </Alert>
                )}

                {/* General Error Display */}
                {error && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
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
          <Grid size={{ xs: 12, lg: 4 }}>
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