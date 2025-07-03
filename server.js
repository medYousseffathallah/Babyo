const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
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
  advice: String
});

const Emotion = mongoose.model('Emotion', emotionSchema);

// Routes

// Emotion detection endpoint
app.post('/api/detect-emotion', upload.single('image'), async (req, res) => {
  try {
    const { imageData } = req.body;
    
    // Here you'll integrate with your AI model
    // For now, we'll simulate the response
    const mockEmotions = ['happy', 'sad', 'angry', 'normal'];
    const detectedEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
    const confidence = Math.random() * 0.4 + 0.6; // Random confidence between 0.6-1.0
    
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
      timestamp: emotionRecord.timestamp
    });
  } catch (error) {
    console.error('Error detecting emotion:', error);
    res.status(500).json({ error: 'Failed to detect emotion' });
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
});

module.exports = app;