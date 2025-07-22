/**
 * ObjectTracker.js
 * A JavaScript-based object tracking solution that uses Intersection over Union (IOU)
 * to match and track objects across frames.
 */

class ObjectTracker {
  constructor(options = {}) {
    // Configuration options
    this.options = {
      // Minimum IOU threshold for considering a match between objects
      // Lowered from 0.3 to 0.2 to be more lenient with face matching when expressions change
      iouThreshold: options.iouThreshold || 0.2,
      // Maximum number of frames an object can be missing before being removed
      // Decreased to 5 for faster removal of old predictions
      maxMissingFrames: options.maxMissingFrames || 0,
      // Whether to use velocity for prediction
      useVelocity: options.useVelocity !== undefined ? options.useVelocity : true,
      // Decay factor for velocity (how quickly velocity influence decreases)
      velocityDecay: options.velocityDecay || 0.8,
      // Smoothing factor for exponential moving average (0-1, lower = more smoothing)
      smoothingAlpha: options.smoothingAlpha || 0.2,
      // Debug mode
      debug: options.debug || false
    };

    // Initialize tracked objects array
    this.trackedObjects = [];
    
    // Frame counter
    this.frameCount = 0;
  }

  /**
   * Calculate Intersection over Union between two bounding boxes
   * @param {Object} box1 - First bounding box {x, y, width, height}
   * @param {Object} box2 - Second bounding box {x, y, width, height}
   * @returns {number} IOU value between 0 and 1
   */
  calculateIOU(box1, box2) {
    // Calculate coordinates of intersection rectangle
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    // Check if there is an intersection
    if (x2 < x1 || y2 < y1) {
      return 0;
    }

    // Calculate area of intersection
    const intersectionArea = (x2 - x1) * (y2 - y1);

    // Calculate areas of both bounding boxes
    const box1Area = box1.width * box1.height;
    const box2Area = box2.width * box2.height;

    // Calculate IOU
    const iou = intersectionArea / (box1Area + box2Area - intersectionArea);
    return iou;
  }

  /**
   * Update tracked objects with new predictions
   * @param {Array} newPredictions - Array of new predictions from the detection model
   * @param {Object} imageInfo - Information about the current image (width, height)
   * @returns {Array} Updated tracked objects
   */
  update(newPredictions, imageInfo) {
    this.frameCount++;
    
    if (!newPredictions || newPredictions.length === 0) {
      // If no new predictions, update positions based on velocity and increment missing frames
      return this.updateWithoutNewPredictions(imageInfo);
    }

    // Convert predictions to normalized format if they aren't already
    const normalizedPredictions = this.normalizePredictions(newPredictions, imageInfo);
    
    // If no tracked objects yet, initialize with the first set of predictions
    if (this.trackedObjects.length === 0) {
      this.initializeTrackedObjects(normalizedPredictions);
      return this.denormalizePredictions(this.trackedObjects, imageInfo);
    }

    // Match new predictions with existing tracked objects
    this.matchAndUpdateObjects(normalizedPredictions, imageInfo);
    
    // Return the updated tracked objects (denormalized for display)
    return this.denormalizePredictions(this.trackedObjects, imageInfo);
  }

  /**
   * Initialize tracked objects with the first set of predictions
   * @param {Array} predictions - Array of normalized predictions
   */
  initializeTrackedObjects(predictions) {
    this.trackedObjects = predictions.map((pred, index) => ({
      id: index + 1, // Assign unique ID
      x: pred.x,
      y: pred.y,
      width: pred.width,
      height: pred.height,
      class: pred.class,
      confidence: pred.confidence,
      emotion: pred.emotion,
      missingFrames: 0,
      velocityX: 0,
      velocityY: 0,
      lastSeen: this.frameCount
    }));
  }

