// src/App.jsx
// FocusGuard AI - Smart Webcam Study & Meme Monitoring System

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useVisibilityMonitor } from './hooks/useVisibilityMonitor';
import { useNoiseDetector } from './hooks/useNoiseDetector';
import { audioManager } from './utils/audioManager';

import { CameraMonitor } from './components/CameraMonitor';
import { StudyControls } from './components/StudyControls';
import { StatusPanel } from './components/StatusPanel';
import { SessionTimer } from './components/SessionTimer';
import { AlertHistory } from './components/AlertHistory';
import { MemeSoundboard } from './components/MemeSoundboard';

import { ShieldCheck, Heart } from 'lucide-react';
import './App.css';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('Not Started');
  const [funnyMessage, setFunnyMessage] = useState('');
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMutedState] = useState(false);

  // Timers State
  const [totalTime, setTotalTime] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [distractedTime, setDistractedTime] = useState(0);

  // Activity Event Log (Max 10)
  const [events, setEvents] = useState([]);

  // Trigger state refs
  const hasTriggeredSleepWarningRef = useRef(false);
  const hasTriggeredFaceMissingRef = useRef(false);
  const hasTriggeredDistractedRef = useRef(false);
  const hasTriggeredYawnRef = useRef(false);
  const hasTriggeredSmileRef = useRef(false);
  const hasTriggeredNoiseRef = useRef(false);

  const funnyMessageTimerRef = useRef(null);

  // Auto-clear funny message after 6 seconds
  const setFunnyMessageWithTimeout = useCallback((msg) => {
    setFunnyMessage(msg);
    if (funnyMessageTimerRef.current) clearTimeout(funnyMessageTimerRef.current);
    funnyMessageTimerRef.current = setTimeout(() => setFunnyMessage(''), 6000);
  }, []);

  // Camera Hook
  const {
    videoRef,
    cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
    isReady: isCameraReady
  } = useCamera();

  // Face Detection Hook with Expressions (Yawn / Smile / Mood)
  const {
    detectorReady,
    modelError,
    isFaceDetected,
    missingDuration,
    isDistracted,
    distractedDuration,
    faceBoundingBox,
    isYawning,
    isSmiling,
    expressionMood
  } = useFaceDetection({ videoRef, isCameraReady, isMonitoring });

  // Microphone Noise Detector Hook
  const { noiseLevel, isLoudNoise } = useNoiseDetector({ isMonitoring, isCameraReady });

  // Event Helper
  const addEvent = useCallback((type, title, message) => {
    const newEvent = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, 10));
  }, []);

  // Audio Controls
  const handleVolumeChange = (newVol) => {
    setVolumeState(newVol);
    audioManager.setVolume(newVol);
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    audioManager.setMute(nextMuted);
  };

  // Wrapped startCamera that also unlocks AudioContext
  const handleStartCamera = useCallback(async () => {
    await audioManager.unlockAudioContext();
    startCamera();
  }, [startCamera]);

  // Start Study Session
  const startStudy = async () => {
    if (!isCameraReady) return;
    await audioManager.unlockAudioContext();
    setIsMonitoring(true);
    setSessionStatus('Focused');

    hasTriggeredSleepWarningRef.current = false;
    hasTriggeredFaceMissingRef.current = false;
    hasTriggeredDistractedRef.current = false;
    hasTriggeredYawnRef.current = false;
    hasTriggeredSmileRef.current = false;
    hasTriggeredNoiseRef.current = false;

    const msg = audioManager.getFunnyMessage('start-study');
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('start-study', true);
    addEvent('start-study', 'Modi Ji: Session Started', 'Study session monitoring initiated.');
  };

  // Stop Study Session
  const stopStudy = () => {
    setIsMonitoring(false);
    setSessionStatus('Paused');
    setFunnyMessageWithTimeout('Study session paused.');
    audioManager.stopCurrent();
    addEvent('stop-study', 'Session Stopped', 'Monitoring paused by user.');
  };

  // Reset Session
  const resetSession = () => {
    setIsMonitoring(false);
    setSessionStatus('Not Started');
    setTotalTime(0);
    setFocusedTime(0);
    setDistractedTime(0);
    setEvents([]);
    setFunnyMessage('');
    hasTriggeredSleepWarningRef.current = false;
    hasTriggeredFaceMissingRef.current = false;
    hasTriggeredDistractedRef.current = false;
    hasTriggeredYawnRef.current = false;
    hasTriggeredSmileRef.current = false;
    hasTriggeredNoiseRef.current = false;
    audioManager.stopCurrent();
  };

  // Handle Tab Switch (Rahul Gandhi meme)
  const handleTabChange = useCallback(() => {
    if (!isMonitoring) return;
    setSessionStatus('Tab Changed');
    const msg = audioManager.getFunnyMessage('tab-change');
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('tab-change', false);
    addEvent('tab-change', 'Rahul Gandhi: Khatam Tata Bye Bye', 'Switched browser tab or minimized window!');
  }, [isMonitoring, addEvent, setFunnyMessageWithTimeout]);

  const handleTabReturn = useCallback(() => {
    if (!isMonitoring) return;
    setSessionStatus('Focused');
    const msg = audioManager.getFunnyMessage('back-to-study');
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('back-to-study', false);
    addEvent('back-to-study', 'Rahul Gandhi: Maza Aaya', 'Returned to study browser tab.');
  }, [isMonitoring, addEvent, setFunnyMessageWithTimeout]);

  useVisibilityMonitor({
    isMonitoring,
    onTabChange: handleTabChange,
    onTabReturn: handleTabReturn
  });

  // Main Detection Loop & Expression State Machine
  useEffect(() => {
    if (!isMonitoring) return;

    // 1. Deep Sleep Warning (30s+ - Mamata Khela Hobe)
    if (missingDuration >= 30 || distractedDuration >= 30) {
      if (!hasTriggeredSleepWarningRef.current) {
        hasTriggeredSleepWarningRef.current = true;
        setSessionStatus('Deep Sleep (30s+)');
        const msg = audioManager.getFunnyMessage('sleep-warning');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('sleep-warning', true);
        addEvent('sleep-warning', 'Momota: Khela Hobe (30s+ Sleep)', 'Sleeping or missing for 30+ seconds!');
      }
    }
    // 2. 5s Missing / Distracted
    else if (missingDuration >= 5 || distractedDuration >= 5) {
      if (!hasTriggeredFaceMissingRef.current && !hasTriggeredDistractedRef.current && !hasTriggeredSleepWarningRef.current) {
        if (missingDuration >= 5) {
          hasTriggeredFaceMissingRef.current = true;
          setSessionStatus('Face Not Detected');
          const msg = audioManager.getFunnyMessage('face-missing');
          setFunnyMessageWithTimeout(msg);
          audioManager.playAudio('face-missing', false);
          addEvent('face-missing', 'ACP Pradyuman: Kuch Toh Gadbad Hai', 'Face missing from camera for 5 seconds!');
        } else if (distractedDuration >= 5) {
          hasTriggeredDistractedRef.current = true;
          setSessionStatus('Light Sleep / Distracted (5s)');
          const msg = audioManager.getFunnyMessage('distracted');
          setFunnyMessageWithTimeout(msg);
          audioManager.playAudio('distracted', false);
          addEvent('distracted', 'Bhaiyaaaa! Alert (5s)', 'Eyes closed or head slumped for 5 seconds!');
        }
      }
    }
    // 3. Yawn Detection (Puneet Superstar meme)
    else if (isYawning) {
      if (!hasTriggeredYawnRef.current) {
        hasTriggeredYawnRef.current = true;
        setSessionStatus('Yawn Detected');
        const msg = audioManager.getFunnyMessage('yawn-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('yawn-meme', false);
        addEvent('yawn-meme', 'Puneet Superstar: Chaate Marunga', 'Yawn / Jhamai detected while studying!');
      }
    }
    // 4. Smile / Laughing Detection (Arnab Goswami meme)
    else if (isSmiling) {
      if (!hasTriggeredSmileRef.current) {
        hasTriggeredSmileRef.current = true;
        setSessionStatus('Smiling / Daydreaming');
        const msg = audioManager.getFunnyMessage('smile-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('smile-meme', false);
        addEvent('smile-meme', 'Arnab Goswami: Kuch Bhi?!', 'Smiling or laughing at phone / screen!');
      }
    }
    // 5. Loud Talking / Noise Detection (Baburao Chup meme)
    else if (isLoudNoise) {
      if (!hasTriggeredNoiseRef.current) {
        hasTriggeredNoiseRef.current = true;
        setSessionStatus('Loud Noise Detected');
        const msg = audioManager.getFunnyMessage('noise-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('noise-meme', false);
        addEvent('noise-meme', 'Baburao: Chup! Bilkul Chup!', 'Excessive noise / talking detected via mic!');
      }
    }
    // 6. Reset back to focused
    else if (isFaceDetected && !isDistracted && !isYawning && !isSmiling && !isLoudNoise) {
      if (hasTriggeredFaceMissingRef.current || hasTriggeredDistractedRef.current || hasTriggeredSleepWarningRef.current || hasTriggeredYawnRef.current || hasTriggeredSmileRef.current || hasTriggeredNoiseRef.current) {
        hasTriggeredSleepWarningRef.current = false;
        hasTriggeredFaceMissingRef.current = false;
        hasTriggeredDistractedRef.current = false;
        hasTriggeredYawnRef.current = false;
        hasTriggeredSmileRef.current = false;
        hasTriggeredNoiseRef.current = false;

        setSessionStatus('Focused');
        const msg = audioManager.getFunnyMessage('back-to-study');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('back-to-study', false);
        addEvent('back-to-study', 'Rahul Gandhi: Maza Aaya', 'Focus restored!');
      }
    }
  }, [
    isMonitoring,
    missingDuration,
    distractedDuration,
    isDistracted,
    isFaceDetected,
    isYawning,
    isSmiling,
    isLoudNoise,
    addEvent,
    setFunnyMessageWithTimeout
  ]);

  // Session Duration Timer Loop
  useEffect(() => {
    let interval = null;
    if (isMonitoring) {
      interval = setInterval(() => {
        setTotalTime((prev) => prev + 1);
        setSessionStatus((currentStatus) => {
          if (currentStatus === 'Focused' || currentStatus === 'Monitoring') {
            setFocusedTime((f) => f + 1);
          } else if (
            currentStatus === 'Distracted' ||
            currentStatus === 'Face Not Detected' ||
            currentStatus === 'Tab Changed' ||
            currentStatus === 'Deep Sleep (30s+)' ||
            currentStatus === 'Light Sleep / Distracted (5s)' ||
            currentStatus === 'Yawn Detected' ||
            currentStatus === 'Smiling / Daydreaming' ||
            currentStatus === 'Loud Noise Detected'
          ) {
            setDistractedTime((d) => d + 1);
          }
          return currentStatus;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <ShieldCheck className="logo-icon" size={36} />
          <div>
            <h1 className="app-title">FocusGuard AI</h1>
            <p className="app-subtitle">
              Indian Meme-Powered Smart Study & Webcam AI Monitor
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="dashboard-grid">
        {/* Left Column: Camera Preview & Study Controls */}
        <section className="dashboard-col left-col">
          <CameraMonitor
            videoRef={videoRef}
            cameraStatus={cameraStatus}
            errorMessage={cameraError || modelError}
            startCamera={handleStartCamera}
            stopCamera={stopCamera}
            isMonitoring={isMonitoring}
            faceBoundingBox={faceBoundingBox}
          />

          <StudyControls
            isCameraReady={isCameraReady}
            isMonitoring={isMonitoring}
            startStudy={startStudy}
            stopStudy={stopStudy}
            resetSession={resetSession}
          />

          {/* Interactive Live Meme Soundboard */}
          <MemeSoundboard onTriggerMeme={(msg) => setFunnyMessageWithTimeout(msg)} />
        </section>

        {/* Right Column: Status Banner, Timers, History */}
        <section className="dashboard-col right-col">
          <StatusPanel
            sessionStatus={sessionStatus}
            funnyMessage={funnyMessage}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            expressionMood={expressionMood}
            noiseLevel={noiseLevel}
            isLoudNoise={isLoudNoise}
            debugInfo={{
              isFaceDetected,
              missingDuration,
              distractedDuration,
              cameraStatus,
              isMonitoring,
              detectorReady
            }}
          />

          <SessionTimer
            totalTime={totalTime}
            focusedTime={focusedTime}
            distractedTime={distractedTime}
          />

          <AlertHistory events={events} />
        </section>
      </main>

      {/* Footer & Credits */}
      <footer className="app-footer">
        <p>FocusGuard AI • 100% Local Browser AI & Indian Meme Soundboard • Privacy First</p>
        <p className="app-credits">
          Developed by <strong>Rakesh</strong> and Collaborated with <strong>Ani (main developer)</strong> <Heart size={14} className="heart-icon" />
        </p>
      </footer>
    </div>
  );
}
