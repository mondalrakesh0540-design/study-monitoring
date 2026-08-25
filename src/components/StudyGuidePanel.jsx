// src/components/StudyGuidePanel.jsx
// Dedicated Section for Study Guide, Rules, and Focus Tips

import React, { useState } from 'react';
import { BookOpen, Target, ShieldCheck, Flame, Zap, Award, ChevronDown, ChevronUp } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    id: 'ai-rules',
    title: '🎯 How FocusGuard AI Works',
    icon: <Target size={18} className="text-cyan" />,
    content: [
      '😴 Sleep Alerts: 5 seconds of continuous eye closure triggers light alert ("Chal Bhosdike!"). 30 seconds triggers deep sleep alert ("Momota: Khela Hobe!").',
      '👀 Posture & Distraction: Looking down at your lap/phone for 5 seconds triggers Hindustani Bhau distraction alert.',
      '🥱 Yawn & Mood: Big yawn / jaw opening triggers Puneet Superstar ("Saale Chaate Marunga!").',
      '🚨 Tab Switching: Minimizing window or switching tabs triggers Rahul Gandhi ("Khatam Tata Bye Bye!").'
    ]
  },
  {
    id: 'object-guide',
    title: '📦 AI Object & Item Scanner Guide',
    icon: <BookOpen size={18} className="text-yellow" />,
    content: [
      '📱 Phone Detection: If a smartphone is seen in front of the camera, FocusGuard immediately warns you to put the phone away.',
      '📖 Study Materials: Books, notebooks, laptops, water bottles, and stationery are detected and announced with encouraging feedback.',
      '🗣️ Voice Announcer: The AI speaks in natural Hindi/English voice to identify items and keep you accountable.'
    ]
  },
  {
    id: 'meme-rules',
    title: '🔞 18+ Spicy Meme Soundboard Guide',
    icon: <Flame size={18} className="text-red" />,
    content: [
      '🔥 16 Instant Sounds: Click any meme button on the soundboard anytime for instant high-energy motivation.',
      '🎭 Iconic Characters: Featuring Roadies Rage, Hindustani Bhau, CarryMinati, Lord Puneet, Modi Ji, Rahul Gandhi, ACP Pradyuman, and Pushpa Raj.'
    ]
  },
  {
    id: 'study-tips',
    title: '💡 Topper Study Guidelines (Pomodoro Technique)',
    icon: <Award size={18} className="text-green" />,
    content: [
      '⏱️ 25/5 Rule: Study with 100% laser focus for 25 minutes, then take a 5-minute break.',
      '💧 Hydration: Keep a water bottle on your desk. Stay hydrated to prevent sleepiness.',
      '📵 Zero Distractions: Keep your phone out of arm’s reach during study sessions.'
    ]
  }
];

export function StudyGuidePanel() {
  const [expandedId, setExpandedId] = useState('ai-rules');

  const toggleSection = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="card study-guide-card">
      <div className="card-header">
        <div className="header-title">
          <BookOpen className="icon text-yellow" size={20} />
          <h3>📚 AI Study Guide & Rules</h3>
        </div>
        <span className="badge-guide">Topper Protocol</span>
      </div>

      <p className="study-guide-subtitle">
        Everything you need to master your focus, study routine, and AI monitoring rules.
      </p>

      <div className="guide-accordion-list">
        {GUIDE_SECTIONS.map((sec) => {
          const isExpanded = expandedId === sec.id;
          return (
            <div key={sec.id} className={`guide-accordion-item ${isExpanded ? 'expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection(sec.id)}>
                <div className="trigger-title">
                  {sec.icon}
                  <span>{sec.title}</span>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isExpanded && (
                <div className="accordion-content">
                  <ul>
                    {sec.content.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
