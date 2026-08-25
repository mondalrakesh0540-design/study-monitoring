// src/components/MemeSoundboard.jsx
// Interactive live Hindi Meme Soundboard with famous buttons: Modi, Rahul Gandhi, Baburao, Jethalal, Puneet Superstar, ACP Pradyuman, Ashneer

import React, { useState } from 'react';
import { Sparkles, PlayCircle, Volume2 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

const SOUNDBOARD_MEMES = [
  { id: 'start-study', title: 'Modi Ji', quote: 'Wah Modiji Wah!', emoji: '🇮🇳', color: '#f59e0b' },
  { id: 'tab-change', title: 'Rahul Gandhi', quote: 'Khatam Tata Bye Bye!', emoji: '🚨', color: '#ef4444' },
  { id: 'face-missing', title: 'ACP Pradyuman', quote: 'Kuch Toh Gadbad Hai!', emoji: '🕵️‍♂️', color: '#8b5cf6' },
  { id: 'distracted', title: 'Bhaiyaaa', quote: 'Bhaiyaaaaa!', emoji: '🗣️', color: '#ec4899' },
  { id: 'sleep-warning', title: 'Momota', quote: 'Khela Hobe!', emoji: '💥', color: '#3b82f6' },
  { id: 'yawn-meme', title: 'Puneet Superstar', quote: 'Saale Chaate Marunga!', emoji: '😡', color: '#10b981' },
  { id: 'noise-meme', title: 'Baburao / Nana', quote: 'Chup! Bilkul Chup!', emoji: '🤫', color: '#6366f1' },
  { id: 'ashneer-meme', title: 'Ashneer', quote: 'Kya Kar Raha Hai Tu?!', emoji: '🤷‍♂️', color: '#14b8a6' },
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
          <Sparkles className="icon text-yellow" size={20} />
          <h3>🔥 Live Hindi Meme Soundboard</h3>
        </div>
        <span className="badge-live-memes">9 Instant Sounds</span>
      </div>

      <p className="soundboard-subtitle">
        Click any meme button to trigger instant Hindi viral dialogue!
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
