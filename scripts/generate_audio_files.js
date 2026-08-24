// scripts/generate_audio_files.js
// Generates valid audio files for public/audio/ using ES modules

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Function to generate a simple WAV audio buffer with custom frequencies
function createWavBuffer(freqs, durationSec = 0.8, sampleRate = 22050) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    freqs.forEach((f, idx) => {
      const startTime = (idx * durationSec) / freqs.length;
      const endTime = ((idx + 1) * durationSec) / freqs.length;
      if (t >= startTime && t <= endTime) {
        sample += Math.sin(2 * Math.PI * f * t);
      }
    });

    // Envelope decay
    const envelope = Math.max(0, 1 - t / durationSec);
    const intSample = Math.floor(sample * envelope * 16000);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, intSample)), 44 + i * 2);
  }

  return buffer;
}

const audioConfigs = {
  'start-study.mp3': [261, 329, 392, 523],
  'tab-change.mp3': [220, 660, 330],
  'face-missing.mp3': [400, 800, 400, 800],
  'distracted.mp3': [180, 140, 180],
  'back-to-study.mp3': [392, 523, 659]
};

Object.entries(audioConfigs).forEach(([filename, freqs]) => {
  const wavBuf = createWavBuffer(freqs);
  const filePath = path.join(audioDir, filename);
  fs.writeFileSync(filePath, wavBuf);
  console.log(`Generated audio file: ${filename}`);
});
