// src/components/SessionTimer.jsx
// Displays active session timer, total focused time, and distracted time counters.

import React from 'react';
import { Clock, CheckCircle2, AlertOctagon } from 'lucide-react';

export function SessionTimer({ totalTime, focusedTime, distractedTime }) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const focusPercentage =
    totalTime > 0 ? Math.round((focusedTime / totalTime) * 100) : 100;

  return (
    <div className="card timer-card">
      <h3 className="section-title">Session Statistics</h3>

      <div className="timer-display-main">
        <Clock size={28} className="timer-icon" />
        <div className="timer-info">
          <span className="timer-label">Total Session Time</span>
          <span className="timer-value">{formatTime(totalTime)}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box stat-focused">
          <CheckCircle2 size={20} className="stat-icon" />
          <div className="stat-details">
            <span className="stat-label">Focused Time</span>
            <span className="stat-value">{formatTime(focusedTime)}</span>
          </div>
        </div>

        <div className="stat-box stat-distracted">
          <AlertOctagon size={20} className="stat-icon" />
          <div className="stat-details">
            <span className="stat-label">Distracted Time</span>
            <span className="stat-value">{formatTime(distractedTime)}</span>
          </div>
        </div>
      </div>

      {totalTime > 0 && (
        <div className="focus-progress-wrapper">
          <div className="progress-label">
            <span>Focus Score</span>
            <span>{focusPercentage}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${focusPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
