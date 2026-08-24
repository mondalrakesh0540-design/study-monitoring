// src/App.jsx
// FocusGuard AI - Main Application Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useVisibilityMonitor } from './hooks/useVisibilityMonitor';
import { audioManager } from './utils/audioManager';

import { CameraMonitor } from './components/CameraMonitor';
import { StudyControls } from './components/StudyControls';
import { StatusPanel } from './components/StatusPanel';
import { SessionTimer } from './components/SessionTimer';
import { AlertHistory } from './components/AlertHistory';

import { ShieldCheck, Sparkles } from 'lucide-react';
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

  // Trigger state refs to prevent infinite React re-renders
  const hasTriggeredSleepWarningRef = useRef(false);
  const hasTriggeredFaceMissingRef = useRef(false);
  const hasTriggeredDistractedRef = useRef(false);

  // Camera Hook
  const {
    videoRef,
    cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
    isReady: isCameraReady
  } = useCamera();

  // Face Detection Hook
  const {
    detectorReady,
    modelError,
    isFaceDetected,
    missingDuration,
    isDistracted,
    distractedDuration,
    faceBoundingBox
  } = useFaceDetection({ videoRef, isCameraReady, isMonitoring });

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

  // Start Study Session
  const startStudy = () => {
    if (!isCameraReady) return;
    setIsMonitoring(true);
    setSessionStatus('Focused');

    hasTriggeredSleepWarningRef.current = false;
    hasTriggeredFaceMissingRef.current = false;
    hasTriggeredDistractedRef.current = false;

    const msg = audioManager.getFunnyMessage('start-study');
    setFunnyMessage(msg);
    audioManager.playAudio('start-study', true, msg);
    addEvent('start-study', 'Session Started', 'Study session monitoring initiated.');
  };

  // Stop Study Session
  const stopStudy = () => {
    setIsMonitoring(false);
    setSessionStatus('Paused');
    setFunnyMessage('Study session paused.');
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
    audioManager.stopCurrent();
  };

  // Handle Tab Switch
  const handleTabChange = useCallback(() => {
    if (!isMonitoring) return;
    setSessionStatus('Tab Changed');
    const msg = audioManager.getFunnyMessage('tab-change');
    setFunnyMessage(msg);
    audioManager.playAudio('tab-change', false, msg);
    addEvent('tab-change', 'Tab Changed', 'Switched browser tab or minimized window!');
  }, [isMonitoring, addEvent]);

  const handleTabReturn = useCallback(() => {
    if (!isMonitoring) return;
    setSessionStatus('Focused');
    const msg = audioManager.getFunnyMessage('back-to-study');
    setFunnyMessage(msg);
    audioManager.playAudio('back-to-study', false, msg);
    addEvent('back-to-study', 'User Returned', 'Returned to study browser tab.');
  }, [isMonitoring, addEvent]);

  useVisibilityMonitor({
    isMonitoring,
    onTabChange: handleTabChange,
    onTabReturn: handleTabReturn
  });

  // Face missing / distraction / sleep monitoring state machine
  useEffect(() => {
    if (!isMonitoring) return;

    if (missingDuration >= 30 || distractedDuration >= 30) {
      if (!hasTriggeredSleepWarningRef.current) {
        hasTriggeredSleepWarningRef.current = true;
        setSessionStatus('Face Not Detected');
        const msg = audioManager.getFunnyMessage('sleep-warning');
        setFunnyMessage(msg);
        audioManager.playAudio('sleep-warning', true, msg);
        addEvent('face-missing', 'Extended Sleep/Missing (30s+)', 'No face or eyes closed for 30+ seconds!');
      }
    } else if (missingDuration >= 5) {
      if (!hasTriggeredFaceMissingRef.current) {
        hasTriggeredFaceMissingRef.current = true;
        setSessionStatus('Face Not Detected');
        const msg = audioManager.getFunnyMessage('face-missing');
        setFunnyMessage(msg);
        audioManager.playAudio('face-missing', false, msg);
        addEvent('face-missing', 'Face Missing / Covered', 'Face covered by book or missing from camera!');
      }
    } else if (isDistracted) {
      if (!hasTriggeredDistractedRef.current) {
        hasTriggeredDistractedRef.current = true;
        setSessionStatus('Distracted');
        const msg = audioManager.getFunnyMessage('distracted');
        setFunnyMessage(msg);
        audioManager.playAudio('distracted', false, msg);
        addEvent('distracted', 'Distraction / Phone', 'Student looking away or at phone for 3+ seconds!');
      }
    } else if (isFaceDetected && !isDistracted) {
      if (hasTriggeredFaceMissingRef.current || hasTriggeredDistractedRef.current || hasTriggeredSleepWarningRef.current) {
        hasTriggeredSleepWarningRef.current = false;
        hasTriggeredFaceMissingRef.current = false;
        hasTriggeredDistractedRef.current = false;
        setSessionStatus('Focused');
        const msg = audioManager.getFunnyMessage('back-to-study');
        setFunnyMessage(msg);
        audioManager.playAudio('back-to-study', false, msg);
        addEvent('back-to-study', 'User Returned', 'Face detected and focus restored!');
      }
    }
  }, [isMonitoring, missingDuration, distractedDuration, isDistracted, isFaceDetected, addEvent]);

  // Session Duration Timer Loop
  useEffect(() => {
    let interval = null;
    if (isMonitoring) {
      interval = setInterval(() => {
        setTotalTime((prev) => prev + 1);
        setSessionStatus((currentStatus) => {
          if (currentStatus === 'Focused' || currentStatus === 'Monitoring') {
            setFocusedTime((f) => f + 1);
          } else if (currentStatus === 'Distracted' || currentStatus === 'Face Not Detected' || currentStatus === 'Tab Changed') {
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
              Funny AI-Powered Study & Webcam Monitor <Sparkles size={14} inline="true" />
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
            startCamera={startCamera}
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

      {/* Footer */}
      <footer className="app-footer">
        <p>FocusGuard AI • 100% Local Browser Detection • Privacy First</p>
      </footer>
    </div>
  );
}
