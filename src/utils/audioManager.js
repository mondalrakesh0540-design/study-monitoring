// src/utils/audioManager.js
// FocusGuard AI Alert Sound Manager
// Plays alert sounds (.wav/.mp3) with Web Audio API synthesis fallback and autoplay unlock.

const AUDIO_FILES = {
  'start-study': ['/audio/start-study.wav', '/audio/start-study.mp3'],
  'tab-change': ['/audio/tab-change.wav', '/audio/tab-change.mp3'],
  'face-missing': ['/audio/face-missing.wav', '/audio/face-missing.mp3'],
  'distracted': ['/audio/distracted.wav', '/audio/distracted.mp3'],
  'back-to-study': ['/audio/back-to-study.wav', '/audio/back-to-study.mp3'],
  'sleep-warning': ['/audio/sleep-warning.wav', '/audio/sleep-warning.mp3'],
};

const FUNNY_MESSAGES = {
  'start-study': [
    'Welcome back! এবার মন দিয়ে পড়ো।',
    'Study session started! No distractions allowed!'
  ],
  'tab-change': [
    'Tab change kore ki korcho?',
    'Hey! YouTube naki Insta? Tab change bondho koro!'
  ],
  'face-missing': [
    'Oi! Porte bose kothay gele? Face cover/missing!',
    'Camera tomake khuje pachche na! Wake up!'
  ],
  'distracted': [
    'Phone namao, porashonar mon dao!',
    'Do not look away or sleep! Screen-e mon dao!'
  ],
  'back-to-study': [
    'Welcome back! Ekhon mon diye poro.',
    'Good student! Focus restored.'
  ],
  'sleep-warning': [
    'Wake up! You have been sleeping for more than 30 seconds!',
    'Oi! 30 second hoye gelo, ekhono ghumaccho? Utho!'
  ]
};

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.8;
    this.muted = false;
    this.lastPlayTimes = {};
    this.cooldownMs = 3500;
    this.audioContext = null;
  }

  // Called on user gesture (Start Camera / Start Study click)
  // Unlocks browser audio autoplay policy
  async unlockAudioContext() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      console.log('[AudioManager] AudioContext unlocked successfully.');
    } catch (e) {
      console.warn('[AudioManager] AudioContext unlock failed:', e);
    }
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
  }

  isMuted() {
    return this.muted;
  }

  getFunnyMessage(eventType) {
    const list = FUNNY_MESSAGES[eventType] || ['FocusGuard is watching you!'];
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
  }

  // Plays audio file with multi-path fallback
  async playAudio(eventType, force = false) {
    if (this.muted) return { played: false, reason: 'muted' };
    if (!this.canPlay(eventType, force)) {
      return { played: false, reason: 'cooldown' };
    }

    this.stopCurrent();
    this.lastPlayTimes[eventType] = Date.now();

    const paths = AUDIO_FILES[eventType] || [];
    let playedSuccessfully = false;

    for (const audioPath of paths) {
      try {
        const audio = new Audio(audioPath);
        audio.volume = this.muted ? 0 : this.volume;
        audio.preload = 'auto';
        this.currentAudio = audio;

        await audio.play();
        playedSuccessfully = true;
        console.log(`[AudioManager] Playing sound: ${audioPath}`);
        break;
      } catch (err) {
        console.warn(`[AudioManager] Playback failed for ${audioPath}:`, err.message);
      }
    }

    // Fallback: Web Audio synth if file fails
    if (!playedSuccessfully) {
      this.playSynthFallback(eventType);
      playedSuccessfully = true;
    }

    return { played: playedSuccessfully };
  }

  // Web Audio synth fallback
  playSynthFallback(eventType) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const vol = this.muted ? 0 : this.volume * 0.4;

      if (eventType === 'sleep-warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (eventType === 'distracted' || eventType === 'face-missing') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('[AudioManager] Synth fallback error:', e);
    }
  }
}

export const audioManager = new AudioManager();