  /**
   * Match new predictions with existing tracked objects using IOU
   * @param {Array} normalizedPredictions - Array of normalized predictions
   * @param {Object} imageInfo - Information about the current image
   */
  matchAndUpdateObjects(normalizedPredictions, imageInfo) {
    // Create a copy of tracked objects to work with
    const trackedObjectsCopy = [...this.trackedObjects];
    
    // Create a list to track which predictions have been matched
    const matchedPredictions = new Array(normalizedPredictions.length).fill(false);
    
    // For each tracked object, find the best matching prediction
    trackedObjectsCopy.forEach(trackedObj => {
      let bestMatch = -1;
      let bestScore = this.options.iouThreshold; // Use as minimum threshold for combined score
      
      // Find the prediction with the highest combined score
      normalizedPredictions.forEach((pred, predIndex) => {
        if (!matchedPredictions[predIndex]) {
          // Calculate IOU between tracked object and prediction
          const iou = this.calculateIOU(trackedObj, pred);
          
          // Calculate class match bonus (1.0 if same class, 0.0 otherwise)
          const classMatchBonus = (pred.class === trackedObj.class) ? 0.1 : 0.0;
          
          // Calculate combined score (IOU + class match bonus)
          const combinedScore = iou + classMatchBonus;
          
          // If this prediction has a better score, update the best match
          if (combinedScore > bestScore) {
            bestScore = combinedScore;
            bestMatch = predIndex;
          }
        }
      });
      
      // If a match was found, update the tracked object
      if (bestMatch !== -1) {
        const matchedPred = normalizedPredictions[bestMatch];
        
        // Calculate velocity based on position change
        const velocityX = this.options.useVelocity ? 
          (matchedPred.x - trackedObj.x) : 0;
        const velocityY = this.options.useVelocity ? 
          (matchedPred.y - trackedObj.y) : 0;
        
        // Smooth the new position, width, and height using EMA
        const smoothedX = this.options.smoothingAlpha * matchedPred.x + (1 - this.options.smoothingAlpha) * trackedObj.x;
        const smoothedY = this.options.smoothingAlpha * matchedPred.y + (1 - this.options.smoothingAlpha) * trackedObj.y;
        const smoothedWidth = this.options.smoothingAlpha * matchedPred.width + (1 - this.options.smoothingAlpha) * trackedObj.width;
        const smoothedHeight = this.options.smoothingAlpha * matchedPred.height + (1 - this.options.smoothingAlpha) * trackedObj.height;
        
        // Update tracked object with smoothed position and properties
        trackedObj.x = smoothedX;
        trackedObj.y = smoothedY;
        trackedObj.width = smoothedWidth;
        trackedObj.height = smoothedHeight;
        trackedObj.class = matchedPred.class;
        trackedObj.confidence = matchedPred.confidence;
        trackedObj.emotion = matchedPred.emotion;
        trackedObj.velocityX = velocityX;
        trackedObj.velocityY = velocityY;
        trackedObj.missingFrames = 0;
        trackedObj.lastSeen = this.frameCount;
        
        // Mark this prediction as matched
        matchedPredictions[bestMatch] = true;
      } else {
        // No match found, increment missing frames counter
        trackedObj.missingFrames++;
        
        // Update position based on velocity if enabled
        if (this.options.useVelocity) {
          trackedObj.x += trackedObj.velocityX;
          trackedObj.y += trackedObj.velocityY;
          
          // Apply velocity decay
          trackedObj.velocityX *= this.options.velocityDecay;
          trackedObj.velocityY *= this.options.velocityDecay;
        }
      }
    });
    
    // Add new objects for unmatched predictions
    normalizedPredictions.forEach((pred, index) => {
      if (!matchedPredictions[index]) {
        const newId = this.getNextId();
        this.trackedObjects.push({
          id: newId,
          x: pred.x,
          y: pred.y,
          width: pred.width,
          height: pred.height,
          class: pred.class,
          confidence: pred.confidence,
          emotion: pred.emotion,
          missingFrames: 0,
          velocityX: 0,
          velocityY: 0,
          lastSeen: this.frameCount
        });
      }
    });
    
    // Remove objects that have been missing for too long
    this.trackedObjects = this.trackedObjects.filter(
      obj => obj.missingFrames <= this.options.maxMissingFrames
    );
  }

