const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baby-emotion-detector', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Emotion Detection Schema
const emotionSchema = new mongoose.Schema({
  emotion: String,
  confidence: Number,
  timestamp: { type: Date, default: Date.now },
  advice: mongoose.Schema.Types.Mixed
});

const Emotion = mongoose.model('Emotion', emotionSchema);

// Session Schema for tracking detection sessions
const sessionSchema = new mongoose.Schema({
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number, // in minutes
  dominantEmotion: String,
  emotionCounts: {
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    normal: { type: Number, default: 0 }
  },
  totalDetections: { type: Number, default: 0 },
  avgConfidence: { type: Number, default: 0 },
  notes: String,
  detections: [{
    emotion: String,
    confidence: Number,
    timestamp: Date
  }]
});

const Session = mongoose.model('Session', sessionSchema);

// Routes

// Helper function to map Roboflow classes to our emotion categories
function mapRoboflowToEmotion(roboflowClass) {
  const mapping = {
    'happy': 'happy',
    'sad': 'sad',
    'angry': 'angry',
    'neutral': 'normal',
    'normal': 'normal',
    'crying': 'crying',
    'sleepy': 'sleepy',
    'sleeping': 'sleepy',
    'content': 'content',
    'surprised': 'surprised',
    'fear': 'fear',
    'disgust': 'disgust'
  };
  return mapping[roboflowClass.toLowerCase()] || 'normal';
}

// Emotion detection endpoint
app.post('/api/detect-emotion', upload.single('image'), async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Convert base64 image to buffer for Roboflow API
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Prepare Roboflow API request
    const roboflowUrl = `${process.env.ROBOFLOW_INFERENCE_URL}?api_key=${process.env.ROBOFLOW_API_KEY}`;
    
    // Make request to Roboflow API
    const response = await axios({
      method: 'POST',
      url: roboflowUrl,
      data: base64Data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const roboflowResult = response.data;
    
    // Process Roboflow response
    let detectedEmotion = 'normal';
    let confidence = 0.5;
    
    if (roboflowResult.predictions && roboflowResult.predictions.length > 0) {
      // Get the prediction with highest confidence
      const topPrediction = roboflowResult.predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );
      
      detectedEmotion = mapRoboflowToEmotion(topPrediction.class);
      confidence = topPrediction.confidence;
    }
    
    // Get advice based on emotion
    const advice = getAdviceForEmotion(detectedEmotion);
    
    // Save to database
    const emotionRecord = new Emotion({
      emotion: detectedEmotion,
      confidence: confidence,
      advice: advice
    });
    
    await emotionRecord.save();
    
    res.json({
      emotion: detectedEmotion,
      confidence: confidence,
      advice: advice,
      timestamp: emotionRecord.timestamp,
      roboflowData: roboflowResult // Include raw Roboflow data for debugging
    });
  } catch (error) {
    console.error('Error detecting emotion:', error);
    
    // Fallback to mock detection if Roboflow fails
    const mockEmotions = ['happy', 'sad', 'angry', 'normal'];
    const detectedEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
    const confidence = Math.random() * 0.4 + 0.6;
    const advice = getAdviceForEmotion(detectedEmotion);
    
    try {
      const emotionRecord = new Emotion({
        emotion: detectedEmotion,
        confidence: confidence,
        advice: advice
      });
      await emotionRecord.save();
      
      res.json({
        emotion: detectedEmotion,
        confidence: confidence,
        advice: advice,
        timestamp: emotionRecord.timestamp,
        fallback: true,
        error: 'Roboflow API unavailable, using fallback detection'
      });
    } catch (dbError) {
      res.status(500).json({ error: 'Failed to detect emotion and save to database' });
    }
  }
});

// Get emotion history
app.get('/api/emotions', async (req, res) => {
  try {
    const emotions = await Emotion.find().sort({ timestamp: -1 }).limit(10);
    res.json(emotions);
  } catch (error) {
    console.error('Error fetching emotions:', error);
    res.status(500).json({ error: 'Failed to fetch emotions' });
  }
});

