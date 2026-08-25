// src/utils/audioManager.js
// FocusGuard AI Indian Meme Sound Manager
// Featuring: Modi Ji, Rahul Gandhi, ACP Pradyuman (CID), Bhaiyaaa, Mamata Banerjee (Momota), Puneet Superstar, Baburao, Ashneer, Arnab

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
    '/audio/distracted.mp3',
    '/audio/distracted.wav',
    'https://www.myinstants.com/media/sounds/bhaiyaaaaa.mp3'
  ],
  'back-to-study': [
    '/audio/back-to-study.mp3',
    '/audio/back-to-study.wav',
    'https://www.myinstants.com/media/sounds/maja-aaya.mp3'
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
  'noise-meme': [
    '/audio/noise-meme.mp3',
    '/audio/noise-meme.wav',
    'https://www.myinstants.com/media/sounds/chup-bilkul-chup.mp3'
  ],
  'ashneer-meme': [
    '/audio/ashneer-meme.mp3',
    '/audio/ashneer-meme.wav',
    'https://www.myinstants.com/media/sounds/kya-kar-raha-hai-tu.mp3'
  ],
  'puneet-meme': [
    '/audio/puneet-meme.mp3',
    '/audio/puneet-meme.wav',
    'https://www.myinstants.com/media/sounds/saale-itne-chaate-marunga-puneet-superstar.mp3'
  ]
};

export const FUNNY_MEMES = {
  'start-study': [
    { text: 'Modi Ji: Wah Modiji Wah! Mitron, padhai shuru karo, topper banna hai!', tag: '🇮🇳 MODI JI MOTIVATION' },
    { text: 'Study Mode ACTIVATED! No phone, no Insta, only 100% Focus!', tag: '🚀 TOPPER VIBES' },
    { text: 'Mitron! Aaj pura chapter padh ke hi sona hai!', tag: '📚 MODI MISSION' }
  ],
  'tab-change': [
    { text: 'Rahul Gandhi: Khatam! Tata, Bye Bye, Goodbye, Gaya! Tab switch mat karo!', tag: '🚨 KHATAM TATA BYE BYE' },
    { text: 'Caught in 4K! YouTube naki Insta Reels? Padhai pe dhyan do!', tag: '📱 NO REELS' },
    { text: 'Alt+Tab cheat bandh karo! Camera sab dekh raha hai!', tag: '🛑 TAB SWITCH DETECTED' }
  ],
  'face-missing': [
    { text: 'ACP Pradyuman: Daya, yaha kuchh to gadbad hai! Bachha desk se gayab hai!', tag: '🕵️‍♂️ ACP PRADYUMAN (CID)' },
    { text: 'Oi! Porte bose kothay gele? Bhoot hoye gele naki?!', tag: '👻 GHOST MODE' },
    { text: 'Daya, pata lagao! Kithe bhaag gaya padhai chhod ke?', tag: '🔍 CID DETECTIVE' }
  ],
  'distracted': [
    { text: 'Bhaiyaaaaa! Phone rakho, screen pe dhyan do!', tag: '🗣️ BHAIYAAAA ALERT' },
    { text: 'Halka ghum pachche? Chokhe jol diye asho! Wake up!', tag: '🥱 LIGHT SLEEP (5s)' },
    { text: 'Screen-e mon dao! Pashe ki dekhcho? Crush-er DP?', tag: '👀 DISTRACTED' }
  ],
  'back-to-study': [
    { text: 'Rahul Gandhi: Aur yeh jo maza hai, topper banne me sabko milega!', tag: '👏 MAZA AAYA' },
    { text: 'Modi Ji: Shabash! Great comeback! 100% Focus locked in!', tag: '🌟 SHABASH' },
    { text: 'Good student! Focus restored! Ebar puro chapter sesh koro!', tag: '🏆 CHAMPION' }
  ],
  'sleep-warning': [
    { text: 'Momota: Khela Hobe! Utho bhai, ghumano bondho koro!', tag: '💥 MOMOTA (KHELA HOBE)' },
    { text: 'WAKE UP! ৩০ সেকেন্ড ধরে ঘুমাচ্ছো! Kumbhakarna naki tumi?!', tag: '⏰ DEEP SLEEP (30s+)' },
    { text: '30 second hoye gelo, ekhono ghumaccho? Bapre ki ghum!', tag: '😴 SLEEPING BEAUTY' }
  ],
  'yawn-meme': [
    { text: 'Puneet Superstar: Saale itne chaate marunga na! Padhai ke time jhamai/yawn le raha hai?!', tag: '🥱 YAWN DETECTED' },
    { text: 'Ashneer: Bhai kya kar raha hai tu yaar?! Munh band kar ke padh!', tag: '🤦‍♂️ DOGLAPAN' }
  ],
  'smile-meme': [
    { text: 'Arnab Goswami: Kuch bhi?! Kuch bhi?! Padhai ke time akele akele kyu hass raha hai?', tag: '😂 SMILING AT PHONE' },
    { text: 'ACP Pradyuman: Daya! Bachha padhte padhte muskura raha hai... Zarur koi chakkar hai!', tag: '🕵️‍♂️ SUSPICIOUS SMILE' }
  ],
  'noise-meme': [
    { text: 'Baburao / Nana: Chup! Bilkul Chup! Padhai ke time itna shor kyu macha raha hai?!', tag: '🤫 LOUD NOISE / TALKING' },
    { text: 'Awaaz neeche! Silence zone hai ye!', tag: '📢 NOISE ALERT' }
  ]
};

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.volume = 0.8;
    this.muted = false;
    this.lastPlayTimes = {};
    this.cooldownMs = 3000;
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
