// src/components/StudyGuidePanel.jsx
// Complete & Interactive AI Study Guide, Topper Protocol, Meme Punishment Directory & Checklist

import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  ShieldAlert,
  Flame,
  Award,
  Zap,
  CheckSquare,
  Square,
  AlertTriangle,
  Lightbulb,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const STUDY_CHECKLIST_ITEMS = [
  '📵 Keep smartphone out of arm’s reach or on Silent mode',
  '💧 Keep a full water bottle on your study desk',
  '📖 Open exact syllabus chapter and prepare notes/pen',
  '🎯 Set a 25-minute Pomodoro focus sprint target',
  '💡 Sit in an upright posture with good room lighting',
  '📝 Practice Active Recall: write key concepts without looking'
];

const MEME_CRIMES = [
  {
    crime: 'Holding Smartphone / Looking Down',
    threshold: 'Instant Detection / 5s',
    meme: '🤬 Hindustani Bhau — "Chal Bhosdike!"',
    severity: 'CRITICAL',
    badgeClass: 'badge-danger'
  },
  {
    crime: 'Light Sleep / Eye Closure (5s)',
    threshold: '5 Seconds',
    meme: '🗣️ Bhaiyaaa — "Bhaiyaaaaa! Uth jao!"',
    severity: 'HIGH',
    badgeClass: 'badge-danger'
  },
  {
    crime: 'Deep Sleep / Sleeping on Desk (30s+)',
    threshold: '30 Seconds',
    meme: '💥 Momota — "Khela Hobe! Utho Kumbhakarna!"',
    severity: 'MAXIMUM',
    badgeClass: 'badge-danger'
  },
  {
    crime: 'Tab Switch to YouTube / Insta Reels',
    threshold: 'Instant Blur',
    meme: '🚨 Rahul Gandhi — "Khatam! Tata, Bye Bye, Gaya!"',
    severity: 'HIGH',
    badgeClass: 'badge-warning'
  },
  {
    crime: 'Yawning / Mouth Open Wide',
    threshold: '1.5 Seconds',
    meme: '😡 Puneet Superstar — "Saale Itne Chaate Marunga!"',
    severity: 'MEDIUM',
    badgeClass: 'badge-warning'
  },
  {
    crime: 'Daydreaming & Smiling at Screen',
    threshold: '2 Seconds',
    meme: '🎤 Arnab Goswami — "Kuch Bhi?! Kuch Bhi?!"',
    severity: 'MEDIUM',
    badgeClass: 'badge-warning'
  },
  {
    crime: 'Leaving Desk / Face Missing',
    threshold: '5 Seconds',
    meme: '🕵️‍♂️ ACP Pradyuman — "Daya! Kuch Toh Gadbad Hai!"',
    severity: 'HIGH',
    badgeClass: 'badge-warning'
  },
  {
    crime: 'Returning to Focus & Restoring Posture',
    threshold: 'Instant Recovery',
    meme: '🌟 Shabash Beta / Pushpa — "Main Jhukega Nahi!"',
    severity: 'REWARD',
    badgeClass: 'badge-ready'
  }
];

const TOPPER_FRAMEWORKS = [
  {
    title: '🧠 1. The Feynman Technique (Master Any Complex Topic)',
    desc: 'Take a blank paper and explain the concept in the simplest possible words as if teaching a 10-year-old child. Whenever you get stuck or use complex jargon, return to your book to fill the knowledge gap.'
  },
  {
    title: '⏱️ 2. The 25/5 Pomodoro Cycle (Laser Focus Formula)',
    desc: 'Study with 100% undivided attention for 25 minutes straight (no notifications, no tab switching). Then take a mandatory 5-minute hydration and eye-relaxing break. After 4 cycles, take a long 20-minute break.'
  },
  {
    title: '📝 3. Active Recall over Passive Reading',
    desc: 'Re-reading notes is a passive illusion of competence. Instead, close the book and test yourself: write down equations, draw mind maps, or quiz yourself from memory. This boosts long-term brain retention by 300%.'
  },
  {
    title: '🔄 4. Spaced Repetition (The Forgetting Curve Antidote)',
    desc: 'To lock syllabus into permanent memory, review topics at spaced intervals: Day 1 (immediate test), Day 3 (quick quiz), Day 7 (practice paper), and Day 21 (mastery review).'
  }
];

