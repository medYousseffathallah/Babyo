# Baby Monitor Tracking Solution

## Overview

This solution adds real-time object tracking to the Baby Monitor application to improve the accuracy and stability of bounding boxes. It uses OpenCV's KCF (Kernelized Correlation Filters) tracker to maintain consistent tracking between frames, even when the detection model doesn't provide new predictions.

## How It Works

1. The main Node.js server continues to handle emotion detection using the Roboflow API.
2. A new Python Flask server runs alongside it to provide tracking capabilities.
3. When new predictions come from Roboflow, they initialize or reset the tracker.
4. Between Roboflow predictions, the tracker follows the detected object across frames.
5. The Node.js server includes a proxy endpoint that forwards tracking requests to the Python service.

## Components

- `tracker.py`: Python Flask server that implements the OpenCV tracking algorithm
- `requirements.txt`: Python dependencies for the tracking service
- `start.bat`: Batch file to start both servers simultaneously

## Requirements

- Python 3.7 or higher
- Node.js 14 or higher
- OpenCV Python bindings
- Flask and Flask-CORS

## Installation

1. Make sure you have both Node.js and Python installed on your system.
2. Run `npm install` to install Node.js dependencies.
3. Run `pip install -r requirements.txt` to install Python dependencies.

## Running the Application

Use the provided `start.bat` file to start both servers:

```
start.bat
```

This will:
1. Install Python dependencies if needed
2. Start the Python tracking service on port 5001
3. Start the Node.js server on port 5000

## Troubleshooting

### Tracking Service Not Starting

If the tracking service fails to start:

1. Check that Python and pip are installed and in your PATH
2. Try running `python tracker.py` manually to see any error messages
3. Ensure port 5001 is not in use by another application

### Tracking Not Working

If tracking is not working properly:

1. Check the browser console for error messages
2. Verify that both servers are running
3. Try restarting both servers
4. Ensure your webcam is providing clear, well-lit video

## Fallback Mechanism

The application includes a fallback mechanism that will use the original Roboflow predictions if the tracking service is unavailable. This ensures the application continues to function even if the tracking service fails.

## Technical Details

### Tracking Algorithm

The solution uses OpenCV's KCF (Kernelized Correlation Filters) tracker, which provides a good balance between accuracy and performance. Other trackers that could be used include:

- CSRT: More accurate but slower
- MedianFlow: Good for predictable motion
- MOSSE: Fastest but less accurate

### Coordinate Transformation

The tracking service handles coordinate transformation between:

1. Roboflow's normalized coordinates (0-1 range with center point)
2. OpenCV's pixel coordinates (absolute pixels with top-left corner)
3. Display coordinates (scaled to the video element size)

### Performance Considerations

The tracking service is designed to be lightweight, but processing video frames can be CPU-intensive. If you experience performance issues:

1. Consider reducing the video resolution
2. Decrease the detection frequency
3. Use a more efficient tracking algorithm like MOSSE