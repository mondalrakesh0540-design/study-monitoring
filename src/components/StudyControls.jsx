// src/components/StudyControls.jsx
// Control panel for starting, stopping, and resetting study sessions.

import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';

export function StudyControls({
  isCameraReady,
  isMonitoring,
  startStudy,
  stopStudy,
  resetSession
}) {
  return (
    <div className="card controls-card">
      <h3 className="section-title">Study Session Controls</h3>
      <div className="controls-button-group">
        {!isMonitoring ? (
          <button
            className="btn btn-success btn-lg"
            onClick={startStudy}
            disabled={!isCameraReady}
            title={!isCameraReady ? 'Turn on camera before starting study session' : 'Start Monitoring'}
          >
            <Play size={20} />
            Start Study
          </button>
        ) : (
          <button className="btn btn-danger btn-lg" onClick={stopStudy}>
            <Square size={20} />
            Stop Study
          </button>
        )}

        <button className="btn btn-outline" onClick={resetSession}>
          <RotateCcw size={18} />
          Reset Session
        </button>
      </div>

      {!isCameraReady && (
        <p className="hint-text">
          💡 Please start and grant camera permission before clicking Start Study.
        </p>
      )}
    </div>
  );
}
