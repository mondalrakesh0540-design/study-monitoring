// src/hooks/useFaceDetection.js
// Custom React hook for MediaPipe browser-based face presence and posture/distraction detection.

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export function useFaceDetection({ videoRef, isCameraReady, isMonitoring }) {
  const [detectorReady, setDetectorReady] = useState(false);
  const [modelError, setModelError] = useState('');
  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [missingDuration, setMissingDuration] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractedDuration, setDistractedDuration] = useState(0);
  const [faceBoundingBox, setFaceBoundingBox] = useState(null);

  const detectorRef = useRef(null);
  const missingStartTimeRef = useRef(null);
  const distractedStartTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastDetectTimeRef = useRef(0);

  // Initialize MediaPipe FaceDetector
  useEffect(() => {
    let isSubscribed = true;

    async function initDetector() {
      try {
        setModelError('');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isSubscribed) return;

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5
        });

        if (!isSubscribed) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        setDetectorReady(true);
      } catch (err) {
        console.error('MediaPipe Detector Initialization Error:', err);
        if (isSubscribed) {
          setDetectorReady(false);
          setModelError('Face detection model failed to load. Check network connection or WASM support.');
        }
      }
    }

    initDetector();

    return () => {
      isSubscribed = false;
      if (detectorRef.current) {
        try {
          detectorRef.current.close();
        } catch (e) {}
        detectorRef.current = null;
      }
    };
  }, []);

  // Main Detection Loop
  const detectFrame = useCallback(() => {
    if (!isMonitoring || !isCameraReady || !detectorRef.current || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || video.paused || video.ended) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();
    // Throttle detection interval to ~250ms to keep CPU usage low
    if (now - lastDetectTimeRef.current >= 250) {
      lastDetectTimeRef.current = now;

      try {
        const result = detectorRef.current.detectForVideo(video, now);
        const detections = result.detections || [];
        const hasFace = detections.length > 0;

        if (hasFace) {
          setIsFaceDetected(true);
          missingStartTimeRef.current = null;
          setMissingDuration(0);

          const firstFace = detections[0];
          const bbox = firstFace.boundingBox;
          setFaceBoundingBox(bbox);

          // Distraction check: examine bounding box position & keypoints
          let distracted = false;
          if (bbox && video.videoWidth > 0 && video.videoHeight > 0) {
            const centerX = (bbox.originX + bbox.width / 2) / video.videoWidth;
            const centerY = (bbox.originY + bbox.height / 2) / video.videoHeight;

            // If face is shifted too far off-center (head turned left/right/up/down)
            if (centerX < 0.15 || centerX > 0.85 || centerY < 0.10 || centerY > 0.90) {
              distracted = true;
            }

            // Keypoints check (0: right eye, 1: left eye, 2: nose tip)
            if (firstFace.keypoints && firstFace.keypoints.length >= 3) {
              const rightEye = firstFace.keypoints[0];
              const leftEye = firstFace.keypoints[1];
              const nose = firstFace.keypoints[2];

              if (rightEye && leftEye && nose) {
                const eyeDist = Math.abs(leftEye.x - rightEye.x);
                const noseEyeOffset = Math.abs(nose.x - (rightEye.x + leftEye.x) / 2);
                if (eyeDist > 0 && noseEyeOffset / eyeDist > 0.35) {
                  distracted = true; // Head turned sideways
                }
              }
            }
          }

          if (distracted) {
            if (!distractedStartTimeRef.current) {
              distractedStartTimeRef.current = Date.now();
            }
            const distSec = Math.floor((Date.now() - distractedStartTimeRef.current) / 1000);
            setDistractedDuration(distSec);
            if (distSec >= 5) {
              setIsDistracted(true);
            }
          } else {
            distractedStartTimeRef.current = null;
            setDistractedDuration(0);
            setIsDistracted(false);
          }
        } else {
          // Face missing
          setFaceBoundingBox(null);
          setIsFaceDetected(false);
          setIsDistracted(false);
          distractedStartTimeRef.current = null;
          setDistractedDuration(0);

          if (!missingStartTimeRef.current) {
            missingStartTimeRef.current = Date.now();
          }
          const missingSec = Math.floor((Date.now() - missingStartTimeRef.current) / 1000);
          setMissingDuration(missingSec);
        }
      } catch (err) {
        console.warn('Frame detection error:', err);
      }
    }

    if (isMonitoring && isCameraReady) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    }
  }, [isMonitoring, isCameraReady, videoRef]);

  // Handle loop start/stop
  useEffect(() => {
    if (isMonitoring && isCameraReady) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      // Reset counters when monitoring stops
      missingStartTimeRef.current = null;
      distractedStartTimeRef.current = null;
      setMissingDuration(0);
      setDistractedDuration(0);
      setIsFaceDetected(true);
      setIsDistracted(false);
      setFaceBoundingBox(null);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isMonitoring, isCameraReady, detectFrame]);

  return {
    detectorReady,
    modelError,
    isFaceDetected,
    missingDuration,
    isDistracted,
    distractedDuration,
    faceBoundingBox
  };
}
