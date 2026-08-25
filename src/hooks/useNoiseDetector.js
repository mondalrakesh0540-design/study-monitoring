// src/hooks/useNoiseDetector.js
// Custom React hook to monitor ambient environmental noise and talking in real-time.
// Features adaptive noise baseline and sensitivity control.

import { useState, useEffect, useRef, useCallback } from 'react';

export function useNoiseDetector({ isMonitoring, isCameraReady, sensitivity = 50 }) {
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isLoudNoise, setIsLoudNoise] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [noiseState, setNoiseState] = useState('Quiet 🤫');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const loudNoiseCountRef = useRef(0);
  const baselineRef = useRef(5);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);
      console.log('[NoiseDetector] Ambient microphone monitor active.');
    } catch (e) {
      console.warn('[NoiseDetector] Microphone access denied or unavailable:', e);
      setMicActive(false);
    }
  }, []);

  const stopMic = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicActive(false);
    setNoiseLevel(0);
    setIsLoudNoise(false);
    setNoiseState('Quiet 🤫');
    loudNoiseCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (isMonitoring && isCameraReady) {
      startMic();
    } else {
      stopMic();
    }

    return () => {
      stopMic();
    };
  }, [isMonitoring, isCameraReady, startMic, stopMic]);

  // Audio level polling & adaptive state classification
  useEffect(() => {
    if (!micActive || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudio = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length; // 0 to 255
      const rawNormalized = Math.min(100, Math.round((avg / 110) * 100));

      // Adaptive baseline tracker
      baselineRef.current = baselineRef.current * 0.95 + rawNormalized * 0.05;
      const netLevel = Math.max(0, rawNormalized - Math.floor(baselineRef.current * 0.4));
      setNoiseLevel(rawNormalized);

      // Sensitivity factor
      const triggerThreshold = Math.max(25, 60 - Math.round((sensitivity / 100) * 30));

      // Noise States
      if (rawNormalized < 18) {
        setNoiseState('Quiet 🤫');
      } else if (rawNormalized < 38) {
        setNoiseState('Whisper / Ambient 🍃');
      } else if (rawNormalized < 65) {
        setNoiseState('Talking / Chatter 🗣️');
      } else {
        setNoiseState('Loud Noise / Shouting 📢');
      }

      // Trigger threshold checking
      if (rawNormalized > triggerThreshold) {
        loudNoiseCountRef.current += 1;
        if (loudNoiseCountRef.current >= 5) {
          setIsLoudNoise(true);
        }
      } else {
        loudNoiseCountRef.current = Math.max(0, loudNoiseCountRef.current - 1);
        if (loudNoiseCountRef.current === 0) {
          setIsLoudNoise(false);
        }
      }

      animFrameRef.current = requestAnimationFrame(checkAudio);
    };

    animFrameRef.current = requestAnimationFrame(checkAudio);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [micActive, sensitivity]);

  return {
    noiseLevel,
    isLoudNoise,
    noiseState,
    micActive
  };
}
