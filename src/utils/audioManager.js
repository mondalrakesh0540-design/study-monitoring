// src/utils/audioManager.js
// FocusGuard AI - 18+ Spicy Hindi Meme Voice Sound Manager

const AUDIO_FILES = {
  'start-study': [
    '/audio/start-study.mp3',
    '/audio/start-study.wav',
    'https://www.myinstants.com/media/sounds/wah-modiji-wah.mp3'
  ],
  'tab-change': [
    '/audio/tab-change.mp3',
    '/audio/tab-change.wav',
    'https://www.myinstants.com/media/sounds/rahul-gandhi-khatam-tata-good-bye.mp3'
  ],
  'face-missing': [
    '/audio/face-missing.mp3',
    '/audio/face-missing.wav',
    'https://www.myinstants.com/media/sounds/nahi-nahi-saluke-yaha-kuchh-to-gadbad-hai.mp3'
  ],
  'distracted': [
    '/audio/chal-bsdk-meme.mp3',
    '/audio/distracted.mp3',
    '/audio/distracted.wav'
  ],
  'back-to-study': [
    '/audio/shabash-meme.mp3',
    '/audio/back-to-study.mp3',
    '/audio/back-to-study.wav'
  ],
  'sleep-warning': [
    '/audio/sleep-warning.mp3',
    '/audio/sleep-warning.wav',
    'https://www.myinstants.com/media/sounds/khelaa-hobee.mp3'
  ],
  'yawn-meme': [
    '/audio/yawn-meme.mp3',
    '/audio/yawn-meme.wav',
    'https://www.myinstants.com/media/sounds/saale-itne-chaate-marunga-puneet-superstar.mp3'
  ],
  'smile-meme': [
    '/audio/smile-meme.mp3',
    '/audio/smile-meme.wav',
    'https://www.myinstants.com/media/sounds/arnab-kuch-bhi.mp3'
  ],
  'shocked-meme': [
    '/audio/shocked-meme.mp3',
    '/audio/shocked-meme.wav',
    'https://www.myinstants.com/media/sounds/are-baap-re.mp3'
  ],
  'angry-meme': [
    '/audio/angry-meme.mp3',
    '/audio/angry-meme.wav',
    'https://www.myinstants.com/media/sounds/arpit-bala-bkl-gussa-aa-jata-hai.mp3'
  ],
  'pushpa-meme': [
    '/audio/pushpa-meme.mp3',
    '/audio/pushpa-meme.wav',
    'https://www.myinstants.com/media/sounds/pushpa-fireee.mp3'
  ],
  'shabash-meme': [
    '/audio/shabash-meme.mp3',
    '/audio/shabash-meme.wav',
    'https://www.myinstants.com/media/sounds/shabash-beta.mp3'
  ],
  'roadies-meme': [
    '/audio/roadies-meme.mp3',
    '/audio/roadies-meme.wav'
  ],
  'chutiya-meme': [
    '/audio/chutiya-meme.mp3',
    '/audio/chutiya-meme.wav'
  ],
  'chal-bsdk-meme': [
    '/audio/chal-bsdk-meme.mp3',
    '/audio/chal-bsdk-meme.wav'
  ],
  'kyu-re-meme': [
    '/audio/kyu-re-meme.mp3',
    '/audio/kyu-re-meme.wav'
  ],
  'puneet-gaya-meme': [
    '/audio/puneet-gaya-meme.mp3',
    '/audio/puneet-gaya-meme.wav'
  ],
  'gaand-danda-meme': [
    '/audio/gaand-danda-meme.mp3',
    '/audio/gaand-danda-meme.wav'
  ]
};

