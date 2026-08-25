// src/hooks/useNoiseDetector.js
// Custom React hook to monitor ambient environmental noise and talking in real-time.

import { useState, useEffect, useRef, useCallback } from 'react';

export function useNoiseDetector({ isMonitoring, isCameraReady }) {
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isLoudNoise, setIsLoudNoise] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [noiseState, setNoiseState] = useState('Quiet 🤫');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const loudNoiseCountRef = useRef(0);

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
      analyser.smoothingTimeConstant = 0.4;
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

  // Audio level polling & state classification
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
      const normalized = Math.min(100, Math.round((avg / 120) * 100));
      setNoiseLevel(normalized);

      // Noise States
      if (normalized < 20) {
        setNoiseState('Quiet 🤫');
      } else if (normalized < 45) {
        setNoiseState('Whisper / Ambient 🍃');
      } else if (normalized < 70) {
        setNoiseState('Talking / Chatter 🗣️');
      } else {
        setNoiseState('Loud Shouting 📢');
      }

      // Trigger threshold (> 40% sustained)
      if (normalized > 40) {
        loudNoiseCountRef.current += 1;
        if (loudNoiseCountRef.current >= 6) {
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
  }, [micActive]);

  return {
    noiseLevel,
    isLoudNoise,
    noiseState,
    micActive
  };
}
