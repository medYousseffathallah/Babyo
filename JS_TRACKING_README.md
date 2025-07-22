# JavaScript Object Tracking Solution

## Overview

This solution adds real-time object tracking to the Baby Monitor application using a pure JavaScript implementation. It improves the accuracy and stability of bounding boxes by maintaining consistent tracking between frames, even when the detection model doesn't provide new predictions.

## How It Works

1. The `ObjectTracker` class maintains the state of tracked objects across frames.
2. When new predictions come from Roboflow, they are matched with existing tracked objects using Intersection over Union (IOU).
3. Between Roboflow predictions, the tracker updates object positions based on their calculated velocity.
4. This creates smooth, continuous tracking even when the detection model misses frames.

## Components

- `objectTracker.js`: JavaScript class that implements the tracking algorithm
- Integration with `LiveDetectionPage.js` to use the tracker for bounding box rendering

## Features

### Object Persistence

The tracker maintains object identity across frames, allowing for:
- Consistent bounding box positions even when detections are intermittent
- Smooth motion interpolation between detections
- Preservation of object identity (same object keeps same tracking ID)

### Motion Prediction

The tracker calculates object velocity and uses it to predict future positions:
- Estimates where objects will be between detection frames
- Handles temporary occlusions or detection failures
- Provides smoother visual experience for users

### Automatic Matching

The tracker automatically matches new detections with existing tracked objects:
- Uses Intersection over Union (IOU) to determine object correspondence
- Handles new objects appearing in the scene
- Removes objects that are no longer visible

## Technical Details

### Tracking Algorithm

The solution uses a simple but effective tracking approach:

1. **Object Matching**: When new detections arrive, they are matched with existing tracked objects using IOU (Intersection over Union).

2. **Velocity Calculation**: For matched objects, velocity is calculated based on the change in position over time.

3. **Position Prediction**: Between detection frames, object positions are updated based on their velocity.

4. **Object Lifecycle Management**: Objects that haven't been detected for a certain period are removed from tracking.

### Coordinate System

The tracker works with normalized coordinates (0-1 range) with center point representation, which is compatible with Roboflow's output format.

### Performance Considerations

The JavaScript implementation is lightweight and runs entirely in the browser, with negligible performance impact compared to the original implementation.

## Usage

The tracker is automatically initialized and used in the `LiveDetectionPage` component. No additional setup is required.

## Troubleshooting

### Tracking Issues

If tracking appears unstable:

1. Check that the detection frequency is appropriate (currently set to 300ms)
2. Ensure the webcam is providing clear, well-lit video
3. Try adjusting the `iouThreshold` and `maxMissingFrames` parameters in the `ObjectTracker` class
4. For tracking faces with changing expressions, the tracker uses a lower IOU threshold (0.2) and class matching to maintain tracking
5. The tracker uses adaptive velocity decay to prevent drift when objects are missing for multiple frames

### Performance Issues

If you experience performance issues:

1. Reduce the detection frequency
2. Simplify the tracking algorithm by disabling velocity calculation (set `useVelocity: false` in options)
3. Reduce the video resolution

## Future Improvements

Possible enhancements to the tracking system:

1. Implement more sophisticated tracking algorithms like Kalman filtering
2. Add appearance-based matching using feature vectors
3. Implement multi-object tracking with occlusion handling
4. Add trajectory prediction for more accurate motion estimation