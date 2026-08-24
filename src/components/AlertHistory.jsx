// src/components/AlertHistory.jsx
// Displays a log of recent study monitoring events and alerts (latest 10 entries).

import React from 'react';
import { History, Bell, CheckCircle, AlertTriangle, EyeOff, ShieldX } from 'lucide-react';

export function AlertHistory({ events }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'start-study':
        return <CheckCircle size={16} className="icon-green" />;
      case 'back-to-study':
        return <CheckCircle size={16} className="icon-green" />;
      case 'face-missing':
        return <EyeOff size={16} className="icon-red" />;
      case 'distracted':
        return <AlertTriangle size={16} className="icon-red" />;
      case 'tab-change':
        return <Bell size={16} className="icon-yellow" />;
      case 'stop-study':
        return <ShieldX size={16} className="icon-gray" />;
      default:
        return <Bell size={16} className="icon-blue" />;
    }
  };

  return (
    <div className="card history-card">
      <div className="card-header">
        <div className="header-title">
          <History className="icon" />
          <h3 className="section-title">Recent Alert History</h3>
        </div>
        <span className="history-count">{events.length} / 10 Events</span>
      </div>

      {events.length === 0 ? (
        <div className="history-empty">
          <p>No activity logged yet. Start a study session to begin monitoring!</p>
        </div>
      ) : (
        <div className="history-list">
          {events.map((evt) => (
            <div key={evt.id} className="history-item">
              <div className="history-item-icon">{getEventIcon(evt.type)}</div>
              <div className="history-item-content">
                <div className="history-item-header">
                  <span className="history-title">{evt.title}</span>
                  <span className="history-time">{evt.timestamp}</span>
                </div>
                <p className="history-message">{evt.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
