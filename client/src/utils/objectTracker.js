/**
 * Simple object tracker for maintaining consistent bounding boxes between detections
 */

class ObjectTracker {
  constructor() {
    this.trackedObjects = [];
    this.lastUpdateTime = 0;
    this.trackingThreshold = 0.3; // IOU threshold for considering it the same object
    this.maxTrackingAge = 2000; // Max time in ms to keep tracking without updates
  }

  /**
   * Update tracker with new predictions
   * @param {Array} predictions - Array of prediction objects from Roboflow
   * @param {number} timestamp - Current timestamp
   * @returns {Array} - Updated predictions with tracking info
   */
  update(predictions, timestamp = Date.now()) {
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      // If no new predictions, update existing tracked objects with estimated positions
      return this.updateTrackedObjectsPosition(timestamp);
    }

    // Convert predictions to internal format
    const newDetections = predictions.map(pred => ({
      id: Math.random().toString(36).substring(2, 9), // Generate random ID
      class: pred.class,
      confidence: pred.confidence,
      bbox: {
        x: pred.x,
        y: pred.y,
        width: pred.width,
        height: pred.height
      },
      lastSeen: timestamp,
      velocity: { x: 0, y: 0 },
      history: []
    }));

    // If no existing tracked objects, start tracking these new detections
    if (this.trackedObjects.length === 0) {
      this.trackedObjects = newDetections;
      this.lastUpdateTime = timestamp;
      return this.getOutputPredictions();
    }

    // Match new detections with existing tracked objects
    const matchedPairs = this.matchDetectionsWithTrackedObjects(newDetections);
    
    // Update matched tracked objects
    for (const { trackedIdx, detectionIdx } of matchedPairs) {
      const trackedObject = this.trackedObjects[trackedIdx];
      const detection = newDetections[detectionIdx];
      
      // Calculate velocity
      const dt = (timestamp - trackedObject.lastSeen) / 1000; // in seconds
      if (dt > 0) {
        trackedObject.velocity = {
          x: (detection.bbox.x - trackedObject.bbox.x) / dt,
          y: (detection.bbox.y - trackedObject.bbox.y) / dt
        };
      }
      
      // Update history
      trackedObject.history.push({
        bbox: { ...trackedObject.bbox },
        timestamp: trackedObject.lastSeen
      });
      
      // Keep history limited to last 10 positions
      if (trackedObject.history.length > 10) {
        trackedObject.history.shift();
      }
      
      // Update tracked object with new detection
      trackedObject.bbox = detection.bbox;
      trackedObject.class = detection.class;
      trackedObject.confidence = detection.confidence;
      trackedObject.lastSeen = timestamp;
    }
    
    // Find unmatched tracked objects and update their positions based on velocity
    const matchedTrackedIndices = matchedPairs.map(pair => pair.trackedIdx);
    for (let i = 0; i < this.trackedObjects.length; i++) {
      if (!matchedTrackedIndices.includes(i)) {
        const trackedObject = this.trackedObjects[i];
        
        // Only keep tracking if not too old
        if (timestamp - trackedObject.lastSeen <= this.maxTrackingAge) {
          // Update position based on velocity
          const dt = (timestamp - trackedObject.lastSeen) / 1000; // in seconds
          trackedObject.bbox.x += trackedObject.velocity.x * dt;
          trackedObject.bbox.y += trackedObject.velocity.y * dt;
          
          // Ensure coordinates stay within bounds (0-1)
          trackedObject.bbox.x = Math.max(0, Math.min(1, trackedObject.bbox.x));
          trackedObject.bbox.y = Math.max(0, Math.min(1, trackedObject.bbox.y));
        }
      }
    }
    
    // Add new detections that weren't matched
    const matchedDetectionIndices = matchedPairs.map(pair => pair.detectionIdx);
    for (let i = 0; i < newDetections.length; i++) {
      if (!matchedDetectionIndices.includes(i)) {
        this.trackedObjects.push(newDetections[i]);
      }
    }
    
    // Remove tracked objects that are too old
    this.trackedObjects = this.trackedObjects.filter(
      obj => timestamp - obj.lastSeen <= this.maxTrackingAge
    );
    
