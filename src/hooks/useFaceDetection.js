// src/hooks/useFaceDetection.js
// Custom React hook for MediaPipe browser-based face presence, phone/distraction detection, and sleep posture.

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
  const lastTimestampMsRef = useRef(0);

  // Debounce counters to prevent single-frame flickering
  const consecutivePresentRef = useRef(0);
  const consecutiveMissingRef = useRef(0);

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
          minDetectionConfidence: 0.35
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
          setModelError('Face detection model failed to load. Check network connection.');
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
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();
    // Run detection loop at ~200ms interval (5 FPS)
    if (now - lastDetectTimeRef.current >= 200) {
      lastDetectTimeRef.current = now;

      const nowMs = Math.round(now);
      const timestampMs = Math.max(nowMs, lastTimestampMsRef.current + 1);
      lastTimestampMsRef.current = timestampMs;

      try {
        const result = detectorRef.current.detectForVideo(video, timestampMs);
        const detections = result.detections || [];
        const rawHasFace = detections.length > 0;

        if (rawHasFace) {
          consecutivePresentRef.current += 1;
          consecutiveMissingRef.current = 0;
        } else {
          consecutiveMissingRef.current += 1;
          consecutivePresentRef.current = 0;
        }

        const confirmedHasFace = consecutivePresentRef.current >= 2;
        const confirmedMissing = consecutiveMissingRef.current >= 2;

        if (confirmedHasFace) {
          setIsFaceDetected(true);
          missingStartTimeRef.current = null;
          setMissingDuration(0);

          const firstFace = detections[0];
          const bbox = firstFace.boundingBox;

          if (bbox && video.videoWidth > 0 && video.videoHeight > 0) {
            setFaceBoundingBox({
              originX: bbox.originX,
              originY: bbox.originY,
              width: bbox.width,
              height: bbox.height,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });

            let phoneOrDistracted = false;
            const centerX = (bbox.originX + bbox.width / 2) / video.videoWidth;
            const centerY = (bbox.originY + bbox.height / 2) / video.videoHeight;

            // Test 1: Looking down at phone in hands or leaning down
            if (centerY > 0.65 || centerY < 0.10 || centerX < 0.10 || centerX > 0.90) {
              phoneOrDistracted = true;
            }

            // Test 2: Keypoints orientation (Right eye: 0, Left eye: 1, Nose: 2)
            if (firstFace.keypoints && firstFace.keypoints.length >= 3) {
              const rightEye = firstFace.keypoints[0];
              const leftEye = firstFace.keypoints[1];
              const nose = firstFace.keypoints[2];

              if (rightEye && leftEye && nose) {
                const eyeDist = Math.abs(leftEye.x - rightEye.x);
                const eyeY = (rightEye.y + leftEye.y) / 2;
                const eyeX = (rightEye.x + leftEye.x) / 2;

                const noseXOffset = Math.abs(nose.x - eyeX);
                const noseYDist = nose.y - eyeY;

                // Turned away looking at phone/side
                if (eyeDist > 0 && noseXOffset / eyeDist > 0.40) {
                  phoneOrDistracted = true;
                }

                // Head tilted down looking at phone screen (noseYDist decreases)
                if (eyeDist > 0 && (noseYDist / eyeDist < 0.28 || noseYDist < 0)) {
                  phoneOrDistracted = true;
                }
              }
            }

            if (phoneOrDistracted) {
              if (!distractedStartTimeRef.current) {
                distractedStartTimeRef.current = Date.now();
              }
              const distSec = Math.floor((Date.now() - distractedStartTimeRef.current) / 1000);
              setDistractedDuration(distSec);
              if (distSec >= 3) {
                setIsDistracted(true);
              }
            } else {
              distractedStartTimeRef.current = null;
              setDistractedDuration(0);
              setIsDistracted(false);
            }
          }
        } else if (confirmedMissing) {
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
      consecutivePresentRef.current = 0;
      consecutiveMissingRef.current = 0;
      missingStartTimeRef.current = null;
      distractedStartTimeRef.current = null;
      lastTimestampMsRef.current = 0;
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
