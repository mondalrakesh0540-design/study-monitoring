// src/utils/audioManager.js
// Plays ONLY user-provided custom MPEG audio files.

const AUDIO_FILES = {
  'start-study': '/audio/start-study.mpeg',
  'tab-change': '/audio/tab-change.mpeg',
  'face-missing': '/audio/face-missing.mpeg',
  'distracted': '/audio/distracted.mpeg',
  'back-to-study': '/audio/back-to-study.mpeg',
  'sleep-warning': '/audio/sleep-warning.mpeg',
};

const FUNNY_MESSAGES = {
  'start-study': [
    'Welcome back! এবার মন দিয়ে পড়ো।',
    'Study session started! No distractions allowed!'
  ],
  'tab-change': [
    'Tab change kore ki korcho?',
    'Hey! YouTube naki Insta? Tab change bondho koro!'
  ],
  'face-missing': [
    'Oi! Porte bose kothay gele? Face cover/missing!',
    'Camera tomake খুঁজে পাচ্ছে না! Wake up!'
  ],
  'distracted': [
    'Phone নামাও, পড়াশোনায় মন দাও!',
    'Don’t look away or sleep! Screen-e mon dao!'
  ],
  'back-to-study': [
    'Welcome back! এবার মন দিয়ে পড়ো।',
    'Good student! Focus restored.'
  ],
  'sleep-warning': [
    'Wake up! You have been sleeping / missing for more than 30 seconds!',
    'Oi! 30 second hoye gelo, ekhono ghumaccho? Utho!'
  ]
};

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.8;
    this.muted = false;
    this.lastPlayTimes = {};
    this.cooldownMs = 5000;
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
  }

  async playAudio(eventType, force = false) {
    if (this.muted) return { played: false, reason: 'muted' };
    if (!this.canPlay(eventType, force)) {
      return { played: false, reason: 'cooldown' };
    }

    this.stopCurrent();
    this.lastPlayTimes[eventType] = Date.now();

    const audioPath = AUDIO_FILES[eventType];
    if (!audioPath) return { played: false, reason: 'no_file' };

    try {
      const audio = new Audio(audioPath);
      audio.volume = this.volume;
      this.currentAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          console.warn('Custom audio playback error:', err);
        });
      }
      return { played: true, path: audioPath };
    } catch (err) {
      console.warn('Audio play error:', err);
      return { played: false, error: err };
    }
  }
}

export const audioManager = new AudioManager();
