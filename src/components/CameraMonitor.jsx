// src/components/CameraMonitor.jsx
// Live webcam monitor with dynamic AI mood bounding box, detected object bounding boxes, and camera controls.

import React from 'react';
import { Camera, CameraOff, Video, AlertTriangle, Box } from 'lucide-react';
import { CAMERA_STATUS } from '../hooks/useCamera';

export function CameraMonitor({
  videoRef,
  cameraStatus,
  errorMessage,
  startCamera,
  stopCamera,
  isMonitoring,
  faceBoundingBox,
  expressionMood = 'Focused 🎯',
  detectedObjects = [],
  latestItemAnnouncement = ''
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

  // Face bounding box
  const renderFaceBoundingBox = () => {
    if (!isMonitoring || !faceBoundingBox || cameraStatus !== CAMERA_STATUS.READY) {
      return null;
    }

    const { originX, originY, width, height, videoWidth, videoHeight } = faceBoundingBox;
    if (!videoWidth || !videoHeight) return null;

    const leftPercent = ((videoWidth - originX - width) / videoWidth) * 100;
    const topPercent = (originY / videoHeight) * 100;
    const widthPercent = (width / videoWidth) * 100;
    const heightPercent = (height / videoHeight) * 100;

    let bboxColor = '#22c55e'; // Green
    if (expressionMood.includes('Yawn') || expressionMood.includes('Smile') || expressionMood.includes('Wink')) {
      bboxColor = '#eab308'; // Yellow
    } else if (expressionMood.includes('Sleep') || expressionMood.includes('Absent') || expressionMood.includes('Angry')) {
      bboxColor = '#ef4444'; // Red
    } else if (expressionMood.includes('Shocked')) {
      bboxColor = '#a855f7'; // Purple
    }

    return (
      <div
        className="face-bbox"
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
          borderColor: bboxColor,
          boxShadow: `0 0 15px ${bboxColor}`
        }}
      >
        <span className="bbox-label" style={{ backgroundColor: bboxColor }}>
          {expressionMood}
        </span>
      </div>
    );
  };

  // Detected Objects / Items bounding boxes
  const renderObjectBoundingBoxes = () => {
    if (cameraStatus !== CAMERA_STATUS.READY || detectedObjects.length === 0) {
      return null;
    }

    return detectedObjects.map((obj, idx) => {
      const { originX, originY, width, height, videoWidth, videoHeight } = obj.boundingBox;
      if (!videoWidth || !videoHeight) return null;

      const leftPercent = ((videoWidth - originX - width) / videoWidth) * 100;
      const topPercent = (originY / videoHeight) * 100;
      const widthPercent = (width / videoWidth) * 100;
      const heightPercent = (height / videoHeight) * 100;

      const isDistraction = obj.label === 'cell phone';
      const itemColor = isDistraction ? '#f43f5e' : '#06b6d4';

      return (
        <div
          key={obj.id || idx}
          className="object-bbox"
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
            borderColor: itemColor,
            boxShadow: `0 0 14px ${itemColor}`
          }}
        >
          <span className="object-bbox-label" style={{ backgroundColor: itemColor }}>
            {obj.emoji} {obj.displayName} ({obj.score}%)
          </span>
        </div>
      );
    });
  };

  return (
    <div className="card camera-card">
      <div className="card-header">
        <div className="header-title">
          <Video className="icon" />
          <h2>Live AI Camera Preview</h2>
        </div>
        {renderBadge()}
      </div>

      <div className={`video-container ${isMonitoring ? 'video-active-hud' : ''}`}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`webcam-video ${cameraStatus === CAMERA_STATUS.READY ? 'active' : 'inactive'}`}
        />

        {/* Live Detected Item Voice Banner */}
        {latestItemAnnouncement && cameraStatus === CAMERA_STATUS.READY && (
          <div className="item-announcement-chip">
            <Box size={14} />
            <span>{latestItemAnnouncement}</span>
          </div>
        )}

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

        {renderFaceBoundingBox()}
        {renderObjectBoundingBoxes()}
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