export function StudyGuidePanel() {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedSection, setExpandedSection] = useState('frameworks');

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STUDY_CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="card study-guide-card">
      {/* Header */}
      <div className="card-header">
        <div className="header-title">
          <BookOpen className="icon text-yellow" size={24} />
          <div>
            <h3>📚 Master Study Guide & AI Protocol</h3>
            <p className="subtitle-sm">The Complete Topper Handbook & Anti-Distraction AI System</p>
          </div>
        </div>
        <span className="badge-guide">Topper Certified 🏆</span>
      </div>

      {/* Interactive Self-Audit Checklist */}
      <div className="checklist-container">
        <div className="checklist-header">
          <div className="checklist-title">
            <CheckSquare size={18} className="text-green" />
            <h4>Pre-Study Readiness Checklist</h4>
          </div>
          <span className="checklist-progress-text">{progressPercent}% Ready ({completedCount}/{STUDY_CHECKLIST_ITEMS.length})</span>
        </div>

        <div className="checklist-bar-bg">
          <div className="checklist-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="checklist-items-grid">
          {STUDY_CHECKLIST_ITEMS.map((item, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <button
                key={idx}
                className={`checklist-btn ${isChecked ? 'checked' : ''}`}
                onClick={() => toggleCheck(idx)}
              >
                {isChecked ? <CheckSquare size={18} className="check-icon text-green" /> : <Square size={18} className="check-icon" />}
                <span className="checklist-text">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion / Tabbed Guide Sections */}
      <div className="guide-sections-wrapper">
        {/* Section 1: Meme Crimes & AI Punishments Table */}
        <div className="guide-box">
          <div className="guide-box-header">
            <ShieldAlert size={20} className="text-red" />
            <h4>🚨 AI Detection Crimes & 18+ Meme Punishments</h4>
          </div>
          <p className="guide-box-desc">
            FocusGuard AI monitors your webcam in real-time. Committing any of the following study crimes triggers immediate voice alerts and hilarious Hindi roast memes!
          </p>

          <div className="table-responsive">
            <table className="crimes-table">
              <thead>
                <tr>
                  <th>Study Crime</th>
                  <th>Detection Threshold</th>
                  <th>Triggered Hindi Roast Meme</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {MEME_CRIMES.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-white">{item.crime}</td>
                    <td>{item.threshold}</td>
                    <td className="meme-cell font-bold">{item.meme}</td>
                    <td>
                      <span className={`status-badge ${item.badgeClass}`}>{item.severity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Topper Study Frameworks */}
        <div className="guide-box">
          <div className="guide-box-header">
            <Award size={20} className="text-yellow" />
            <h4>💡 The 4 Scientific Topper Study Frameworks</h4>
          </div>

          <div className="frameworks-grid">
            {TOPPER_FRAMEWORKS.map((fw, idx) => (
              <div key={idx} className="framework-card">
                <h5 className="framework-title">{fw.title}</h5>
                <p className="framework-desc">{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Brain Food & Physical Health Hacks */}
        <div className="guide-box">
          <div className="guide-box-header">
            <Zap size={20} className="text-cyan" />
            <h4>⚡ Brain Energy & Exam Nutrition Hacks</h4>
          </div>

          <div className="hacks-grid">
            <div className="hack-item">
              <span className="hack-emoji">💧</span>
              <div>
                <strong>Water Hydration:</strong> Even 2% mild dehydration drops mental concentration by 20%. Keep drinking water.
              </div>
            </div>
            <div className="hack-item">
              <span className="hack-emoji">👀</span>
              <div>
                <strong>20-20-20 Eye Rule:</strong> Every 20 minutes, look at an object 20 feet away for 20 seconds to prevent digital eye strain.
              </div>
            </div>
            <div className="hack-item">
              <span className="hack-emoji">😴</span>
              <div>
                <strong>7-8 Hours Sleep:</strong> Sleep is when brain consolidates short-term study memory into permanent recall. Never compromise sleep.
              </div>
            </div>
            <div className="hack-item">
              <span className="hack-emoji">🥜</span>
              <div>
                <strong>Brain Snacks:</strong> Almonds, walnuts, dark chocolate, and bananas provide sustained glucose for deep work.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
