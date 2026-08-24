// src/utils/audioManager.js
// Manages MP3 sound playback, Web Audio API synth fallback, Web Speech API voice speech, cooldowns, and funny messages.

const AUDIO_FILES = {
  'start-study': '/audio/start-study.mp3',
  'tab-change': '/audio/tab-change.mp3',
  'face-missing': '/audio/face-missing.mp3',
  'distracted': '/audio/distracted.mp3',
  'back-to-study': '/audio/back-to-study.mp3',
};

const FUNNY_MESSAGES = {
  'start-study': [
    'Welcome back! এবার মন দিয়ে পড়ো।',
    'Study session started! No distractions allowed!',
    'চলো শুরু করা যাক! Keep eyes on the desk.'
  ],
  'tab-change': [
    'Tab change kore ki korcho?',
    'Hey! YouTube naki Insta? Tab change bondho koro!',
    'পড়াশোনা ছেড়ে ব্রাউজিং? Back to study right now!'
  ],
  'face-missing': [
    'Oi! Porte bose kothay gele?',
    'Camera tomake খুঁজে পাচ্ছে না! Wake up!',
    'Where did you vanish? Chair-e fire esho, ghumiyo na!'
  ],
  'distracted': [
    'Phone নামাও, পড়াশোনায় মন দাও!',
    'Don’t look away or sleep! Screen-e mon dao!',
    'Oi! Porte bose matha nichu kore ghumaccho? Wake up!'
  ],
  'back-to-study': [
    'Welcome back! এবার মন দিয়ে পড়ো।',
    'Good student! Focus restored.',
    'সাবাশ! আবার মন দিয়ে পড়তে শুরু করেছো।'
  ]
};

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.8;
    this.muted = false;
    this.lastPlayTimes = {}; // Stores timestamps for cooldown check
    this.cooldownMs = 8000; // Minimum 8 seconds between repetitive alerts
    this.audioContext = null;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.muted ? 0 : this.volume;
    }
  }

  getVolume() {
    return this.volume;
  }

  setMute(isMuted) {
    this.muted = isMuted;
    if (this.currentAudio) {
      this.currentAudio.volume = this.muted ? 0 : this.volume;
    }
    if (isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isMuted() {
    return this.muted;
  }

  getFunnyMessage(eventType) {
    const list = FUNNY_MESSAGES[eventType] || ['Focus Guard is watching you!'];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  canPlay(eventType, force = false) {
    if (force) return true;
    const now = Date.now();
    const lastTime = this.lastPlayTimes[eventType] || 0;
    return now - lastTime >= this.cooldownMs;
  }

  stopCurrent() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  // Web Speech API Voice Output (speaks the exact funny warning words out loud)
  speakMessage(text) {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('IN') || v.lang.includes('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech Synthesis Error:', err);
    }
  }

  // Fallback Web Audio API synthesizer for funny custom tones
  playSynthFallback(eventType) {
    if (this.muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (eventType === 'start-study' || eventType === 'back-to-study') {
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.3, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
      } else if (eventType === 'tab-change') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (eventType === 'face-missing') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.15);
        osc.frequency.linearRampToValueAtTime(400, now + 0.3);
        osc.frequency.linearRampToValueAtTime(800, now + 0.45);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (eventType === 'distracted') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);
        osc.frequency.linearRampToValueAtTime(180, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('Web Audio Fallback error:', e);
    }
  }

  async playAudio(eventType, force = false, spokenMessage = '') {
    if (!this.canPlay(eventType, force)) {
      return { played: false, reason: 'cooldown' };
    }

    this.stopCurrent();
    this.lastPlayTimes[eventType] = Date.now();

    // Speak out loud using Web Speech API if message provided
    if (spokenMessage) {
      this.speakMessage(spokenMessage);
    }

    const audioPath = AUDIO_FILES[eventType];
    if (!audioPath) {
      this.playSynthFallback(eventType);
      return { played: true, method: 'synth' };
    }

    try {
      const audio = new Audio(audioPath);
      audio.volume = this.muted ? 0 : this.volume;
      this.currentAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch(async () => {
          this.playSynthFallback(eventType);
        });
      }
      return { played: true, method: 'audio' };
    } catch (err) {
      this.playSynthFallback(eventType);
      return { played: true, method: 'synth_fallback' };
    }
  }
}

export const audioManager = new AudioManager();
