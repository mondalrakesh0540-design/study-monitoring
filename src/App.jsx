// src/App.jsx
// FocusGuard AI - Modular Tab-Based Architecture:
// 1. 📊 Live Study Monitor
// 2. 📦 AI Item & Object Scanner
// 3. 📚 AI Study Guide & Rules
// 4. 🔥 18+ Spicy Meme Soundboard

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useObjectDetection } from './hooks/useObjectDetection';
import { useVisibilityMonitor } from './hooks/useVisibilityMonitor';
import { audioManager } from './utils/audioManager';

import { CameraMonitor } from './components/CameraMonitor';
import { StudyControls } from './components/StudyControls';
import { StatusPanel } from './components/StatusPanel';
import { SessionTimer } from './components/SessionTimer';
import { AlertHistory } from './components/AlertHistory';
import { MemeSoundboard } from './components/MemeSoundboard';
import { ItemDetectorPanel } from './components/ItemDetectorPanel';
import { StudyGuidePanel } from './components/StudyGuidePanel';

import { ShieldCheck, Heart, LayoutDashboard, Box, BookOpen, Flame } from 'lucide-react';
import './App.css';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('Not Started');
  const [funnyMessage, setFunnyMessage] = useState('');
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMutedState] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'scanner' | 'guide' | 'memes'

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
  const hasTriggeredAngryRef = useRef(false);
  const hasTriggeredShockedRef = useRef(false);

  const funnyMessageTimerRef = useRef(null);

  // Auto-clear funny message after 6 seconds
  const setFunnyMessageWithTimeout = useCallback((msg) => {
    setFunnyMessage(msg);
    if (funnyMessageTimerRef.current) clearTimeout(funnyMessageTimerRef.current);
    funnyMessageTimerRef.current = setTimeout(() => setFunnyMessage(''), 6000);
  }, []);

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

  // Camera Hook
  const {
    videoRef,
    cameraStatus,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
    isReady: isCameraReady
  } = useCamera();

  // Face Detection Hook with Full Facial Expression Analysis
  const {
    detectorReady: faceDetectorReady,
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
  } = useFaceDetection({ videoRef, isCameraReady, isMonitoring });

  // Object / Item Detection Hook (Phone, Book, Bottle, Cup, etc. with Voice Announcement)
  const handlePhoneDetected = useCallback(() => {
    if (isMonitoring) {
      setSessionStatus('Distracted');
      setFunnyMessageWithTimeout('Phone Detected! Chal Bhosdike phone hata aur padhai kar!');
      audioManager.playAudio('chal-bsdk-meme', false);
      addEvent('phone-detected', '📱 Phone Detected', 'Phone spotted in front of camera!');
    }
  }, [isMonitoring, addEvent, setFunnyMessageWithTimeout]);

  const {
    objectDetectorReady,
    detectedObjects,
    latestItemAnnouncement
  } = useObjectDetection({
    videoRef,
    isCameraReady,
    isMonitoring,
    onPhoneDetected: handlePhoneDetected
  });

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

  // Wrapped startCamera that unlocks AudioContext
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
    hasTriggeredAngryRef.current = false;
    hasTriggeredShockedRef.current = false;

    const msg = audioManager.getFunnyMessage('start-study');
    setFunnyMessageWithTimeout(msg);
    audioManager.playAudio('start-study', true);
    addEvent('start-study', 'Modi Ji: Study Started', 'Monitoring initiated with 18+ meme pack & object detector.');
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
    hasTriggeredAngryRef.current = false;
    hasTriggeredShockedRef.current = false;
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
    addEvent('back-to-study', 'Shabash Beta: Maza Aaya', 'Returned to study browser tab.');
  }, [isMonitoring, addEvent, setFunnyMessageWithTimeout]);

  useVisibilityMonitor({
    isMonitoring,
    onTabChange: handleTabChange,
    onTabReturn: handleTabReturn
  });

  // Detection & Facial Expression State Machine Loop
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
          addEvent('distracted', 'Chal Bhosdike! (5s Distracted)', 'Eyes closed or looking away for 5 seconds!');
        }
      }
    }
    // 3. Yawn Detection (Puneet Superstar Chaate Marunga)
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
    // 4. Smile / Laughing Detection (Arnab Goswami / Tum Chutiya Ho)
    else if (isSmiling) {
      if (!hasTriggeredSmileRef.current) {
        hasTriggeredSmileRef.current = true;
        setSessionStatus('Smiling / Daydreaming');
        const msg = audioManager.getFunnyMessage('smile-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('smile-meme', false);
        addEvent('smile-meme', 'Arnab Goswami: Kuch Bhi?!', 'Smiling or laughing at screen!');
      }
    }
    // 5. Shocked / Surprised Expression (Arey Baap Re)
    else if (isShocked) {
      if (!hasTriggeredShockedRef.current) {
        hasTriggeredShockedRef.current = true;
        setSessionStatus('Shocked / Surprised');
        const msg = audioManager.getFunnyMessage('shocked-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('shocked-meme', false);
        addEvent('shocked-meme', 'Arey Baap Re! Ye Kya Dekh Liya', 'Shocked / Wide eyes expression detected!');
      }
    }
    // 6. Angry / Frowning Expression (Arpit Bala)
    else if (isAngry) {
      if (!hasTriggeredAngryRef.current) {
        hasTriggeredAngryRef.current = true;
        setSessionStatus('Angry / Frowning');
        const msg = audioManager.getFunnyMessage('angry-meme');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('angry-meme', false);
        addEvent('angry-meme', 'Arpit Bala: Gussa Aa Jata Hai', 'Angry / Frustrated expression detected!');
      }
    }
    // 7. Reset back to focused
    else if (isFaceDetected && !isDistracted && !isYawning && !isSmiling && !isAngry && !isShocked) {
      if (
        hasTriggeredFaceMissingRef.current ||
        hasTriggeredDistractedRef.current ||
        hasTriggeredSleepWarningRef.current ||
        hasTriggeredYawnRef.current ||
        hasTriggeredSmileRef.current ||
        hasTriggeredAngryRef.current ||
        hasTriggeredShockedRef.current
      ) {
        hasTriggeredSleepWarningRef.current = false;
        hasTriggeredFaceMissingRef.current = false;
        hasTriggeredDistractedRef.current = false;
        hasTriggeredYawnRef.current = false;
        hasTriggeredSmileRef.current = false;
        hasTriggeredAngryRef.current = false;
        hasTriggeredShockedRef.current = false;

        setSessionStatus('Focused');
        const msg = audioManager.getFunnyMessage('back-to-study');
        setFunnyMessageWithTimeout(msg);
        audioManager.playAudio('back-to-study', false);
        addEvent('back-to-study', 'Shabash Beta: Focus Restored', 'Back to focus!');
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
    isAngry,
    isShocked,
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
            currentStatus === 'Shocked / Surprised' ||
            currentStatus === 'Angry / Frowning'
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
              Face Expression, AI Item Recognition & 18+ Hindi Meme Study Monitor
            </p>
          </div>
        </div>
      </header>

      {/* Prominent Tab Navigation Bar */}
      <nav className="app-tab-nav">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>📹 Study Monitor</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <Box size={18} />
          <span>📦 Item Scanner</span>
          {detectedObjects.length > 0 && <span className="tab-badge">{detectedObjects.length}</span>}
        </button>

        <button
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <BookOpen size={18} />
          <span>📚 Study Guide</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'memes' ? 'active' : ''}`}
          onClick={() => setActiveTab('memes')}
        >
          <Flame size={18} />
          <span>🔞 18+ Memes</span>
        </button>
      </nav>

      {/* Main Content Rendered strictly according to selected tab */}
      <main className="dashboard-main-content">
        {/* TAB 1: LIVE STUDY MONITOR & CAMERA */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid tab-fade-in">
            <section className="dashboard-col left-col">
              <CameraMonitor
                videoRef={videoRef}
                cameraStatus={cameraStatus}
                errorMessage={cameraError || modelError}
                startCamera={handleStartCamera}
                stopCamera={stopCamera}
                isMonitoring={isMonitoring}
                faceBoundingBox={faceBoundingBox}
                expressionMood={expressionMood}
                detectedObjects={[]}
                latestItemAnnouncement=""
              />

              <StudyControls
                isCameraReady={isCameraReady}
                isMonitoring={isMonitoring}
                startStudy={startStudy}
                stopStudy={stopStudy}
                resetSession={resetSession}
              />
            </section>

            <section className="dashboard-col right-col">
              <StatusPanel
                sessionStatus={sessionStatus}
                funnyMessage={funnyMessage}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
                expressionMood={expressionMood}
                debugInfo={{
                  isFaceDetected,
                  missingDuration,
                  distractedDuration,
                  cameraStatus,
                  isMonitoring,
                  detectorReady: faceDetectorReady
                }}
              />

              <SessionTimer
                totalTime={totalTime}
                focusedTime={focusedTime}
                distractedTime={distractedTime}
              />

              <AlertHistory events={events} />
            </section>
          </div>
        )}

        {/* TAB 2: DEDICATED AI ITEM & OBJECT SCANNER */}
        {activeTab === 'scanner' && (
          <div className="dashboard-grid tab-fade-in">
            <section className="dashboard-col left-col">
              <CameraMonitor
                videoRef={videoRef}
                cameraStatus={cameraStatus}
                errorMessage={cameraError || modelError}
                startCamera={handleStartCamera}
                stopCamera={stopCamera}
                isMonitoring={isMonitoring}
                faceBoundingBox={null}
                expressionMood="Object Scanner Active"
                detectedObjects={detectedObjects}
                latestItemAnnouncement={latestItemAnnouncement}
              />
            </section>

            <section className="dashboard-col right-col">
              <ItemDetectorPanel
                detectedObjects={detectedObjects}
                latestItemAnnouncement={latestItemAnnouncement}
                objectDetectorReady={objectDetectorReady}
                isCameraReady={isCameraReady}
              />
            </section>
          </div>
        )}

        {/* TAB 3: DEDICATED STUDY GUIDE & RULES */}
        {activeTab === 'guide' && (
          <div className="tab-single-container tab-fade-in">
            <StudyGuidePanel />
          </div>
        )}

        {/* TAB 4: DEDICATED 18+ SPICY HINDI MEME SOUNDBOARD */}
        {activeTab === 'memes' && (
          <div className="tab-single-container tab-fade-in">
            <MemeSoundboard onTriggerMeme={(msg) => setFunnyMessageWithTimeout(msg)} />
          </div>
        )}
      </main>

      {/* Footer & Credits */}
      <footer className="app-footer">
        <p>FocusGuard AI • 100% Local Browser AI • Separate Dedicated Sections • Privacy First</p>
        <p className="app-credits">
          Developed by <strong>Rakesh</strong> and Collaborated with <strong>Ani (main developer)</strong> <Heart size={14} className="heart-icon" />
        </p>
      </footer>
    </div>
  );
}
