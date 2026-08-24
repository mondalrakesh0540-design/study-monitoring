// src/utils/audioManager.js
// Plays user-provided custom MP3/MPEG audio files with multi-format browser fallback.
// Includes AudioContext unlock for browser autoplay policy.

const AUDIO_FILES = {
  'start-study': ['/audio/start-study.mp3', '/audio/start-study.mpeg'],
  'tab-change': ['/audio/tab-change.mp3', '/audio/tab-change.mpeg'],
  'face-missing': ['/audio/face-missing.mp3', '/audio/face-missing.mpeg'],
  'distracted': ['/audio/distracted.mp3', '/audio/distracted.mpeg'],
  'back-to-study': ['/audio/back-to-study.mp3', '/audio/back-to-study.mpeg'],
  'sleep-warning': ['/audio/sleep-warning.mp3', '/audio/sleep-warning.mpeg'],
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
    this.cooldownMs = 4000;
    this.audioContextUnlocked = false;
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
      this.audioContextUnlocked = true;
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
        console.log(`[AudioManager] Playing: ${audioPath}`);
        break;
      } catch (err) {
        console.warn(`[AudioManager] Playback failed for ${audioPath}:`, err.message);
      }
    }

    if (!playedSuccessfully) {
      console.error(`[AudioManager] All audio paths failed for event: ${eventType}`);
    }

    return { played: playedSuccessfully };
  }
}

export const audioManager = new AudioManager();
