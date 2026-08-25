// src/utils/speechSpeaker.js
// Speech Synthesis utility to speak out detected items in natural Hindi / English voice.

class SpeechSpeaker {
  constructor() {
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.cooldownMs = 4000;
  }

  speak(text, force = false) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const now = Date.now();
    if (!force && this.lastSpokenText === text && now - this.lastSpokenTime < this.cooldownMs) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India') || v.name.includes('Hindi')
      );
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      window.speechSynthesis.speak(utterance);
      this.lastSpokenText = text;
      this.lastSpokenTime = now;
      console.log(`[SpeechSpeaker] Spoke: "${text}"`);
    } catch (e) {
      console.warn('[SpeechSpeaker] Speech synthesis failed:', e);
    }
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSpeaker = new SpeechSpeaker();
