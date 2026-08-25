// src/components/StatusPanel.jsx
// Displays main session status, expression mood badge, noise level meter, meme card, audio controls, and debug panel.

import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldAlert, Bug, ChevronDown, ChevronUp, Mic, Smile } from 'lucide-react';

export function StatusPanel({
  sessionStatus,
  funnyMessage,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  debugInfo,
  expressionMood = 'Focused 🎯',
  noiseLevel = 0,
  isLoudNoise = false,
  noiseState = 'Quiet 🤫'
}) {
  const [showDebug, setShowDebug] = useState(false);

  const getStatusTheme = () => {
    switch (sessionStatus) {
      case 'Focused':
        return { color: 'green', text: '🟢 Focused & Studying', bgClass: 'status-focused' };
      case 'Face Not Detected':
        return { color: 'red', text: '🚨 Face Not Detected!', bgClass: 'status-alert' };
      case 'Distracted':
      case 'Light Sleep / Distracted (5s)':
        return { color: 'red', text: '⚠️ Distracted / Light Sleep', bgClass: 'status-alert' };
      case 'Deep Sleep (30s+)':
        return { color: 'red', text: '😴 Deep Sleep (30s+)', bgClass: 'status-alert' };
      case 'Yawn Detected':
        return { color: 'yellow', text: '🥱 Yawning / Jhamai Alert', bgClass: 'status-warning' };
      case 'Smiling / Daydreaming':
        return { color: 'yellow', text: '😂 Smiling / Daydreaming', bgClass: 'status-warning' };
      case 'Loud Noise Detected':
        return { color: 'red', text: '📢 Noise / Talking Detected!', bgClass: 'status-alert' };
      case 'Tab Changed':
        return { color: 'yellow', text: '👀 Tab Switched / Window Blur', bgClass: 'status-warning' };
      case 'Paused':
        return { color: 'yellow', text: '⏸️ Session Paused', bgClass: 'status-paused' };
      case 'Monitoring':
        return { color: 'green', text: '🔍 Monitoring Active', bgClass: 'status-focused' };
      default:
        return { color: 'gray', text: '⚪ Session Not Started', bgClass: 'status-idle' };
    }
  };

  const theme = getStatusTheme();

  return (
    <div className="card status-card">
      <div className="card-header">
        <h3 className="section-title">Focus Status & Alerts</h3>

        <div className="audio-controls">
          <button
            className="btn-icon"
            onClick={onMuteToggle}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            title="Audio Volume"
          />
        </div>
      </div>

      {/* Main Large Status Badge */}
      <div className={`large-status-banner ${theme.bgClass}`}>
        <span className="status-text">{theme.text}</span>
      </div>

      {/* Live Mood & Noise Indicators */}
      <div className="indicators-row">
        <div className="indicator-pill mood-pill">
          <Smile size={16} className="indicator-icon" />
          <span className="indicator-label">Live Expression:</span>
          <span className="indicator-val">{expressionMood}</span>
        </div>

        <div className={`indicator-pill noise-pill ${isLoudNoise ? 'noise-alert-pill' : ''}`}>
          <Mic size={16} className="indicator-icon" />
          <span className="indicator-label">Room Sound:</span>
          <span className="indicator-val">{noiseState} ({noiseLevel}%)</span>
          <div className="mini-noise-bar">
            <div className="mini-noise-fill" style={{ width: `${Math.min(100, noiseLevel * 2)}%` }} />
          </div>
        </div>
      </div>

      {/* Funny Meme / Warning Alert Area */}
      {funnyMessage && (
        <div className="funny-message-box">
          <div className="meme-icon-pulse">😂</div>
          <div className="message-content">
            <div className="meme-header-row">
              <span className="message-title">🔥 HINDI MEME ALERT:</span>
            </div>
            <p className="message-body">"{funnyMessage}"</p>
          </div>
        </div>
      )}

      {/* Debug Panel Toggle */}
      <div className="debug-toggle-wrapper">
        <button
          className="btn-debug-toggle"
          onClick={() => setShowDebug(!showDebug)}
        >
          <Bug size={16} />
          <span>{showDebug ? 'Hide Debug Diagnostics' : 'Show Debug Diagnostics'}</span>
          {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expandable Debug Panel */}
      {showDebug && (
        <div className="debug-panel">
          <h4 className="debug-title">System Debug Diagnostics</h4>
          <div className="debug-grid">
            <div className="debug-item">
              <span className="label">Face Detected:</span>
              <span className={`val ${debugInfo.isFaceDetected ? 'val-yes' : 'val-no'}`}>
                {debugInfo.isFaceDetected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="debug-item">
              <span className="label">Expression Mood:</span>
              <span className="val">{expressionMood}</span>
            </div>
            <div className="debug-item">
              <span className="label">Missing Duration:</span>
              <span className="val">{debugInfo.missingDuration}s</span>
            </div>
            <div className="debug-item">
              <span className="label">Distracted Duration:</span>
              <span className="val">{debugInfo.distractedDuration}s</span>
            </div>
            <div className="debug-item">
              <span className="label">Noise Level:</span>
              <span className="val">{noiseLevel}%</span>
            </div>
            <div className="debug-item">
              <span className="label">MediaPipe Model:</span>
              <span className={`val ${debugInfo.detectorReady ? 'val-yes' : 'val-no'}`}>
                {debugInfo.detectorReady ? 'Ready' : 'Not Loaded'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
