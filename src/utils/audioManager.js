// src/utils/audioManager.js
// FocusGuard AI Alert Sound & Funny Student Meme Manager

const AUDIO_FILES = {
  'start-study': ['/audio/start-study.wav', '/audio/start-study.mp3'],
  'tab-change': ['/audio/tab-change.wav', '/audio/tab-change.mp3'],
  'face-missing': ['/audio/face-missing.wav', '/audio/face-missing.mp3'],
  'distracted': ['/audio/distracted.wav', '/audio/distracted.mp3'],
  'back-to-study': ['/audio/back-to-study.wav', '/audio/back-to-study.mp3'],
  'sleep-warning': ['/audio/sleep-warning.wav', '/audio/sleep-warning.mp3'],
};

export const FUNNY_MEMES = {
  'start-study': [
    { text: 'Study Mode ACTIVATED! No phone, no Insta, only 100% Focus!', tag: '🚀 TOPPER VIBES' },
    { text: 'Welcome back! এবার মন দিয়ে পড়ো, পরীক্ষার আর বেশি দিন নেই!', tag: '📚 STUDY TIME' },
    { text: 'Padhai shuru karo! IAS / Doctor / Engineer banna hai ki nahi?', tag: '🎯 GOAL ORIENTED' },
    { text: 'Bhalo marks pele treat debo! Cholo full energy te shuru kora jak!', tag: '🔥 MOTIVATION' }
  ],
  'tab-change': [
    { text: 'Tab change kore ki korcho? YouTube naki Insta Reels? Dhora pore gecho!', tag: '🚨 CAUGHT IN 4K' },
    { text: 'Bhai padhle... Reels dekhne se marks nahi milte!', tag: '📱 NO REELS' },
    { text: 'Hey! Alt+Tab cheat koro na, Camera shob dekhchhe!', tag: '🕵️‍♂️ SPY DETECTED' },
    { text: 'Insta scroll kore future banano jay na! Padhai pe dhyan do!', tag: '⚠️ FOCUS WARNING' },
    { text: 'Ekbar tab change korle exam hall-e kante hobe! Back to study!', tag: '🛑 TAB SWITCH' }
  ],
  'face-missing': [
    { text: 'Oi! Porte bose kothay gele? Bhoot hoye gele naki?!', tag: '👻 GHOST MODE' },
    { text: 'Boi diye mukh dhakle pora mathay dhoke na! Camera-te mukh rakho!', tag: '📖 FACE COVERED' },
    { text: 'Camera tomake khuje pachche na! Kidhar gayab ho gaye?', tag: '🔍 404 NOT FOUND' },
    { text: 'Porashona chhere bathroom break naki snacks khawa hocche? Chole asho!', tag: '🏃‍♂️ MISSING IN ACTION' },
    { text: 'Face missing! Porte boso, phaki dewa bondho koro!', tag: '🚨 RETURN TO DESK' }
  ],
  'distracted': [
    { text: 'Halka ghum pachche? Chokhe jol diye asho! Wake up!', tag: '🥱 LIGHT SLEEP (5s)' },
    { text: 'Phone namao! Phone dekhar jonno eita study session na!', tag: '📵 PHONE DETECTED' },
    { text: 'Screen-e mon dao! Pashe ki dekhcho? Crush-er DP?', tag: '👀 DISTRACTED' },
    { text: 'Chayer cup nao, chokh kholo! Focus Guard is watching!', tag: '☕ WAKE UP' },
    { text: 'Looking sideways / tilted? Mon diye boi-er dike takao!', tag: '📐 POSTURE CHECK' }
  ],
  'back-to-study': [
    { text: 'Good student! Focus restored! Eibar puro chapter sesh koro!', tag: '🌟 100% FOCUS' },
    { text: 'Shabash! Mon diye poro, topper hote hobe!', tag: '👏 EXCELLENT' },
    { text: 'Great comeback! Focus locked in, keep going!', tag: '🚀 LOCKED IN' },
    { text: 'Ebar hobe আসল পড়াশোনা! You can do this!', tag: '🏆 CHAMPION' }
  ],
  'sleep-warning': [
    { text: 'WAKE UP! ৩০ সেকেন্ড ধরে ঘুমাচ্ছো! Kumbhakarna naki tumi?!', tag: '⏰ DEEP SLEEP (30s+)' },
    { text: 'Alarm! Alarm! Utho bhai, ghumano bondho koro! Exam pass korte hobe!', tag: '💥 WAKE UP NOW' },
    { text: '30 second hoye gelo, ekhono ghumaccho? Bapre ki ghum!', tag: '😴 SLEEPING BEAUTY' },
    { text: 'Wake up right now! Porashonar somoy ghumonor certificate pabe naki?!', tag: '📢 SIREN ALARM' }
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
    const list = FUNNY_MEMES[eventType] || [{ text: 'FocusGuard AI is watching you! Padhai karo!', tag: '🤖 GUARD' }];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex].text;
  }

  getFunnyMemeObject(eventType) {
    const list = FUNNY_MEMES[eventType] || [{ text: 'FocusGuard AI is watching you! Padhai karo!', tag: '🤖 GUARD' }];
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
