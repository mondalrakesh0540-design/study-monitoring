// src/hooks/useFaceDetection.js
// Advanced MediaPipe FaceLandmarker with comprehensive Expression & Mood Analysis:
// - Yawn / Jhamai (jawOpen)
// - Smile / Laugh (mouthSmile)
// - Angry / Frown (browDown)
// - Surprised / Shocked (browInnerUp, eyeWide)
// - Winking (single eye blink mismatch)
// - Real Sleep (bilateral EAR + eyeBlink)
// - Posture & Phone distraction

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

  // Expression States
  const [isYawning, setIsYawning] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isShocked, setIsShocked] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [expressionMood, setExpressionMood] = useState('Neutral 😐');

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
          console.log('[Vision] FaceLandmarker initialized with 478 landmarks & Blendshapes.');
          return;
        } catch (landmarkerErr) {
          console.warn('[Vision] FaceLandmarker GPU init failed, using FaceDetector fallback...', landmarkerErr);
        }

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

  // Eye closure check (EAR + Blendshapes)
  const calculateEyeClosure = useCallback((landmarks, blendshapes) => {
    if (blendshapes && blendshapes.length > 0) {
      const categories = blendshapes[0].categories || [];
      const blinkLeft = categories.find((c) => c.categoryName === 'eyeBlinkLeft')?.score || 0;
      const blinkRight = categories.find((c) => c.categoryName === 'eyeBlinkRight')?.score || 0;

      if (blinkLeft > 0.45 && blinkRight > 0.45) {
        return true;
      }
    }

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

  // Comprehensive Expression Analysis
  const analyzeExpressions = useCallback((landmarks, blendshapes) => {
    let rawYawn = false;
    let rawSmile = false;
    let rawAngry = false;
    let rawShocked = false;
    let rawWinking = false;
    let mood = 'Focused 🎯';

    if (blendshapes && blendshapes.length > 0) {
      const categories = blendshapes[0].categories || [];
      const getScore = (name) => categories.find((c) => c.categoryName === name)?.score || 0;

      const jawOpen = getScore('jawOpen');
      const smileLeft = getScore('mouthSmileLeft');
      const smileRight = getScore('mouthSmileRight');
      const browDownLeft = getScore('browDownLeft');
      const browDownRight = getScore('browDownRight');
      const browInnerUp = getScore('browInnerUp');
      const eyeWideLeft = getScore('eyeWideLeft');
      const eyeWideRight = getScore('eyeWideRight');
      const blinkLeft = getScore('eyeBlinkLeft');
      const blinkRight = getScore('eyeBlinkRight');

      // 1. Yawn / Jhamai
      if (jawOpen > 0.58) {
        rawYawn = true;
        mood = 'Yawning 🥱';
      }
      // 2. Smile / Laughing
      else if (smileLeft > 0.55 && smileRight > 0.55) {
        rawSmile = true;
        mood = 'Smiling / Laughing 😂';
      }
      // 3. Shocked / Surprised / Wide Eyes
      else if (browInnerUp > 0.50 || (eyeWideLeft > 0.45 && eyeWideRight > 0.45)) {
        rawShocked = true;
        mood = 'Shocked / Surprised 😲';
      }
      // 4. Angry / Frowning
      else if (browDownLeft > 0.48 || browDownRight > 0.48) {
        rawAngry = true;
        mood = 'Angry / Frowning 😠';
      }
      // 5. Winking
      else if (Math.abs(blinkLeft - blinkRight) > 0.55 && (blinkLeft > 0.6 || blinkRight > 0.6)) {
        rawWinking = true;
        mood = 'Winking 😉';
      }
    } else if (landmarks && landmarks.length >= 468) {
      // Geometric Fallbacks
      const mouthHeight = Math.hypot(landmarks[13].x - landmarks[14].x, landmarks[13].y - landmarks[14].y);
      const mouthWidth = Math.hypot(landmarks[61].x - landmarks[291].x, landmarks[61].y - landmarks[291].y);
      if (mouthWidth > 0 && mouthHeight / mouthWidth > 0.55) {
        rawYawn = true;
        mood = 'Yawning 🥱';
      }
    }

    return { rawYawn, rawSmile, rawAngry, rawShocked, rawWinking, mood };
  }, []);

  // Posture Analysis
  const checkPostureDistracted = useCallback((landmarks, blendshapes, videoWidth, videoHeight) => {
    if (!landmarks || landmarks.length < 468) return false;

    if (blendshapes && blendshapes.length > 0) {
      const categories = blendshapes[0].categories || [];
      const lookDownLeft = categories.find((c) => c.categoryName === 'eyeLookDownLeft')?.score || 0;
      const lookDownRight = categories.find((c) => c.categoryName === 'eyeLookDownRight')?.score || 0;
      if (lookDownLeft > 0.75 && lookDownRight > 0.75) {
        return true;
      }
    }

    const nose = landmarks[4];
    const leftEdge = landmarks[234];
    const rightEdge = landmarks[454];

    if (nose && leftEdge && rightEdge) {
      const distLeft = Math.abs(nose.x - leftEdge.x);
      const distRight = Math.abs(nose.x - rightEdge.x);
      if (distLeft > 0 && distRight > 0) {
        const ratio = distLeft / distRight;
        if (ratio < 0.28 || ratio > 3.6) {
          return true;
        }
      }
    }

    const forehead = landmarks[10];
    const chin = landmarks[152];
    if (chin && forehead) {
      const faceCenterY = (chin.y + forehead.y) / 2;
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
    if (now - lastDetectTimeRef.current >= 150) {
      lastDetectTimeRef.current = now;

      const nowMs = Math.round(now);
      const timestampMs = Math.max(nowMs, lastTimestampMsRef.current + 1);
      lastTimestampMsRef.current = timestampMs;

      try {
        let hasFace = false;
        let isSleepingOrDistracted = false;
        let detectedYawn = false;
        let detectedSmile = false;
        let detectedAngry = false;
        let detectedShocked = false;
        let detectedWinking = false;
        let currentMood = 'Focused 🎯';

        if (isLandmarkerActiveRef.current && landmarkerRef.current) {
          const result = landmarkerRef.current.detectForVideo(video, timestampMs);
          const faceLandmarksList = result.faceLandmarks || [];
          const faceBlendshapesList = result.faceBlendshapes || [];

          if (faceLandmarksList.length > 0) {
            hasFace = true;
            const landmarks = faceLandmarksList[0];

            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            for (let i = 0; i < landmarks.length; i++) {
              const pt = landmarks[i];
              if (pt.x < minX) minX = pt.x;
              if (pt.y < minY) minY = pt.y;
              if (pt.x > maxX) maxX = pt.x;
              if (pt.y > maxY) maxY = pt.y;
            }

            setFaceBoundingBox({
              originX: minX * video.videoWidth,
              originY: minY * video.videoHeight,
              width: (maxX - minX) * video.videoWidth,
              height: (maxY - minY) * video.videoHeight,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });

            const isEyesClosed = calculateEyeClosure(landmarks, faceBlendshapesList);
            const isPostureDistracted = checkPostureDistracted(landmarks, faceBlendshapesList, video.videoWidth, video.videoHeight);
            const expr = analyzeExpressions(landmarks, faceBlendshapesList);

            detectedYawn = expr.rawYawn;
            detectedSmile = expr.rawSmile;
            detectedAngry = expr.rawAngry;
            detectedShocked = expr.rawShocked;
            detectedWinking = expr.rawWinking;
            currentMood = isEyesClosed ? 'Sleeping 😴' : expr.mood;

            if (isEyesClosed || isPostureDistracted) {
              isSleepingOrDistracted = true;
            }
          }
        } else if (detectorFallbackRef.current) {
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
              const centerY = (bbox.originY + bbox.height / 2) / video.videoHeight;
              if (centerY > 0.85) isSleepingOrDistracted = true;
            }
          }
        }

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
          setExpressionMood(currentMood);

          setIsYawning(detectedYawn);
          setIsSmiling(detectedSmile);
          setIsAngry(detectedAngry);
          setIsShocked(detectedShocked);
          setIsWinking(detectedWinking);

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
            if (distSec >= 5) setIsDistracted(true);
          } else if (consecutiveNormalRef.current >= 2) {
            distractedStartTimeRef.current = null;
            setDistractedDuration(0);
            setIsDistracted(false);
          }
        } else if (confirmedMissing) {
          setFaceBoundingBox(null);
          setIsFaceDetected(false);
          setIsDistracted(false);
          setIsYawning(false);
          setIsSmiling(false);
          setIsAngry(false);
          setIsShocked(false);
          setIsWinking(false);
          setExpressionMood('Absent 👻');
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
  }, [isMonitoring, isCameraReady, videoRef, calculateEyeClosure, checkPostureDistracted, analyzeExpressions]);

  useEffect(() => {
    if (isMonitoring && isCameraReady) {
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
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
      setIsYawning(false);
      setIsSmiling(false);
      setIsAngry(false);
      setIsShocked(false);
      setIsWinking(false);
      setExpressionMood('Neutral 😐');
      setFaceBoundingBox(null);
    }

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isMonitoring, isCameraReady, detectFrame]);

  return {
    detectorReady,
    modelError,
    isFaceDetected,
    missingDuration,
    isDistracted,
    distractedDuration,
    faceBoundingBox,
    isYawning,
    isSmiling,
    isAngry,
    isShocked,
    isWinking,
    expressionMood
  };
}
