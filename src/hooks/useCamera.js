// src/hooks/useCamera.js
// Ultra-resilient React hook to manage webcam streams, multi-constraint fallback, permissions, and lifecycle.

import { useState, useRef, useCallback, useEffect } from 'react';

export const CAMERA_STATUS = {
  OFF: 'OFF',
  REQUESTING: 'REQUESTING',
  READY: 'READY',
  DENIED: 'DENIED',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  ERROR: 'ERROR'
};

export function useCamera() {
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.OFF);
  const [errorMessage, setErrorMessage] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    setStream(null);
    setCameraStatus(CAMERA_STATUS.OFF);
    setErrorMessage('');
    console.log('[Camera] Webcam stopped.');
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
      setErrorMessage('Browser does not support camera access or context is insecure (requires HTTPS).');
      return;
    }

    setCameraStatus(CAMERA_STATUS.REQUESTING);
    setErrorMessage('');

    let mediaStream = null;

    // 1. Try high-definition user-facing camera first
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: false
      });
    } catch (firstErr) {
      console.warn('[Camera] Ideal constraints failed, trying basic fallback { video: true }...', firstErr);
      // 2. Fallback to basic video constraint
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (fallbackErr) {
        console.error('[Camera] Access Error:', fallbackErr);
        if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
          setCameraStatus(CAMERA_STATUS.DENIED);
          setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings.');
        } else if (fallbackErr.name === 'NotFoundError' || fallbackErr.name === 'DevicesNotFoundError') {
          setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
          setErrorMessage('No camera device was found on your system.');
        } else if (fallbackErr.name === 'NotReadableError' || fallbackErr.name === 'TrackStartError') {
          setCameraStatus(CAMERA_STATUS.ERROR);
          setErrorMessage('Camera is currently in use by another app or browser tab. Please close other camera apps.');
        } else {
          setCameraStatus(CAMERA_STATUS.ERROR);
          setErrorMessage(fallbackErr.message || 'Failed to start camera feed.');
        }
        return;
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;

        const playVideo = async () => {
          try {
            await video.play();
            setCameraStatus(CAMERA_STATUS.READY);
            console.log('[Camera] Webcam stream playing successfully.');
          } catch (playErr) {
            console.warn('[Camera] video.play() waiting for metadata...', playErr);
          }
        };

        video.onloadedmetadata = playVideo;
        video.oncanplay = playVideo;
        playVideo();
      } else {
        setCameraStatus(CAMERA_STATUS.READY);
      }
    }
  }, []);

  // Ensure stream binding is maintained on re-renders
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch((e) => console.warn('[Camera] Play sync error:', e));
      }
    }
  }, [stream]);

  // Clean up tracks when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    cameraStatus,
    errorMessage,
    startCamera,
    stopCamera,
    isReady: cameraStatus === CAMERA_STATUS.READY
  };
}
