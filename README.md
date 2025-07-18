# Baby Emotion Detector 👶

A MERN stack web application that uses AI to detect baby emotions from photos or live camera feed and provides parenting advice based on the detected emotions.

## Features

- 📸 **Photo Capture**: Take photos using your device's camera
- 🎥 **Live Detection**: Real-time emotion detection from camera feed
- 🤖 **AI-Powered**: Emotion detection using AI models
- 💡 **Smart Advice**: Get personalized parenting tips based on detected emotions
- 📊 **History Tracking**: View recent emotion detections
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Supported Emotions

- 😊 **Happy**: When your baby is content and joyful
- 😢 **Sad**: When your baby needs comfort or attention
- 😠 **Angry**: When your baby is upset or frustrated
- 😌 **Normal**: When your baby is calm and alert

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- React Webcam
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Multer for file uploads

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- A modern web browser with camera access

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd baby-emotion-detector
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string if needed
   - Add your AI model API credentials when ready

## Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start both backend and frontend**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Integration

The application is designed to work with your AI emotion detection model. To integrate your AI model:

1. **Update the backend API endpoint** in `server.js`:
   ```javascript
   // Replace the mock emotion detection with your AI model API call
   app.post('/api/detect-emotion', upload.single('image'), async (req, res) => {
     // Your AI model integration code here
   });
   ```

2. **Add your API credentials** to the `.env` file:
   ```
   AI_MODEL_API_URL=your_ai_model_endpoint
   AI_MODEL_API_KEY=your_api_key
   ```

## Usage

1. **Allow camera access** when prompted by your browser
2. **Capture a photo** by clicking the "Capture Photo" button
3. **Start live detection** for continuous monitoring
4. **View results** including detected emotion and confidence level
5. **Read advice** tailored to your baby's current emotional state
6. **Check history** to see recent emotion detections

## Camera Permissions

The application requires camera access to function properly. Make sure to:
- Allow camera permissions when prompted
- Use HTTPS in production for camera access
- Ensure your device has a working camera

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Notes

- Camera access is only used locally in your browser
- No images are stored permanently on the server
- All emotion detection data is stored in your local MongoDB instance

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure you're using HTTPS (required for camera access)
- Try a different browser

### Backend Connection Issues
- Verify MongoDB is running
- Check the MongoDB connection string in `.env`
- Ensure port 5000 is not in use by another application

### Frontend Build Issues
- Clear node_modules and reinstall dependencies
- Check for any missing peer dependencies

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue in the repository.

---

**Note**: This application currently uses mock emotion detection. Replace the mock implementation with your actual AI model integration for production use.#   B a b y o  
 