    this.lastUpdateTime = timestamp;
    return this.getOutputPredictions();
  }

  /**
   * Update tracked objects positions based on their velocity
   * @param {number} timestamp - Current timestamp
   * @returns {Array} - Updated predictions
   */
  updateTrackedObjectsPosition(timestamp = Date.now()) {
    for (const obj of this.trackedObjects) {
      // Only update if not too old
      if (timestamp - obj.lastSeen <= this.maxTrackingAge) {
        // Update position based on velocity
        const dt = (timestamp - this.lastUpdateTime) / 1000; // in seconds
        obj.bbox.x += obj.velocity.x * dt;
        obj.bbox.y += obj.velocity.y * dt;
        
        // Ensure coordinates stay within bounds (0-1)
        obj.bbox.x = Math.max(0, Math.min(1, obj.bbox.x));
        obj.bbox.y = Math.max(0, Math.min(1, obj.bbox.y));
      }
    }
    
    this.lastUpdateTime = timestamp;
    return this.getOutputPredictions();
  }

  /**
   * Match new detections with existing tracked objects using IOU
   * @param {Array} detections - New detections
   * @returns {Array} - Array of matched pairs {trackedIdx, detectionIdx}
   */
  matchDetectionsWithTrackedObjects(detections) {
    const matchedPairs = [];
    const iouMatrix = [];
    
    // Calculate IOU between each detection and tracked object
    for (let i = 0; i < this.trackedObjects.length; i++) {
      iouMatrix[i] = [];
      for (let j = 0; j < detections.length; j++) {
        iouMatrix[i][j] = this.calculateIOU(
          this.trackedObjects[i].bbox,
          detections[j].bbox
        );
      }
    }
    
    // Greedy matching - find best matches first
    while (true) {
      let maxIOU = this.trackingThreshold;
      let bestPair = null;
      
      // Find the highest IOU
      for (let i = 0; i < this.trackedObjects.length; i++) {
        for (let j = 0; j < detections.length; j++) {
          if (iouMatrix[i][j] > maxIOU) {
            maxIOU = iouMatrix[i][j];
            bestPair = { trackedIdx: i, detectionIdx: j };
          }
        }
      }
      
      // If no more matches above threshold, stop
      if (bestPair === null) break;
      
      // Add the match and remove it from consideration
      matchedPairs.push(bestPair);
      for (let i = 0; i < this.trackedObjects.length; i++) {
        iouMatrix[i][bestPair.detectionIdx] = 0;
      }
      for (let j = 0; j < detections.length; j++) {
        iouMatrix[bestPair.trackedIdx][j] = 0;
      }
    }
    
    return matchedPairs;
  }

  /**
   * Calculate Intersection over Union between two bounding boxes
   * @param {Object} bbox1 - First bounding box {x, y, width, height}
   * @param {Object} bbox2 - Second bounding box {x, y, width, height}
   * @returns {number} - IOU value between 0 and 1
   */
  calculateIOU(bbox1, bbox2) {
    // Convert from center coordinates to corners
    const box1 = {
      x1: bbox1.x - bbox1.width / 2,
      y1: bbox1.y - bbox1.height / 2,
      x2: bbox1.x + bbox1.width / 2,
      y2: bbox1.y + bbox1.height / 2
    };
    
    const box2 = {
      x1: bbox2.x - bbox2.width / 2,
      y1: bbox2.y - bbox2.height / 2,
      x2: bbox2.x + bbox2.width / 2,
      y2: bbox2.y + bbox2.height / 2
    };
    
    // Calculate intersection area
    const xOverlap = Math.max(0, Math.min(box1.x2, box2.x2) - Math.max(box1.x1, box2.x1));
    const yOverlap = Math.max(0, Math.min(box1.y2, box2.y2) - Math.max(box1.y1, box2.y1));
    const intersectionArea = xOverlap * yOverlap;
    
    // Calculate union area
    const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const box2Area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
    const unionArea = box1Area + box2Area - intersectionArea;
    
    // Return IOU
    return intersectionArea / unionArea;
  }

  /**
   * Convert tracked objects to prediction format
   * @returns {Array} - Predictions in Roboflow format
   */
  getOutputPredictions() {
    return this.trackedObjects.map(obj => ({
      x: obj.bbox.x,
      y: obj.bbox.y,
      width: obj.bbox.width,
      height: obj.bbox.height,
      class: obj.class,
      confidence: obj.confidence,
      tracked: true,
      tracking_id: obj.id
    }));
  }

  /**
   * Reset the tracker
   */
  reset() {
    this.trackedObjects = [];
    this.lastUpdateTime = 0;
  }
}

export default ObjectTracker;