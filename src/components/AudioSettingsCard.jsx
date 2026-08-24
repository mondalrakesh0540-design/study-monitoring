// src/components/AudioSettingsCard.jsx
// Component allowing users to upload, test, and manage custom MP3 alert sounds for each event.

import React, { useState } from 'react';
import { Music, Upload, Play, RotateCcw, Check } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

export function AudioSettingsCard() {
  const [customTracks, setCustomTracks] = useState({});
  const [playingEvent, setPlayingEvent] = useState(null);

  const eventTypes = [
    { key: 'start-study', label: 'Start Study Sound' },
    { key: 'tab-change', label: 'Tab Change Alert' },
    { key: 'face-missing', label: 'Face Missing Alert' },
    { key: 'distracted', label: 'Distraction / Phone Alert' },
    { key: 'back-to-study', label: 'Back to Study Chime' }
  ];

  const handleFileChange = (eventType, e) => {
    const file = e.target.files[0];
    if (file) {
      audioManager.setCustomAudioTrack(eventType, file);
      setCustomTracks((prev) => ({
        ...prev,
        [eventType]: file.name
      }));
    }
  };

  const handleTestPlay = async (eventType) => {
    setPlayingEvent(eventType);
    const msg = audioManager.getFunnyMessage(eventType);
    await audioManager.playAudio(eventType, true, msg);
    setTimeout(() => setPlayingEvent(null), 2500);
  };

  const handleReset = (eventType) => {
    audioManager.removeCustomAudioTrack(eventType);
    setCustomTracks((prev) => {
      const next = { ...prev };
      delete next[eventType];
      return next;
    });
  };

  return (
    <div className="card audio-settings-card">
      <div className="card-header">
        <div className="header-title">
          <Music className="icon" />
          <h3 className="section-title">Custom Alert Audio Settings</h3>
        </div>
      </div>

      <p className="hint-text">
        Upload your own custom MP3 audio files to customize alert sounds!
      </p>

      <div className="audio-tracks-list">
        {eventTypes.map(({ key, label }) => {
          const customName = customTracks[key] || audioManager.getCustomAudioTrackName(key);
          const isTesting = playingEvent === key;

          return (
            <div key={key} className="audio-track-item">
              <div className="track-info">
                <span className="track-label">{label}</span>
                <span className="track-file-status">
                  {customName ? (
                    <span className="custom-active">
                      <Check size={12} /> {customName}
                    </span>
                  ) : (
                    <span className="default-active">Default Sound</span>
                  )}
                </span>
              </div>

              <div className="track-actions">
                <label className="btn btn-outline btn-sm upload-btn">
                  <Upload size={14} />
                  <span>Upload MP3</span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg"
                    onChange={(e) => handleFileChange(key, e)}
                    style={{ display: 'none' }}
                  />
                </label>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleTestPlay(key)}
                  title="Test Sound"
                >
                  <Play size={14} className={isTesting ? 'playing-anim' : ''} />
                  <span>{isTesting ? 'Playing...' : 'Test'}</span>
                </button>

                {customName && (
                  <button
                    className="btn-icon text-muted"
                    onClick={() => handleReset(key)}
                    title="Reset to default sound"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
