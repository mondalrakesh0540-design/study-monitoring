// src/components/ItemDetectorPanel.jsx
// Dedicated Section for AI Object & Study Material Scanner

import React, { useState } from 'react';
import { Box, Volume2, VolumeX, ShieldAlert, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export function ItemDetectorPanel({
  detectedObjects = [],
  latestItemAnnouncement = '',
  objectDetectorReady = false,
  isCameraReady = false
}) {
  const [voiceMuted, setVoiceMuted] = useState(false);

  const distractionItems = detectedObjects.filter(
    (obj) => obj.label === 'cell phone' || obj.label === 'tv' || obj.label === 'remote'
  );
  const studyItems = detectedObjects.filter(
    (obj) => obj.label !== 'cell phone' && obj.label !== 'tv' && obj.label !== 'remote'
  );

  return (
    <div className="card item-detector-card">
      <div className="card-header">
        <div className="header-title">
          <Box className="icon text-cyan" size={20} />
          <h3>📦 AI Item & Study Material Scanner</h3>
        </div>
        <span className={`status-badge ${objectDetectorReady ? 'badge-ready' : 'badge-warning'}`}>
          {objectDetectorReady ? '⚡ AI Scanner Active' : '⏳ Loading Scanner...'}
        </span>
      </div>

      <p className="item-detector-subtitle">
        Hold any item (Phone, Book, Bottle, Cup, Laptop, Scissors) before the camera. AI will detect and announce it!
      </p>

      {/* Voice Announcement Banner */}
      {latestItemAnnouncement ? (
        <div className="latest-announcement-box">
          <Sparkles className="announcement-icon" size={18} />
          <div className="announcement-content">
            <span className="announcement-title">LIVE AI RECOGNITION:</span>
            <p className="announcement-text">{latestItemAnnouncement}</p>
          </div>
        </div>
      ) : (
        <div className="scanner-idle-box">
          <span>{isCameraReady ? '👀 Camera active: Hold up an item to scan!' : '📷 Start camera to begin item detection'}</span>
        </div>
      )}

      {/* Categorized Detected Items Grid */}
      <div className="detected-items-section">
        {distractionItems.length > 0 && (
          <div className="distraction-alert-group">
            <div className="group-header text-red">
              <AlertCircle size={16} />
              <span>Distraction Items Detected:</span>
            </div>
            <div className="items-chips-grid">
              {distractionItems.map((item, idx) => (
                <div key={item.id || idx} className="item-chip chip-danger">
                  <span className="chip-emoji">{item.emoji}</span>
                  <span className="chip-name">{item.displayName}</span>
                  <span className="chip-score">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {studyItems.length > 0 && (
          <div className="study-items-group">
            <div className="group-header text-cyan">
              <CheckCircle2 size={16} />
              <span>Recognized Items / Materials:</span>
            </div>
            <div className="items-chips-grid">
              {studyItems.map((item, idx) => (
                <div key={item.id || idx} className="item-chip chip-success">
                  <span className="chip-emoji">{item.emoji}</span>
                  <span className="chip-name">{item.displayName}</span>
                  <span className="chip-score">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {detectedObjects.length === 0 && isCameraReady && (
          <div className="no-items-placeholder">
            <span>No external objects currently in front of camera.</span>
          </div>
        )}
      </div>

      {/* Supported Items Quick List */}
      <div className="supported-items-footer">
        <span className="supported-title">Common Recognized Items:</span>
        <div className="supported-tags">
          <span className="tag">📱 Phone</span>
          <span className="tag">📖 Book</span>
          <span className="tag">🍼 Bottle</span>
          <span className="tag">☕ Cup/Mug</span>
          <span className="tag">💻 Laptop</span>
          <span className="tag">✂️ Scissors</span>
          <span className="tag">⏰ Clock</span>
          <span className="tag">🎒 Bag</span>
          <span className="tag">🍎 Apple</span>
        </div>
      </div>
    </div>
  );
}
