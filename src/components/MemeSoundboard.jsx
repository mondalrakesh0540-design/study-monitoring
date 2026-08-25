// src/components/MemeSoundboard.jsx
// Interactive live Hindi 18+ Spicy Meme Soundboard

import React, { useState } from 'react';
import { Sparkles, PlayCircle, Flame } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

const SOUNDBOARD_MEMES = [
  { id: 'roadies-meme', title: 'Roadies Rage', quote: 'Bhosdike Madarchod Been K Loray!', emoji: '🤬', color: '#ef4444' },
  { id: 'chutiya-meme', title: 'Carry / Standup', quote: 'Tum Chutiya Ho!', emoji: '🤡', color: '#f59e0b' },
  { id: 'chal-bsdk-meme', title: 'Hindustani Bhau', quote: 'Chal Bhosdike!', emoji: '🔥', color: '#dc2626' },
  { id: 'kyu-re-meme', title: 'Kyu Re', quote: 'Kyu re Madarchod?!', emoji: '💥', color: '#ec4899' },
  { id: 'puneet-gaya-meme', title: 'Lord Puneet', quote: 'Ab Tu Gaya Beta Ab Dekh Tu!', emoji: '👑', color: '#8b5cf6' },
  { id: 'yawn-meme', title: 'Puneet Superstar', quote: 'Saale Chaate Marunga!', emoji: '😡', color: '#10b981' },
  { id: 'gaand-danda-meme', title: 'Danda Meme', quote: 'Gaand Me Danda De!', emoji: '⚡', color: '#f43f5e' },
  { id: 'start-study', title: 'Modi Ji', quote: 'Wah Modiji Wah!', emoji: '🇮🇳', color: '#f59e0b' },
  { id: 'tab-change', title: 'Rahul Gandhi', quote: 'Khatam Tata Bye Bye!', emoji: '🚨', color: '#ef4444' },
  { id: 'face-missing', title: 'ACP Pradyuman', quote: 'Kuch Toh Gadbad Hai!', emoji: '🕵️‍♂️', color: '#8b5cf6' },
  { id: 'sleep-warning', title: 'Momota', quote: 'Khela Hobe!', emoji: '💥', color: '#3b82f6' },
  { id: 'shocked-meme', title: 'Arey Baap Re', quote: 'Ye Kya Dekh Liya?!', emoji: '😲', color: '#eab308' },
  { id: 'angry-meme', title: 'Arpit Bala', quote: 'Bkl Gussa Aa Jata Hai!', emoji: '😠', color: '#dc2626' },
  { id: 'pushpa-meme', title: 'Pushpa Raj', quote: 'Main Jhukega Nahi!', emoji: '🔥', color: '#ea580c' },
  { id: 'shabash-meme', title: 'Shabash Beta', quote: 'Bohot Badhiya!', emoji: '🌟', color: '#16a34a' },
  { id: 'smile-meme', title: 'Arnab Goswami', quote: 'Kuch Bhi?! Kuch Bhi?!', emoji: '🎤', color: '#f43f5e' }
];

export function MemeSoundboard({ onTriggerMeme }) {
  const [activeButton, setActiveButton] = useState(null);

  const handlePlay = (meme) => {
    setActiveButton(meme.id);
    audioManager.unlockAudioContext();
    audioManager.playAudio(meme.id, true);
    if (onTriggerMeme) {
      onTriggerMeme(meme.title + ': ' + meme.quote);
    }
    setTimeout(() => setActiveButton(null), 1500);
  };

  return (
    <div className="card meme-soundboard-card">
      <div className="card-header">
        <div className="header-title">
          <Flame className="icon text-red" size={20} />
          <h3>🔥 18+ Spicy Hindi Meme Soundboard</h3>
        </div>
        <span className="badge-live-memes">16 Instant Sounds</span>
      </div>

      <p className="soundboard-subtitle">
        Click any meme button to play viral spicy Hindi dialogue instantly!
      </p>

      <div className="soundboard-grid">
        {SOUNDBOARD_MEMES.map((meme) => (
          <button
            key={meme.id}
            className={`soundboard-btn ${activeButton === meme.id ? 'active-pulse' : ''}`}
            style={{ borderColor: activeButton === meme.id ? meme.color : 'rgba(255, 255, 255, 0.1)' }}
            onClick={() => handlePlay(meme)}
          >
            <span className="meme-btn-emoji">{meme.emoji}</span>
            <div className="meme-btn-info">
              <span className="meme-btn-title" style={{ color: meme.color }}>{meme.title}</span>
              <span className="meme-btn-quote">"{meme.quote}"</span>
            </div>
            <PlayCircle size={18} className="meme-btn-play-icon" />
          </button>
        ))}
      </div>
    </div>
  );
}
