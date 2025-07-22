import cv2
import numpy as np
import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('BabyTracker')

app = Flask(__name__)
CORS(app)

# Global tracker state
class TrackerState:
    def __init__(self):
        self.tracker = None
        self.last_bbox = None
        self.last_prediction = None
        self.last_update_time = 0
        self.tracking_initialized = False
        self.reset_counter = 0

# Create tracker state
tracker_state = TrackerState()

# Function to create a new tracker
def create_tracker():
    # CSRT tracker provides better accuracy but slower
    # KCF tracker is faster but less accurate
    # MedianFlow is good for predictable motion
    return cv2.legacy.TrackerKCF_create()

# Function to decode base64 image
def decode_image(base64_string):
    # Remove data URL prefix if present
    if 'base64,' in base64_string:
        base64_string = base64_string.split('base64,')[1]
    
    # Decode base64 string to image
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# Function to convert Roboflow bounding box to OpenCV format
def roboflow_to_opencv_bbox(prediction, img_width, img_height):
    # Roboflow provides center coordinates (x, y) and dimensions (width, height)
    # OpenCV tracker expects (x, y, width, height) where (x, y) is the top-left corner
    x_center = prediction['x']
    y_center = prediction['y']
    width = prediction['width']
    height = prediction['height']
    
    # Convert center coordinates to top-left corner
    x = int((x_center - width / 2) * img_width)
    y = int((y_center - height / 2) * img_height)
    w = int(width * img_width)
    h = int(height * img_height)
    
    # Ensure coordinates are within image bounds
    x = max(0, min(x, img_width - 1))
    y = max(0, min(y, img_height - 1))
    w = max(1, min(w, img_width - x))
    h = max(1, min(h, img_height - y))
    
    return (x, y, w, h)

# Function to convert OpenCV bounding box to Roboflow format
def opencv_to_roboflow_bbox(bbox, img_width, img_height):
    x, y, w, h = bbox
    
    # Convert top-left corner to center coordinates
    x_center = (x + w / 2) / img_width
    y_center = (y + h / 2) / img_height
    width = w / img_width
    height = h / img_height
    
    return {
        'x': x_center,
        'y': y_center,
        'width': width,
        'height': height
    }

@app.route('/api/track', methods=['POST'])
def track():
    try:
        data = request.json
        image_base64 = data.get('image')
        predictions = data.get('predictions', [])
        reset_tracking = data.get('reset', False)
        
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode the image
        img = decode_image(image_base64)
        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        img_height, img_width = img.shape[:2]
        current_time = time.time()
        
        # If we received new predictions from Roboflow or need to reset tracking
        if reset_tracking or (predictions and len(predictions) > 0):
            logger.info(f"Resetting tracker with new predictions: {len(predictions)} items")
            
            # Reset the tracker
            tracker_state.tracker = create_tracker()
            tracker_state.tracking_initialized = False
            tracker_state.reset_counter += 1
            
            # Use the prediction with highest confidence
            if predictions:
                # Sort predictions by confidence (highest first)
                sorted_predictions = sorted(predictions, key=lambda x: x.get('confidence', 0), reverse=True)
                tracker_state.last_prediction = sorted_predictions[0]
                
                # Convert Roboflow bbox to OpenCV format
                bbox = roboflow_to_opencv_bbox(tracker_state.last_prediction, img_width, img_height)
                
                # Initialize tracker with new bbox
                success = tracker_state.tracker.init(img, bbox)
                if success:
                    tracker_state.last_bbox = bbox
                    tracker_state.tracking_initialized = True
                    tracker_state.last_update_time = current_time
                    logger.info(f"Tracker initialized with bbox: {bbox}")
                else:
                    logger.error("Failed to initialize tracker")
                    return jsonify({
                        'tracked': False,
                        'error': 'Failed to initialize tracker',
                        'predictions': predictions
                    })
        
        # If tracker is initialized, update it with the new frame
        tracked_predictions = []
        if tracker_state.tracking_initialized:
            # Update tracker
            success, bbox = tracker_state.tracker.update(img)
            
            if success:
                tracker_state.last_bbox = bbox
                tracker_state.last_update_time = current_time
                
                # Convert OpenCV bbox back to Roboflow format
                tracked_bbox = opencv_to_roboflow_bbox(bbox, img_width, img_height)
                
                # Create a tracked prediction using the last known class and confidence
                if tracker_state.last_prediction:
                    tracked_prediction = {
                        'x': tracked_bbox['x'],
                        'y': tracked_bbox['y'],
                        'width': tracked_bbox['width'],
                        'height': tracked_bbox['height'],
                        'class': tracker_state.last_prediction.get('class', 'unknown'),
                        'confidence': tracker_state.last_prediction.get('confidence', 1.0),
                        'tracked': True
                    }
                    tracked_predictions.append(tracked_prediction)
                    logger.info(f"Tracked object at: {bbox}")
            else:
                logger.warning("Tracking failed, waiting for new predictions")
                tracker_state.tracking_initialized = False
        
        # If we have new predictions but tracking failed, return the original predictions
        if not tracked_predictions and predictions:
            tracked_predictions = predictions
            logger.info("Using original predictions as tracking failed")
        
        # Return the tracking results
        return jsonify({
            'tracked': len(tracked_predictions) > 0,
            'predictions': tracked_predictions,
            'image_info': {
                'width': img_width,
                'height': img_height
            },
            'tracker_info': {
                'initialized': tracker_state.tracking_initialized,
                'reset_count': tracker_state.reset_counter,
                'last_update': tracker_state.last_update_time
            }
        })
    
    except Exception as e:
        logger.exception(f"Error in tracking: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'running',
        'tracker_initialized': tracker_state.tracking_initialized,
        'reset_count': tracker_state.reset_counter,
        'last_update_time': tracker_state.last_update_time
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)