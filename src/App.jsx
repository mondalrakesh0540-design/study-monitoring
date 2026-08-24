// src/App.jsx
// FocusGuard AI - Immersive Fullscreen Camera HUD Main Application Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera, CAMERA_STATUS } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useVisibilityMonitor } from './hooks/useVisibilityMonitor';
import { audioManager } from './utils/audioManager';

import {
  ShieldCheck,
  Heart,
  Camera,
  CameraOff,
  Play,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  Bug,
  History,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import './App.css';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('Not Started');
  const [funnyMessage, setFunnyMessage] = useState('');
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMutedState] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawer Toggles
  const [showHistory, setShowHistory] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Timers State
  const [totalTime, setTotalTime] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [distractedTime, setDistractedTime] = useState(0);

  // Activity Event Log (Max 10)
  const [events, setEvents] = useState([]);

  // Trigger state refs to prevent infinite React re-renders & handle 5s vs 30s sleep tiers
  const hasTriggeredSleepWarningRef = useRef(false);
  const hasTriggeredFaceMissingRef = useRef(false);
  const hasTriggeredDistractedRef = useRef(false);
  const funnyMessageTimerRef = useRef(null);

  // Auto-clear funny message after 6 seconds
  const setFunnyMessageWithTimeout = useCallback((msg) => {
    setFunnyMessageWithTimeout(msg);
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

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

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
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('start-study', true);
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
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('tab-change', false);
    addEvent('tab-change', 'Tab Changed', 'Switched browser tab or minimized window!');
  }, [isMonitoring, addEvent]);

  const handleTabReturn = useCallback(() => {
    if (!isMonitoring) return;
    setSessionStatus('Focused');
    const msg = audioManager.getFunnyMessage('back-to-study');
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('back-to-study', false);
    addEvent('back-to-study', 'User Returned', 'Returned to study browser tab.');
  }, [isMonitoring, addEvent]);

  useVisibilityMonitor({
    isMonitoring,
    onTabChange: handleTabChange,
    onTabReturn: handleTabReturn
  });

  // Face missing / distraction / 5s light sleep / 30s deep sleep monitoring state machine
  useEffect(() => {
    if (!isMonitoring) return;

    if (missingDuration >= 30 || distractedDuration >= 30) {
      if (!hasTriggeredSleepWarningRef.current) {
        hasTriggeredSleepWarningRef.current = true;
        setSessionStatus('Deep Sleep (30s+)');
        const msg = audioManager.getFunnyMessage('sleep-warning');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('sleep-warning', true);
        addEvent('face-missing', 'Deep Sleep Warning (30s+)', 'Eyes closed or sleeping for 30+ seconds continuously!');
      }
    } else if (missingDuration >= 5 || distractedDuration >= 5) {
      if (!hasTriggeredFaceMissingRef.current && !hasTriggeredDistractedRef.current && !hasTriggeredSleepWarningRef.current) {
        if (missingDuration >= 5) {
          hasTriggeredFaceMissingRef.current = true;
          setSessionStatus('Face Not Detected');
          const msg = audioManager.getFunnyMessage('face-missing');
          setFunnyMessageWithTimeout(msg);
          audioManager.playAudio('face-missing', false);
          addEvent('face-missing', 'Face Missing / Covered (5s)', 'Face covered by book or missing from camera!');
        } else if (distractedDuration >= 5) {
          hasTriggeredDistractedRef.current = true;
          setSessionStatus('Light Sleep / Distracted (5s)');
          const msg = audioManager.getFunnyMessage('distracted');
          setFunnyMessageWithTimeout(msg);
          audioManager.playAudio('distracted', false);
          addEvent('distracted', 'Light Sleep / Distraction (5s)', 'Eyes closed or head slumped for 5 seconds!');
        }
      }
    } else if (isFaceDetected && !isDistracted) {
      if (hasTriggeredFaceMissingRef.current || hasTriggeredDistractedRef.current || hasTriggeredSleepWarningRef.current) {
        hasTriggeredSleepWarningRef.current = false;
        hasTriggeredFaceMissingRef.current = false;
        hasTriggeredDistractedRef.current = false;
        setSessionStatus('Focused');
        const msg = audioManager.getFunnyMessage('back-to-study');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('back-to-study', false);
        addEvent('back-to-study', 'User Returned', 'Eyes open, focus restored!');
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
          } else if (currentStatus === 'Distracted' || currentStatus === 'Face Not Detected' || currentStatus === 'Tab Changed' || currentStatus === 'Deep Sleep (30s+)' || currentStatus === 'Light Sleep / Distracted (5s)') {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusTheme = () => {
    switch (sessionStatus) {
      case 'Focused':
        return { text: '🟢 Focused & Studying', bgClass: 'status-focused' };
      case 'Face Not Detected':
        return { text: '🚨 Face Missing / Covered', bgClass: 'status-alert' };
      case 'Light Sleep / Distracted (5s)':
        return { text: '⚠️ Light Sleep (5s)', bgClass: 'status-alert' };
      case 'Deep Sleep (30s+)':
        return { text: '🚨 Deep Sleep (30s+)', bgClass: 'status-alert' };
      case 'Tab Changed':
        return { text: '👀 Tab Switched', bgClass: 'status-warning' };
      case 'Paused':
        return { text: '⏸️ Session Paused', bgClass: 'status-paused' };
      default:
        return { text: '⚪ Session Ready', bgClass: 'status-idle' };
    }
  };

  const theme = getStatusTheme();

  // Bounding box overlay calculation
  const renderBoundingBox = () => {
    if (!isMonitoring || !faceBoundingBox || cameraStatus !== CAMERA_STATUS.READY) return null;
    const { originX, originY, width, height, videoWidth, videoHeight } = faceBoundingBox;
    if (!videoWidth || !videoHeight) return null;

    const leftPercent = ((videoWidth - originX - width) / videoWidth) * 100;
    const topPercent = (originY / videoHeight) * 100;
    const widthPercent = (width / videoWidth) * 100;
    const heightPercent = (height / videoHeight) * 100;

    return (
      <div
        className="face-bbox"
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`
        }}
      >
        <span className="bbox-label">Target Focused</span>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* LAYER 1: Fullscreen Camera Video Layer */}
      <div className="fullscreen-video-wrapper">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`webcam-video ${cameraStatus === CAMERA_STATUS.READY ? 'active' : 'inactive'}`}
        />

        {cameraStatus !== CAMERA_STATUS.READY && (
          <div className="video-placeholder">
            <CameraOff size={64} className="placeholder-icon" />
            <h2>
              {cameraStatus === CAMERA_STATUS.REQUESTING
                ? 'Requesting webcam access...'
                : 'Turn on Camera to start full-screen study monitoring'}
            </h2>
            {cameraError && <div className="error-alert">{cameraError}</div>}
          </div>
        )}

        {renderBoundingBox()}
      </div>

      {/* LAYER 2: Floating Heads-Up Display (HUD) */}
      <div className="hud-overlay-container">
        {/* Top Header Floating HUD Bar */}
        <header className="hud-top-bar">
          <div className="logo-container">
            <ShieldCheck className="logo-icon" size={28} />
            <h1 className="app-title">FocusGuard AI</h1>
          </div>

          <div className={`hud-status-banner ${theme.bgClass}`}>
            <span>{theme.text}</span>
          </div>

          <div className="header-right-actions">
            <div className="audio-controls">
              <button className="btn-icon" onClick={handleMuteToggle} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>

            <div className="drawer-toggle-btns">
              <button
                className="btn-icon"
                onClick={() => { setShowHistory(!showHistory); setShowDebug(false); }}
                title="Activity Log"
              >
                <History size={18} />
              </button>

              <button
                className="btn-icon"
                onClick={() => { setShowDebug(!showDebug); setShowHistory(false); }}
                title="Debug Diagnostics"
              >
                <Bug size={18} />
              </button>

              <button className="btn-icon" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Center Floating Funny Alert Box */}
        {funnyMessage && (
          <div className="hud-center-alert">
            <ShieldAlert className="message-icon" size={32} />
            <div>
              <span className="message-title">Guard Alert:</span>
              <p className="message-body">"{funnyMessage}"</p>
            </div>
          </div>
        )}

        {/* Bottom Floating Control Dock */}
        <footer className="hud-bottom-dock">
          <div className="dock-controls-group">
            {cameraStatus !== CAMERA_STATUS.READY ? (
              <button className="btn btn-primary" onClick={startCamera}>
                <Camera size={18} /> Start Camera
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={stopCamera} disabled={isMonitoring}>
                <CameraOff size={18} /> Stop Camera
              </button>
            )}

            {!isMonitoring ? (
              <button className="btn btn-success" onClick={startStudy} disabled={!isCameraReady}>
                <Play size={18} /> Start Study
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopStudy}>
                <Square size={18} /> Stop Session
              </button>
            )}

            <button className="btn btn-outline" onClick={resetSession}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div className="dock-timer-info">
            <div className="timer-pill">
              <Clock size={16} />
              <span>{formatTime(totalTime)}</span>
            </div>

            <div className="timer-pill focused">
              <CheckCircle2 size={16} />
              <span>{formatTime(focusedTime)}</span>
            </div>

            <div className="timer-pill distracted">
              <AlertOctagon size={16} />
              <span>{formatTime(distractedTime)}</span>
            </div>
          </div>

          <div className="hud-credits">
            <span>Dev by <strong>Rakesh</strong> & <strong>Ani (main developer)</strong> <Heart size={14} className="heart-icon" inline="true" /></span>
          </div>
        </footer>
      </div>

      {/* Floating Side Drawers for Debug / History */}
      {showDebug && (
        <div className="hud-drawer">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>System Diagnostics</h4>
          <div className="debug-grid">
            <div className="debug-item"><span className="label">Face:</span><span className={`val ${isFaceDetected ? 'val-yes' : 'val-no'}`}>{isFaceDetected ? 'Yes' : 'No'}</span></div>
            <div className="debug-item"><span className="label">Missing:</span><span className="val">{missingDuration}s</span></div>
            <div className="debug-item"><span className="label">Distracted:</span><span className="val">{distractedDuration}s</span></div>
            <div className="debug-item"><span className="label">Camera:</span><span className="val">{cameraStatus}</span></div>
            <div className="debug-item"><span className="label">Model:</span><span className={`val ${detectorReady ? 'val-yes' : 'val-no'}`}>{detectorReady ? 'Ready' : 'Loading'}</span></div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="hud-drawer">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Recent Alerts ({events.length}/10)</h4>
          {events.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No alerts logged yet.</p>
          ) : (
            <div className="history-list">
              {events.map((evt) => (
                <div key={evt.id} className="history-item">
                  <div>
                    <div style={{ fontWeight: 700 }}>{evt.title} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{evt.timestamp}</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{evt.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