  /**
   * Update tracked objects when no new predictions are available
   * @param {Object} imageInfo - Information about the current image
   * @returns {Array} Updated tracked objects
   */
  updateWithoutNewPredictions(imageInfo) {
    // Increment frame count
    this.frameCount++;
    
    // Update each tracked object based on its velocity
    this.trackedObjects.forEach(obj => {
      obj.missingFrames++;
      
      // Update position based on velocity if enabled
      if (this.options.useVelocity) {
        // Calculate adaptive velocity based on missing frames
        // As frames go missing, we reduce the velocity impact to prevent drift
        const adaptiveDecay = Math.pow(this.options.velocityDecay, obj.missingFrames);
        
        // Apply velocity with adaptive decay
        obj.x += obj.velocityX * adaptiveDecay;
        obj.y += obj.velocityY * adaptiveDecay;
        
        // Apply velocity decay
        obj.velocityX *= this.options.velocityDecay;
        obj.velocityY *= this.options.velocityDecay;
      }
      
      // Ensure object stays within bounds (0-1 for normalized coordinates)
      obj.x = Math.max(0, Math.min(1, obj.x));
      obj.y = Math.max(0, Math.min(1, obj.y));
    });
    
    // Remove objects that have been missing for too long
    this.trackedObjects = this.trackedObjects.filter(
      obj => obj.missingFrames <= this.options.maxMissingFrames
    );
    
    // Return the updated tracked objects (denormalized for display)
    return this.denormalizePredictions(this.trackedObjects, imageInfo);
  }

  /**
   * Get the next available ID for a new tracked object
   * @returns {number} Next available ID
   */
  getNextId() {
    const maxId = this.trackedObjects.reduce(
      (max, obj) => Math.max(max, obj.id), 0
    );
    return maxId + 1;
  }

  /**
   * Convert predictions to normalized coordinates (0-1 range)
   * @param {Array} predictions - Array of predictions with pixel coordinates
   * @param {Object} imageInfo - Information about the image (width, height)
   * @returns {Array} Normalized predictions
   */
  normalizePredictions(predictions, imageInfo) {
    if (!predictions || !imageInfo) return [];
    
    // Check if predictions are already normalized (values between 0-1)
    const firstPred = predictions[0];
    if (firstPred && firstPred.x <= 1 && firstPred.y <= 1 && 
        firstPred.width <= 1 && firstPred.height <= 1) {
      return predictions;
    }
    
    // Normalize coordinates to 0-1 range
    return predictions.map(pred => ({
      ...pred,
      x: pred.x / imageInfo.width,
      y: pred.y / imageInfo.height,
      width: pred.width / imageInfo.width,
      height: pred.height / imageInfo.height
    }));
  }

  /**
   * Convert normalized predictions back to pixel coordinates
   * @param {Array} normalizedPredictions - Array of predictions with normalized coordinates
   * @param {Object} imageInfo - Information about the image (width, height)
   * @returns {Array} Predictions with pixel coordinates
   */
  denormalizePredictions(normalizedPredictions, imageInfo) {
    if (!normalizedPredictions || !imageInfo) return [];
    
    return normalizedPredictions.map(pred => ({
      ...pred,
      x: Math.round(pred.x * imageInfo.width),
      y: Math.round(pred.y * imageInfo.height),
      width: Math.round(pred.width * imageInfo.width),
      height: Math.round(pred.height * imageInfo.height)
    }));
  }

  /**
   * Reset the tracker (clear all tracked objects)
   */
  reset() {
    this.trackedObjects = [];
    this.frameCount = 0;
  }
}

export default ObjectTracker;