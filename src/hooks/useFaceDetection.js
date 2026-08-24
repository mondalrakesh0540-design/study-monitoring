// src/hooks/useFaceDetection.js
// Advanced MediaPipe FaceLandmarker + FaceDetector hook for accurate:
// 1. Face Presence / Missing Detection (covered by book / left seat)
// 2. Real Eye-Closure Sleep Detection (EAR + Blendshapes) for 5s light sleep & 30s deep sleep
// 3. Posture & Head Orientation Analysis (Looking at phone / turned sideways / head slumped)

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export function useFaceDetection({ videoRef, isCameraReady, isMonitoring }) {
  const [detectorReady, setDetectorReady] = useState(false);
  const [modelError, setModelError] = useState('');
  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [missingDuration, setMissingDuration] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractedDuration, setDistractedDuration] = useState(0);
  const [faceBoundingBox, setFaceBoundingBox] = useState(null);

  const landmarkerRef = useRef(null);
  const detectorFallbackRef = useRef(null);
  const isLandmarkerActiveRef = useRef(false);

  const missingStartTimeRef = useRef(null);
  const distractedStartTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastDetectTimeRef = useRef(0);
  const lastTimestampMsRef = useRef(0);

  // Debounce counters
  const consecutivePresentRef = useRef(0);
  const consecutiveMissingRef = useRef(0);
  const consecutiveDistractedRef = useRef(0);
  const consecutiveNormalRef = useRef(0);

  // Initialize MediaPipe Vision Task
  useEffect(() => {
    let isSubscribed = true;

    async function initVision() {
      try {
        setModelError('');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isSubscribed) return;

        // Try FaceLandmarker first (provides 478 3D landmarks + blendshapes for eyes/sleep)
        try {
          const landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU'
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.35,
            minFacePresenceConfidence: 0.35,
            minTrackingConfidence: 0.35
          });

          if (!isSubscribed) {
            landmarker.close();
            return;
          }

          landmarkerRef.current = landmarker;
          isLandmarkerActiveRef.current = true;
          setDetectorReady(true);
          console.log('[Vision] FaceLandmarker initialized with GPU and Blendshapes.');
          return;
        } catch (landmarkerErr) {
          console.warn('[Vision] FaceLandmarker GPU init failed, trying FaceDetector fallback...', landmarkerErr);
        }

        // Fallback to BlazeFace Detector
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.35
        });

        if (!isSubscribed) {
          detector.close();
          return;
        }

        detectorFallbackRef.current = detector;
        isLandmarkerActiveRef.current = false;
        setDetectorReady(true);
        console.log('[Vision] FaceDetector fallback initialized.');
      } catch (err) {
        console.error('[Vision] MediaPipe Initialization Error:', err);
        if (isSubscribed) {
          setDetectorReady(false);
          setModelError('Face detection model failed to load. Check internet connection.');
        }
      }
    }

    initVision();

    return () => {
      isSubscribed = false;
      if (landmarkerRef.current) {
        try { landmarkerRef.current.close(); } catch (e) {}
        landmarkerRef.current = null;
      }
      if (detectorFallbackRef.current) {
        try { detectorFallbackRef.current.close(); } catch (e) {}
        detectorFallbackRef.current = null;
      }
    };
  }, []);

  // Eye Aspect Ratio (EAR) calculation for eye closure
  const calculateEyeClosure = useCallback((landmarks, blendshapes) => {
    // 1. Blendshapes score check (0.0 = wide open, 1.0 = fully closed)
    if (blendshapes && blendshapes.length > 0) {
      const categories = blendshapes[0].categories || [];
      const blinkLeft = categories.find((c) => c.categoryName === 'eyeBlinkLeft')?.score || 0;
      const blinkRight = categories.find((c) => c.categoryName === 'eyeBlinkRight')?.score || 0;

      // Both eyes closed
      if (blinkLeft > 0.45 && blinkRight > 0.45) {
        return true;
      }
    }

    // 2. Geometric Eye Aspect Ratio (EAR)
    // Left eye landmarks: 33 (outer), 133 (inner), 160 (top), 158 (top), 144 (bottom), 153 (bottom)
    // Right eye landmarks: 263 (outer), 362 (inner), 385 (top), 387 (top), 373 (bottom), 380 (bottom)
    if (landmarks && landmarks.length >= 468) {
      const leftH = Math.hypot(landmarks[33].x - landmarks[133].x, landmarks[33].y - landmarks[133].y);
      const leftV1 = Math.hypot(landmarks[160].x - landmarks[144].x, landmarks[160].y - landmarks[144].y);
      const leftV2 = Math.hypot(landmarks[158].x - landmarks[153].x, landmarks[158].y - landmarks[153].y);
      const leftEAR = leftH > 0 ? (leftV1 + leftV2) / (2.0 * leftH) : 0.3;

      const rightH = Math.hypot(landmarks[263].x - landmarks[362].x, landmarks[263].y - landmarks[362].y);
      const rightV1 = Math.hypot(landmarks[385].x - landmarks[373].x, landmarks[385].y - landmarks[373].y);
      const rightV2 = Math.hypot(landmarks[387].x - landmarks[380].x, landmarks[387].y - landmarks[380].y);
      const rightEAR = rightH > 0 ? (rightV1 + rightV2) / (2.0 * rightH) : 0.3;

      if (leftEAR < 0.16 && rightEAR < 0.16) {
        return true;
      }
    }

    return false;
  }, []);

  // Check posture & orientation (head turned sideways / slumped down)
  const checkPostureDistracted = useCallback((landmarks, blendshapes, videoWidth, videoHeight) => {
    if (!landmarks || landmarks.length < 468) return false;

    // Check 1: Blendshapes gaze looking down at phone
    if (blendshapes && blendshapes.length > 0) {
      const categories = blendshapes[0].categories || [];
      const lookDownLeft = categories.find((c) => c.categoryName === 'eyeLookDownLeft')?.score || 0;
      const lookDownRight = categories.find((c) => c.categoryName === 'eyeLookDownRight')?.score || 0;
      if (lookDownLeft > 0.75 && lookDownRight > 0.75) {
        return true; // Continuously staring down at phone
      }
    }

    // Check 2: Head yaw (turned left/right looking away)
    // Landmark 4 = Nose tip, 234 = Left face edge, 454 = Right face edge
    const nose = landmarks[4];
    const leftEdge = landmarks[234];
    const rightEdge = landmarks[454];

    if (nose && leftEdge && rightEdge) {
      const distLeft = Math.abs(nose.x - leftEdge.x);
      const distRight = Math.abs(nose.x - rightEdge.x);
      if (distLeft > 0 && distRight > 0) {
        const ratio = distLeft / distRight;
        // Turned away sideways significantly (looking at phone/side)
        if (ratio < 0.28 || ratio > 3.6) {
          return true;
        }
      }
    }

    // Check 3: Slumped down on desk
    // Forehead (10), Chin (152)
    const forehead = landmarks[10];
    const chin = landmarks[152];
    if (chin && forehead) {
      const faceCenterY = (chin.y + forehead.y) / 2;
      // Head dropped very low in the frame (sleeping on table)
      if (faceCenterY > 0.88) {
        return true;
      }
    }

    return false;
  }, []);

  // Main Detection Loop
  const detectFrame = useCallback(() => {
    if (!isMonitoring || !isCameraReady || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();
    // Run detection loop at ~150ms interval (~6.6 FPS)
    if (now - lastDetectTimeRef.current >= 150) {
      lastDetectTimeRef.current = now;

      const nowMs = Math.round(now);
      const timestampMs = Math.max(nowMs, lastTimestampMsRef.current + 1);
      lastTimestampMsRef.current = timestampMs;

      try {
        let hasFace = false;
        let isSleepingOrDistracted = false;

        if (isLandmarkerActiveRef.current && landmarkerRef.current) {
          const result = landmarkerRef.current.detectForVideo(video, timestampMs);
          const faceLandmarksList = result.faceLandmarks || [];
          const faceBlendshapesList = result.faceBlendshapes || [];

          if (faceLandmarksList.length > 0) {
            hasFace = true;
            const landmarks = faceLandmarksList[0];

            // Compute Bounding Box from 478 landmarks
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            for (let i = 0; i < landmarks.length; i++) {
              const pt = landmarks[i];
              if (pt.x < minX) minX = pt.x;
              if (pt.y < minY) minY = pt.y;
              if (pt.x > maxX) maxX = pt.x;
              if (pt.y > maxY) maxY = pt.y;
            }

            const originX = minX * video.videoWidth;
            const originY = minY * video.videoHeight;
            const width = (maxX - minX) * video.videoWidth;
            const height = (maxY - minY) * video.videoHeight;

            setFaceBoundingBox({
              originX,
              originY,
              width,
              height,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });

            // 1. Check real eye closure (sleeping / eyes closed)
            const isEyesClosed = calculateEyeClosure(landmarks, faceBlendshapesList);
            // 2. Check posture (phone / looking away / slumped on desk)
            const isPostureDistracted = checkPostureDistracted(landmarks, faceBlendshapesList, video.videoWidth, video.videoHeight);

            if (isEyesClosed || isPostureDistracted) {
              isSleepingOrDistracted = true;
            }
          }
        } else if (detectorFallbackRef.current) {
          // Fallback BlazeFace Detector
          const result = detectorFallbackRef.current.detectForVideo(video, timestampMs);
          const detections = result.detections || [];
          if (detections.length > 0) {
            hasFace = true;
            const bbox = detections[0].boundingBox;
            if (bbox) {
              setFaceBoundingBox({
                originX: bbox.originX,
                originY: bbox.originY,
                width: bbox.width,
                height: bbox.height,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight
              });

              // Simple head slump check
              const centerY = (bbox.originY + bbox.height / 2) / video.videoHeight;
              if (centerY > 0.85) {
                isSleepingOrDistracted = true;
              }
            }
          }
        }

        // Debouncing Presence / Absence
        if (hasFace) {
          consecutivePresentRef.current += 1;
          consecutiveMissingRef.current = 0;
        } else {
          consecutiveMissingRef.current += 1;
          consecutivePresentRef.current = 0;
        }

        const confirmedHasFace = consecutivePresentRef.current >= 2;
        const confirmedMissing = consecutiveMissingRef.current >= 3;

        if (confirmedHasFace) {
          setIsFaceDetected(true);
          missingStartTimeRef.current = null;
          setMissingDuration(0);

          // Handle Sleep / Distraction duration
          if (isSleepingOrDistracted) {
            consecutiveDistractedRef.current += 1;
            consecutiveNormalRef.current = 0;
          } else {
            consecutiveNormalRef.current += 1;
            consecutiveDistractedRef.current = 0;
          }

          if (consecutiveDistractedRef.current >= 2) {
            if (!distractedStartTimeRef.current) {
              distractedStartTimeRef.current = Date.now();
            }
            const distSec = Math.floor((Date.now() - distractedStartTimeRef.current) / 1000);
            setDistractedDuration(distSec);
            if (distSec >= 5) {
              setIsDistracted(true);
            }
          } else if (consecutiveNormalRef.current >= 2) {
            distractedStartTimeRef.current = null;
            setDistractedDuration(0);
            setIsDistracted(false);
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
        console.warn('[Vision] Detection cycle error:', err);
      }
    }

    if (isMonitoring && isCameraReady) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    }
  }, [isMonitoring, isCameraReady, videoRef, calculateEyeClosure, checkPostureDistracted]);

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
      consecutiveDistractedRef.current = 0;
      consecutiveNormalRef.current = 0;
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
