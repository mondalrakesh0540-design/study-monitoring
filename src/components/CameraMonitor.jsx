// src/components/CameraMonitor.jsx
// Displays live webcam preview, status indicators, bounding box, and camera controls.

import React from 'react';
import { Camera, CameraOff, Video, AlertTriangle } from 'lucide-react';
import { CAMERA_STATUS } from '../hooks/useCamera';

export function CameraMonitor({
  videoRef,
  cameraStatus,
  errorMessage,
  startCamera,
  stopCamera,
  isMonitoring,
  faceBoundingBox
}) {
  const renderBadge = () => {
    switch (cameraStatus) {
      case CAMERA_STATUS.READY:
        return <span className="status-badge badge-ready">🟢 Camera Ready</span>;
      case CAMERA_STATUS.REQUESTING:
        return <span className="status-badge badge-warning">🟡 Requesting Permission...</span>;
      case CAMERA_STATUS.DENIED:
        return <span className="status-badge badge-danger">🔴 Permission Denied</span>;
      case CAMERA_STATUS.NOT_AVAILABLE:
        return <span className="status-badge badge-danger">🔴 Camera Not Available</span>;
      case CAMERA_STATUS.ERROR:
        return <span className="status-badge badge-danger">🔴 Camera Error</span>;
      default:
        return <span className="status-badge badge-off">⚪ Camera Stopped</span>;
    }
  };

  return (
    <div className="card camera-card">
      <div className="card-header">
        <div className="header-title">
          <Video className="icon" />
          <h2>Live Camera Preview</h2>
        </div>
        {renderBadge()}
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`webcam-video ${cameraStatus === CAMERA_STATUS.READY ? 'active' : 'inactive'}`}
        />

        {cameraStatus !== CAMERA_STATUS.READY && (
          <div className="video-placeholder">
            <CameraOff size={48} className="placeholder-icon" />
            <p>
              {cameraStatus === CAMERA_STATUS.REQUESTING
                ? 'Requesting webcam access...'
                : 'Camera is currently turned off'}
            </p>
          </div>
        )}

        {/* Bounding box overlay for detected face */}
        {isMonitoring && faceBoundingBox && cameraStatus === CAMERA_STATUS.READY && (
          <div
            className="face-bbox"
            style={{
              left: `${faceBoundingBox.originX}px`,
              top: `${faceBoundingBox.originY}px`,
              width: `${faceBoundingBox.width}px`,
              height: `${faceBoundingBox.height}px`
            }}
          >
            <span className="bbox-label">Target Focused</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="error-alert">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="camera-actions">
        {cameraStatus !== CAMERA_STATUS.READY ? (
          <button
            className="btn btn-primary"
            onClick={startCamera}
            disabled={cameraStatus === CAMERA_STATUS.REQUESTING}
          >
            <Camera size={18} />
            Start Camera
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={stopCamera}
            disabled={isMonitoring}
            title={isMonitoring ? 'Stop study session first before stopping camera' : ''}
          >
            <CameraOff size={18} />
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
