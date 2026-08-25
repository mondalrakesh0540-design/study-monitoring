// src/hooks/useObjectDetection.js
// Tuned MediaPipe ObjectDetector hook for fast and accurate study item and distraction detection.

import { useState, useEffect, useRef, useCallback } from 'react';
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { speechSpeaker } from '../utils/speechSpeaker';

const ITEM_EMOJIS = {
  'cell phone': '📱',
  'book': '📖',
  'bottle': '🍼',
  'cup': '☕',
  'laptop': '💻',
  'scissors': '✂️',
  'remote': '📺',
  'clock': '⏰',
  'backpack': '🎒',
  'umbrella': '☂️',
  'handbag': '👜',
  'mouse': '🖱️',
  'keyboard': '⌨️',
  'apple': '🍎',
  'banana': '🍌',
  'sandwich': '🥪',
  'orange': '🍊',
  'tv': '📺',
  'chair': '🪑'
};

const ITEM_ANNOUNCEMENTS = {
  'cell phone': 'Phone detected! Chal Bhosdike phone hata aur padhai kar!',
  'book': 'Book detected! Shabash, dhyan se padhai chalu rakho!',
  'bottle': 'Water bottle detected! Paani piyo aur fresh raho!',
  'cup': 'Chai ya coffee cup detected! Fresh ho jao!',
  'laptop': 'Laptop detected! Study mode active!',
  'scissors': 'Scissors / Kaichi detected!',
  'remote': 'Remote control detected! TV bandh karo!',
  'clock': 'Clock / Ghadi detected! Time waste mat karo!',
  'mouse': 'Computer mouse detected!',
  'keyboard': 'Keyboard detected!',
  'backpack': 'School bag / Backpack detected!',
  'apple': 'Apple / Seb detected! Healthy raho!',
  'banana': 'Banana / Kela detected!'
};

export function useObjectDetection({ videoRef, isCameraReady, isMonitoring, onPhoneDetected }) {
  const [objectDetectorReady, setObjectDetectorReady] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [latestItemAnnouncement, setLatestItemAnnouncement] = useState('');

  const detectorRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastDetectTimeRef = useRef(0);
  const lastTimestampMsRef = useRef(0);
  const lastAnnouncedItemRef = useRef('');
  const lastAnnounceTimeRef = useRef(0);

  // Initialize MediaPipe Object Detector with high precision CPU mode
  useEffect(() => {
    let isSubscribed = true;

    async function initDetector() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isSubscribed) return;

        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
            delegate: 'CPU'
          },
          scoreThreshold: 0.28, // Tuned for higher sensitivity
          maxResults: 4,
          runningMode: 'VIDEO'
        });

        if (!isSubscribed) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        setObjectDetectorReady(true);
        console.log('[ObjectDetector] Object Detector initialized with tuned sensitivity (0.28).');
      } catch (err) {
        console.warn('[ObjectDetector] Model init error:', err);
        if (isSubscribed) setObjectDetectorReady(false);
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
  const detectObjects = useCallback(() => {
    if (!isCameraReady || !videoRef.current || !detectorRef.current) {
      if (isCameraReady) {
        animFrameIdRef.current = requestAnimationFrame(detectObjects);
      }
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
      animFrameIdRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    const now = performance.now();
    if (now - lastDetectTimeRef.current >= 200) {
      lastDetectTimeRef.current = now;

      const nowMs = Math.round(now);
      const timestampMs = Math.max(nowMs, lastTimestampMsRef.current + 2);
      lastTimestampMsRef.current = timestampMs;

      try {
        const result = detectorRef.current.detectForVideo(video, timestampMs);
        const detections = result.detections || [];

        const items = [];
        for (const det of detections) {
          const cat = det.categories?.[0];
          if (!cat) continue;

          const label = cat.categoryName?.toLowerCase() || '';
          if (label === 'person') continue; // Handled by FaceLandmarker

          const bbox = det.boundingBox;
          if (!bbox) continue;

          const emoji = ITEM_EMOJIS[label] || '📦';
          const scorePercent = Math.round((cat.score || 0) * 100);

          items.push({
            id: label + '-' + Math.round(bbox.originX),
            label,
            displayName: label.charAt(0).toUpperCase() + label.slice(1),
            emoji,
            score: scorePercent,
            boundingBox: {
              originX: Math.max(0, bbox.originX),
              originY: Math.max(0, bbox.originY),
              width: Math.min(video.videoWidth - bbox.originX, bbox.width),
              height: Math.min(video.videoHeight - bbox.originY, bbox.height),
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            }
          });
        }

        setDetectedObjects(items);

        // Announce prominent detected item
        if (items.length > 0) {
          const topItem = items[0];
          const timeSinceLastAnnounce = Date.now() - lastAnnounceTimeRef.current;

          if (topItem.label !== lastAnnouncedItemRef.current || timeSinceLastAnnounce > 6000) {
            lastAnnouncedItemRef.current = topItem.label;
            lastAnnounceTimeRef.current = Date.now();

            const phrase = ITEM_ANNOUNCEMENTS[topItem.label] || `${topItem.displayName} detected!`;
            setLatestItemAnnouncement(`${topItem.emoji} ${phrase}`);
            speechSpeaker.speak(phrase);

            if (topItem.label === 'cell phone' && onPhoneDetected) {
              onPhoneDetected();
            }
          }
        }
      } catch (err) {
        // Non-blocking error handling
      }
    }

    animFrameIdRef.current = requestAnimationFrame(detectObjects);
  }, [isCameraReady, videoRef, onPhoneDetected]);

  useEffect(() => {
    if (isCameraReady && objectDetectorReady) {
      animFrameIdRef.current = requestAnimationFrame(detectObjects);
    } else {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      setDetectedObjects([]);
      setLatestItemAnnouncement('');
    }

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isCameraReady, objectDetectorReady, detectObjects]);

  return {
    objectDetectorReady,
    detectedObjects,
    latestItemAnnouncement
  };
}