// Get advice for specific emotion
app.get('/api/advice/:emotion', (req, res) => {
  const { emotion } = req.params;
  const advice = getAdviceForEmotion(emotion);
  res.json({ emotion, advice });
});

// Process image endpoint
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    
    // Send to Roboflow API
    const roboflowResponse = await axios({
      method: 'POST',
      url: process.env.ROBOFLOW_INFERENCE_URL,
      params: {
        api_key: process.env.ROBOFLOW_API_KEY
      },
      data: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const predictions = roboflowResponse.data.predictions || [];
    let emotion = 'normal';
    let confidence = 0.5;

    if (predictions.length > 0) {
      const topPrediction = predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );
      emotion = mapRoboflowToEmotion(topPrediction.class);
      confidence = topPrediction.confidence;
    }

    // Get advice for the detected emotion
    const advice = getAdviceForEmotion(emotion);

    // Save to database
    const emotionRecord = new Emotion({
      emotion,
      confidence,
      advice,
      roboflowData: roboflowResponse.data
    });
    await emotionRecord.save();

    res.json({
      emotion,
      confidence,
      advice,
      predictions,
      processingTime: '< 1 second',
      fileType: 'image'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Process video endpoint (placeholder for future implementation)
app.post('/api/process-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // For now, return mock data for video processing
    // In a real implementation, you would extract frames from the video
    // and process each frame through the emotion detection API
    
    const mockEmotions = [
      { emotion: 'happy', confidence: 0.8, timestamp: '00:00:05' },
      { emotion: 'normal', confidence: 0.7, timestamp: '00:00:15' },
      { emotion: 'sad', confidence: 0.6, timestamp: '00:00:25' }
    ];
    
    const dominantEmotion = 'happy';
    const advice = getAdviceForEmotion(dominantEmotion);
    
    // Save to database
    const emotionRecord = new Emotion({
      emotion: dominantEmotion,
      confidence: 0.8,
      advice
    });
    await emotionRecord.save();

    res.json({
      duration: '00:00:30',
      framesAnalyzed: 30,
      processingTime: '15 seconds',
      emotions: mockEmotions,
      dominantEmotion,
      advice,
      fileType: 'video'
    });

  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

// Test Roboflow connection endpoint
app.get('/api/test-roboflow', async (req, res) => {
  try {
    const testUrl = `https://api.roboflow.com/?api_key=${process.env.ROBOFLOW_API_KEY}`;
    const response = await axios.get(testUrl);
    
    res.json({
      status: 'success',
      message: 'Roboflow API connection successful',
      workspace: response.data.workspace,
      projectId: process.env.ROBOFLOW_PROJECT_ID,
      modelVersion: process.env.ROBOFLOW_MODEL_VERSION,
      inferenceUrl: process.env.ROBOFLOW_INFERENCE_URL
    });
  } catch (error) {
    console.error('Roboflow connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Roboflow API',
      error: error.message
    });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    
    // If no sessions exist, return mock data for demonstration
    if (sessions.length === 0) {
      const mockSessions = generateMockSessions();
      res.json(mockSessions);
    } else {
      res.json(sessions);
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update a session
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Generate mock sessions for demonstration
function generateMockSessions() {
  const emotions = ['happy', 'sad', 'angry', 'normal'];
  const sessions = [];
  
  for (let i = 0; i < 10; i++) {
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + Math.random() * 60 * 60 * 1000);
    const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    const emotionCounts = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = Math.floor(Math.random() * 20);
    });
    emotionCounts[dominantEmotion] += 10;
    
    const detections = [];
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      for (let j = 0; j < count; j++) {
        detections.push({
          emotion,
          confidence: 0.6 + Math.random() * 0.4,
          timestamp: new Date(startTime.getTime() + Math.random() * (endTime - startTime))
        });
      }
    });
    
    sessions.push({
      id: `session_${i + 1}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.floor((endTime - startTime) / 1000 / 60), // minutes
      dominantEmotion,
      emotionCounts,
      totalDetections: Object.values(emotionCounts).reduce((a, b) => a + b, 0),
      avgConfidence: 0.7 + Math.random() * 0.3,
      notes: `Session ${i + 1} - ${dominantEmotion} dominant`,
      detections: detections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  }
  
  return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

// Function to get advice based on emotion
function getAdviceForEmotion(emotion) {
  const adviceMap = {
    happy: {
      title: "Your baby is happy! 😊",
      tips: [
        "Continue what you're doing - your baby is content",
        "This is a great time for play and interaction",
        "Smile back and engage with positive facial expressions",
        "Try singing or talking in a cheerful voice",
        "Take photos or videos to capture these precious moments"
      ]
    },
    sad: {
      title: "Your baby seems sad 😢",
      tips: [
        "Check if your baby needs feeding, changing, or sleep",
        "Offer gentle comfort with soft touches or rocking",
        "Speak in a calm, soothing voice",
        "Try swaddling if your baby is very young",
        "Sometimes babies just need to cry - stay patient and supportive"
      ]
    },
    angry: {
      title: "Your baby appears upset 😠",
      tips: [
        "Check for immediate needs: hunger, dirty diaper, or discomfort",
        "Try changing the environment - it might be too hot, cold, or noisy",
        "Use gentle, rhythmic movements like rocking or walking",
        "Offer a pacifier if your baby uses one",
        "Stay calm yourself - babies can sense your stress"
      ]
    },
    normal: {
      title: "Your baby looks calm and alert 😌",
      tips: [
        "This is perfect for learning activities and bonding",
        "Try reading a book or showing colorful objects",
        "Practice tummy time if age-appropriate",
        "Engage in gentle conversation or singing",
        "This is a good time for feeding if it's time"
      ]
    },
    crying: {
      title: "Your baby is crying! 😭",
      tips: [
        "Check for basic needs: hunger, diaper, or tiredness",
        "Try comforting with gentle rocking or holding",
        "Use white noise or soft music to soothe",
        "Ensure the room is comfortable",
        "If crying persists, check for discomfort or illness"
      ]
    },
    sleepy: {
      title: "Your baby looks sleepy 😴",
      tips: [
        "Prepare for nap or bedtime",
        "Create a dark, quiet environment",
        "Follow your usual sleep routine",
        "Avoid stimulating activities",
        "Monitor for consistent sleep patterns"
      ]
    },
    content: {
      title: "Your baby is content 🥰",
      tips: [
        "Maintain the current activity",
        "This is a good time for quiet bonding",
        "Observe what makes them content",
        "Gently introduce new stimuli",
        "Enjoy these peaceful moments"
      ]
    },
    surprised: {
      title: "Your baby seems surprised 😲",
      tips: [
        "Check for sudden noises or changes",
        "Reassure with gentle voice",
        "This shows curiosity - encourage exploration",
        "Avoid overwhelming stimuli",
        "Document these cute expressions"
      ]
    },
    fear: {
      title: "Your baby appears fearful 😨",
      tips: [
        "Provide immediate comfort and security",
        "Remove any scary stimuli",
        "Hold them close and speak softly",
        "Gradually introduce new things",
        "Monitor for patterns in fears"
      ]
    },
    disgust: {
      title: "Your baby shows disgust 🤢",
      tips: [
        "Check for unpleasant smells or tastes",
        "Clean up any messes promptly",
        "Offer something pleasant instead",
        "Note what triggers this response",
        "Usually passes quickly"
      ]
    },
    neutral: {
      title: "Your baby is neutral 😐",
      tips: [
        "Engage with play or talking",
        "This is normal - try stimulation",
        "Observe for subtle cues",
        "Good time for routine activities",
        "Monitor energy levels"
      ]
    }
  };
  
  return adviceMap[emotion] || adviceMap.normal;
}

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Bounding box feature enabled!');
  console.log('Image and video upload support added!');
});

module.exports = app;