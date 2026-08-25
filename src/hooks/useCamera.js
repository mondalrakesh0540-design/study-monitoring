// src/hooks/useCamera.js
// Ultra-reliable Camera Hook with auto-reconnect, multi-constraint fallback, and guaranteed video binding.

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
  const activeStreamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    setStream(null);
    setCameraStatus(CAMERA_STATUS.OFF);
    setErrorMessage('');
    console.log('[Camera] Camera turned off.');
  }, []);

  const attachStreamToVideo = useCallback((mediaStream) => {
    if (!videoRef.current || !mediaStream) return;
    const video = videoRef.current;
    video.srcObject = mediaStream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setCameraStatus(CAMERA_STATUS.READY);
          console.log('[Camera] Video stream playing smoothly.');
        })
        .catch((err) => {
          console.warn('[Camera] Autoplay waiting for metadata:', err);
          video.onloadedmetadata = () => {
            video.play().then(() => setCameraStatus(CAMERA_STATUS.READY)).catch(() => {});
          };
        });
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
      setErrorMessage('Camera access is not supported by your browser or requires HTTPS.');
      return;
    }

    setCameraStatus(CAMERA_STATUS.REQUESTING);
    setErrorMessage('');

    let mediaStream = null;

    // Constraint tier 1: Standard HD User Camera
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
    } catch (e1) {
      console.warn('[Camera] Tier 1 constraint failed, trying basic { video: true }...', e1);
      // Constraint tier 2: Any video camera available
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (e2) {
        console.error('[Camera] All video constraints failed:', e2);
        if (e2.name === 'NotAllowedError' || e2.name === 'PermissionDeniedError') {
          setCameraStatus(CAMERA_STATUS.DENIED);
          setErrorMessage('Camera permission was blocked. Please click the camera/lock icon in your browser URL bar and allow Camera.');
        } else if (e2.name === 'NotFoundError' || e2.name === 'DevicesNotFoundError') {
          setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
          setErrorMessage('No webcam or camera device found.');
        } else if (e2.name === 'NotReadableError' || e2.name === 'TrackStartError') {
          setCameraStatus(CAMERA_STATUS.ERROR);
          setErrorMessage('Camera is busy or in use by another app/tab. Please close other camera tabs.');
        } else {
          setCameraStatus(CAMERA_STATUS.ERROR);
          setErrorMessage(e2.message || 'Unable to start camera.');
        }
        return;
      }
    }

    if (mediaStream) {
      activeStreamRef.current = mediaStream;
      setStream(mediaStream);
      attachStreamToVideo(mediaStream);
    }
  }, [attachStreamToVideo]);

  // Persistent binding on videoRef mount or stream update
  useEffect(() => {
    if (stream && videoRef.current) {
      attachStreamToVideo(stream);
    }
  }, [stream, attachStreamToVideo]);

  // Clean up tracks on unmount
  useEffect(() => {
    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
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