export const FUNNY_MEMES = {
  'start-study': [
    { text: 'Modi Ji: Wah Modiji Wah! Mitron, padhai shuru karo, topper banna hai!', tag: '🇮🇳 MODI JI MOTIVATION' },
    { text: 'Study Mode ACTIVATED! Phone hatao aur dhyan do!', tag: '🚀 TOPPER VIBES' }
  ],
  'tab-change': [
    { text: 'Rahul Gandhi: Khatam! Tata, Bye Bye, Goodbye, Gaya! Tab switch mat karo!', tag: '🚨 KHATAM TATA BYE BYE' },
    { text: 'Caught in 4K! YouTube naki Insta Reels? Padhai pe dhyan do!', tag: '📱 NO REELS' }
  ],
  'face-missing': [
    { text: 'ACP Pradyuman: Daya, yaha kuchh to gadbad hai! Bachha desk se gayab hai!', tag: '🕵️‍♂️ ACP PRADYUMAN (CID)' },
    { text: 'Oi! Porte bose kothay gele? Desk chhod ke kithe bhaag gaya?', tag: '👻 GHOST MODE' }
  ],
  'distracted': [
    { text: 'Chal Bhosdike! Phone rakho, screen pe dhyan do!', tag: '🤬 18+ DISTRACTION ALERT' },
    { text: 'Bhaiyaaaaa! Screen-e mon dao! Pashe ki dekhcho?', tag: '🗣️ BHAIYAAAA ALERT' }
  ],
  'back-to-study': [
    { text: 'Shabash Beta: Bohot badhiya! Focus restored, keep studying!', tag: '🌟 SHABASH BETA' },
    { text: 'Pushpa Raj: Main Jhukega Nahi! Ebar pura syllabus complete hobe!', tag: '🔥 PUSHPA MODE' }
  ],
  'sleep-warning': [
    { text: 'Momota: Khela Hobe! Utho bhai, ghumano bondho koro!', tag: '💥 MOMOTA (KHELA HOBE)' },
    { text: 'WAKE UP! ৩০ সেকেন্ড ধরে ঘুমাচ্ছো! Kumbhakarna naki tumi?!', tag: '⏰ DEEP SLEEP (30s+)' }
  ],
  'yawn-meme': [
    { text: 'Puneet Superstar: Saale itne chaate marunga na! Padhai ke time jhamai/yawn le raha hai?!', tag: '🥱 YAWN DETECTED' },
    { text: 'Lord Puneet: Ab tu gaya beta! Jhamai keno dichho?', tag: '😡 PUNEET RAGE' }
  ],
  'smile-meme': [
    { text: 'Arnab Goswami: Kuch bhi?! Kuch bhi?! Padhai ke time akele akele kyu hass raha hai?', tag: '😂 SMILING AT PHONE' },
    { text: 'Tum Chutiya Ho! Padhai chhod ke akele kyu muskura raha hai?', tag: '🤡 SUSPICIOUS SMILE' }
  ],
  'shocked-meme': [
    { text: 'Arey Baap Re! Ye kya dekh liya?! Aankhein khuli ki khuli reh gayi!', tag: '😲 SHOCKED EXPRESSION' }
  ],
  'angry-meme': [
    { text: 'Arpit Bala: Bkl bina baat ke gussa aa jata hai! Padhai se kyu chidh raha hai?', tag: '😠 ANGRY / FROWNING' }
  ],
  'roadies-meme': [
    { text: 'Roadies Rage: Bhosdike madarchod been k loray! Dhyan se padhai kar!', tag: '🤬 ROADIES RAGE' }
  ],
  'chutiya-meme': [
    { text: 'Tum Chutiya Ho! Padhai me dhyan lagao!', tag: '🤡 CHUTIYA ALERT' }
  ],
  'chal-bsdk-meme': [
    { text: 'Chal Bhosdike! Bakwaas bandh karo aur kitaab kholo!', tag: '🔥 CHAL BSDK' }
  ],
  'kyu-re-meme': [
    { text: 'Kyu re Madarchod! Kiske baare me soch raha hai?!', tag: '💥 VULGAR SPICY' }
  ],
  'puneet-gaya-meme': [
    { text: 'Lord Puneet: Ab tu gaya beta, ab dekh tu!', tag: '👑 LORD PUNEET' }
  ],
  'gaand-danda-meme': [
    { text: 'Gaand Me Danda De! Abhi ke abhi padhne baith!', tag: '⚡ SPICY AUDIO' }
  ]
};

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.85;
    this.muted = false;
    this.lastPlayTimes = {};
    this.cooldownMs = 2500;
    this.audioContext = null;
    this.audioCache = {};

    if (typeof window !== 'undefined') {
      this.preloadAll();
    }
  }

  preloadAll() {
    try {
      for (const [key, paths] of Object.entries(AUDIO_FILES)) {
        if (paths && paths.length > 0) {
          const audio = new Audio(paths[0]);
          audio.preload = 'auto';
          this.audioCache[key] = audio;
        }
      }
    } catch (e) {
      console.warn('[AudioManager] Audio preloading skipped:', e);
    }
  }

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
    for (const key in this.audioCache) {
      if (this.audioCache[key]) {
        this.audioCache[key].volume = this.muted ? 0 : this.volume;
      }
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
    for (const key in this.audioCache) {
      if (this.audioCache[key]) {
        this.audioCache[key].volume = this.muted ? 0 : this.volume;
      }
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

    if (this.audioCache[eventType]) {
      try {
        const audio = this.audioCache[eventType];
        audio.currentTime = 0;
        audio.volume = this.muted ? 0 : this.volume;
        this.currentAudio = audio;
        await audio.play();
        return { played: true };
      } catch (err) {
        console.warn(`[AudioManager] Cached play failed for ${eventType}, fallback:`, err);
      }
    }

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
        this.audioCache[eventType] = audio;
        break;
      } catch (err) {
        console.warn(`[AudioManager] Playback failed for ${audioPath}:`, err.message);
      }
    }

    if (!playedSuccessfully) {
      this.playSynthFallback(eventType);
      playedSuccessfully = true;
    }

    return { played: playedSuccessfully };
  }

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

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
