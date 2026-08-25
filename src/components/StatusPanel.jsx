// src/components/StatusPanel.jsx
// Displays main session status indicator, funny message alert card, audio controls, and debug panel.

import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldAlert, Bug, ChevronDown, ChevronUp } from 'lucide-react';

export function StatusPanel({
  sessionStatus,
  funnyMessage,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  debugInfo
}) {
  const [showDebug, setShowDebug] = useState(false);

  const getStatusTheme = () => {
    switch (sessionStatus) {
      case 'Focused':
        return { color: 'green', text: '🟢 Focused & Studying', bgClass: 'status-focused' };
      case 'Face Not Detected':
        return { color: 'red', text: '🚨 Face Not Detected!', bgClass: 'status-alert' };
      case 'Distracted':
        return { color: 'red', text: '⚠️ Distracted (Looking Away)', bgClass: 'status-alert' };
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

      {/* Funny Meme / Warning Alert Area */}
      {funnyMessage && (
        <div className="funny-message-box">
          <div className="meme-icon-pulse">😂</div>
          <div className="message-content">
            <div className="meme-header-row">
              <span className="message-title">🔥 STUDY MEME ALERT:</span>
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
          <span>{showDebug ? 'Hide Debug Panel' : 'Show Debug Panel'}</span>
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
              <span className="label">Missing Duration:</span>
              <span className="val">{debugInfo.missingDuration}s</span>
            </div>
            <div className="debug-item">
              <span className="label">Distracted Duration:</span>
              <span className="val">{debugInfo.distractedDuration}s</span>
            </div>
            <div className="debug-item">
              <span className="label">Camera Status:</span>
              <span className="val">{debugInfo.cameraStatus}</span>
            </div>
            <div className="debug-item">
              <span className="label">Monitoring State:</span>
              <span className="val">{debugInfo.isMonitoring ? 'Active' : 'Inactive'}</span>
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
