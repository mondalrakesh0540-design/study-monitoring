// src/hooks/useCamera.js
// Custom React hook to manage webcam streams, permissions, and status.

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

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus(CAMERA_STATUS.OFF);
    setErrorMessage('');
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
      setErrorMessage('Browser does not support camera access or context is insecure (requires HTTPS or localhost).');
      return;
    }

    setCameraStatus(CAMERA_STATUS.REQUESTING);
    setErrorMessage('');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
        };
      }
      setCameraStatus(CAMERA_STATUS.READY);
    } catch (error) {
      console.error('Camera Access Error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraStatus(CAMERA_STATUS.DENIED);
        setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraStatus(CAMERA_STATUS.NOT_AVAILABLE);
        setErrorMessage('No webcam device was found on your system.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraStatus(CAMERA_STATUS.ERROR);
        setErrorMessage('Camera is currently in use by another application or hardware error occurred.');
      } else {
        setCameraStatus(CAMERA_STATUS.ERROR);
        setErrorMessage(error.message || 'Failed to start camera feed.');
      }
    }
  }, []);

  // Cleanup tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
