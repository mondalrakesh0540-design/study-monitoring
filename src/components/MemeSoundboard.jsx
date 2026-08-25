// src/components/MemeSoundboard.jsx
// Mobile-Optimized 18+ Spicy & Iconic Hindi Meme Soundboard

import React, { useState } from 'react';
import { PlayCircle, Flame, Volume2 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

const SOUNDBOARD_MEMES = [
  { id: 'roadies-meme', title: 'Roadies Rage', quote: 'Bhosdike Madarchod Been K Loray!', emoji: '🤬', color: '#ef4444', category: '18+' },
  { id: 'chal-bsdk-meme', title: 'Hindustani Bhau', quote: 'Chal Bhosdike!', emoji: '🔥', color: '#dc2626', category: '18+' },
  { id: 'chutiya-meme', title: 'Carry / Standup', quote: 'Tum Chutiya Ho!', emoji: '🤡', color: '#f59e0b', category: '18+' },
  { id: 'kyu-re-meme', title: 'Kyu Re', quote: 'Kyu re Madarchod?!', emoji: '💥', color: '#ec4899', category: '18+' },
  { id: 'puneet-gaya-meme', title: 'Lord Puneet', quote: 'Ab Tu Gaya Beta Ab Dekh Tu!', emoji: '👑', color: '#8b5cf6', category: '18+' },
  { id: 'gaand-danda-meme', title: 'Danda Meme', quote: 'Gaand Me Danda De!', emoji: '⚡', color: '#f43f5e', category: '18+' },
  { id: 'yawn-meme', title: 'Puneet Superstar', quote: 'Saale Itne Chaate Marunga Na!', emoji: '😡', color: '#10b981', category: '18+' },
  { id: 'angry-meme', title: 'Arpit Bala', quote: 'Bkl Bina Baat Ke Gussa Aa Jata Hai!', emoji: '😠', color: '#dc2626', category: '18+' },

  { id: 'noise-meme', title: 'Baburao Apte', quote: 'Chup! Bilkul Chup!', emoji: '🤫', color: '#6366f1', category: 'movies' },
  { id: 'pushpa-meme', title: 'Pushpa Raj', quote: 'Main Jhukega Nahi Saala!', emoji: '🔥', color: '#ea580c', category: 'movies' },
  { id: 'shabash-meme', title: 'Shabash Beta', quote: 'Bohot Badhiya!', emoji: '🌟', color: '#16a34a', category: 'movies' },
  { id: 'shocked-meme', title: 'Arey Baap Re', quote: 'Ye Kya Dekh Liya?!', emoji: '😲', color: '#eab308', category: 'movies' },
  { id: 'face-missing', title: 'ACP Pradyuman', quote: 'Daya! Kuch Toh Gadbad Hai!', emoji: '🕵️‍♂️', color: '#8b5cf6', category: 'movies' },

  { id: 'start-study', title: 'Modi Ji', quote: 'Wah Modiji Wah!', emoji: '🇮🇳', color: '#f59e0b', category: 'politics' },
  { id: 'tab-change', title: 'Rahul Gandhi', quote: 'Khatam Tata Bye Bye Gaya!', emoji: '🚨', color: '#ef4444', category: 'politics' },
  { id: 'back-to-study', title: 'Rahul Gandhi', quote: 'Maza Aaya Aur Sabko Milega!', emoji: '👏', color: '#10b981', category: 'politics' },
  { id: 'sleep-warning', title: 'Momota Banerjee', quote: 'Khela Hobe! Utho!', emoji: '💥', color: '#3b82f6', category: 'politics' },
  { id: 'smile-meme', title: 'Arnab Goswami', quote: 'Kuch Bhi?! Kuch Bhi?!', emoji: '🎤', color: '#f43f5e', category: 'politics' },
  { id: 'distracted', title: 'Bhaiyaaa', quote: 'Bhaiyaaaaa!', emoji: '🗣️', color: '#ec4899', category: 'viral' },
  { id: 'ashneer-meme', title: 'Ashneer Grover', quote: 'Bhai Kya Kar Raha Hai Tu?!', emoji: '🤷‍♂️', color: '#14b8a6', category: 'viral' }
];

export function MemeSoundboard({ onTriggerMeme }) {
  const [activeButton, setActiveButton] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredMemes = filterCategory === 'all'
    ? SOUNDBOARD_MEMES
    : SOUNDBOARD_MEMES.filter((m) => m.category === filterCategory);

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
      {/* Soundboard Header */}
      <div className="card-header">
        <div className="header-title">
          <Flame className="icon text-red" size={24} />
          <div>
            <h3>🔥 18+ Spicy Hindi Meme Soundboard</h3>
            <p className="subtitle-sm">20 Instant Viral Hindi Roasts & Dialogue Clips</p>
          </div>
        </div>
        <span className="badge-live-memes">{filteredMemes.length} Sounds</span>
      </div>

      {/* Swipeable Category Filter Bar */}
      <div className="soundboard-filters-wrapper">
        <div className="soundboard-filters">
          <button
            className={`filter-pill ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            ⚡ All (20)
          </button>
          <button
            className={`filter-pill ${filterCategory === '18+' ? 'active' : ''}`}
            onClick={() => setFilterCategory('18+')}
          >
            🔞 18+ Roasts (8)
          </button>
          <button
            className={`filter-pill ${filterCategory === 'movies' ? 'active' : ''}`}
            onClick={() => setFilterCategory('movies')}
          >
            🎬 Movies & CID (5)
          </button>
          <button
            className={`filter-pill ${filterCategory === 'politics' ? 'active' : ''}`}
            onClick={() => setFilterCategory('politics')}
          >
            🏛️ Politics (5)
          </button>
          <button
            className={`filter-pill ${filterCategory === 'viral' ? 'active' : ''}`}
            onClick={() => setFilterCategory('viral')}
          >
            🗣️ Viral (2)
          </button>
        </div>
      </div>

      {/* Responsive Meme Buttons Grid */}
      <div className="soundboard-grid">
        {filteredMemes.map((meme) => (
          <button
            key={meme.id}
            className={`soundboard-btn ${activeButton === meme.id ? 'active-pulse' : ''}`}
            style={{
              borderColor: activeButton === meme.id ? meme.color : 'rgba(255, 255, 255, 0.08)',
              borderLeftColor: meme.color,
              borderLeftWidth: '3px'
            }}
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
