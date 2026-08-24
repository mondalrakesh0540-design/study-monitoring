# FocusGuard AI 🛡️🤖

FocusGuard AI is a funny, browser-based study-monitoring web application built with Vite, React (JavaScript), and MediaPipe Face Detection. It monitors student presence and attentiveness using the webcam and browser page visibility API, playing funny alerts and warning messages whenever the student steps away, gets distracted, or switches browser tabs.

---

## 1. Project Overview & Features

- 📹 **100% Local Webcam Feed**: Runs MediaPipe WebAssembly face detection directly inside your browser. No video frames or images are recorded, stored, or uploaded.
- ⏱️ **Study Session Timers**: Tracks total session time, focused time, and distracted time separately with real-time percentage stats.
- 🚨 **Face Presence & Distraction Detection**:
  - Triggers an alert if no face is detected continuously for 5 seconds.
  - Detects when the user turns away from the screen for ~5 seconds.
  - Automatically resets status to **Focused** when face returns.
- 👀 **Tab & Window Switch Detector**: Uses `document.visibilitychange` and `window.blur`/`window.focus` to catch tab switching while a study session is active.
- 🔊 **Funny Sound & Voice Alerts**: Plays hilarious Benglish warning voice clips with built-in Web Audio API Synthesizer fallback, volume controls, mute toggle, and an 8-second alert cooldown.
- 📊 **Activity Event History**: Tracks up to 10 recent activity log events with exact timestamps.
- 🐞 **Debug Panel**: Shows real-time face detection status, missing duration, camera status, and MediaPipe model readiness.

---

## 2. Project Directory Structure

```
focusguard-ai/
├── public/
│   └── audio/
│       ├── README.txt
│       ├── start-study.mp3
│       ├── tab-change.mp3
│       ├── face-missing.mp3
│       ├── distracted.mp3
│       └── back-to-study.mp3
├── src/
│   ├── components/
│   │   ├── CameraMonitor.jsx
│   │   ├── StudyControls.jsx
│   │   ├── StatusPanel.jsx
│   │   ├── SessionTimer.jsx
│   │   └── AlertHistory.jsx
│   ├── hooks/
│   │   ├── useCamera.js
│   │   ├── useFaceDetection.js
│   │   └── useVisibilityMonitor.js
│   ├── utils/
│   │   └── audioManager.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Installation & Run Commands (Ubuntu & Cross-Platform)

Run the following commands in your terminal:

```bash
# Clone or navigate to the project root directory
cd focusguard-ai

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be served at `http://localhost:3000` (or `http://localhost:5173`).

---

## 4. Instructions for Adding MP3 Files

Place your MP3 files into the `public/audio/` directory:
- `public/audio/start-study.mp3`
- `public/audio/tab-change.mp3`
- `public/audio/face-missing.mp3`
- `public/audio/distracted.mp3`
- `public/audio/back-to-study.mp3`

> 💡 **Note**: If any MP3 audio file is missing or blocked by browser autoplay policies, FocusGuard AI automatically uses a Web Audio API Synthesizer to generate funny custom sound tones so the app **never crashes**.

---

## 5. Chrome / Chromium Camera Permissions Setup

Browsers restrict camera access on unsecure connections.
1. Open the app using `http://localhost:3000` or HTTPS.
2. Click **Start Camera**.
3. When Chrome displays the permission popup, click **Allow**.
4. If permission was accidentally blocked:
   - Click the **Lock / Site Settings** icon next to the URL bar (`chrome://settings/content/siteDetails`).
   - Change **Camera** setting to **Allow**.
   - Refresh the page and click **Start Camera**.

---

## 6. Deployment to Vercel

To deploy FocusGuard AI on Vercel:

### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Using GitHub Integration
1. Push your repository to GitHub (see Section 7 below).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New Project**.
3. Import your `focusguard-ai` GitHub repository.
4. Select **Vite** as Framework Preset.
5. Click **Deploy**.

---

## 7. GitHub Upload Commands

```bash
git init
git add .
git commit -m "Initial commit of FocusGuard AI study monitor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/focusguard-ai.git
git push -u origin main
```

---

## 8. Troubleshooting Guide

- **Camera Error / Blank Feed**: Ensure no other application (Zoom, Teams, Skype) is using the webcam.
- **Model Failed to Load**: Check internet connection. MediaPipe loads WASM files from CDN on first launch.
- **Audio Not Playing**: Click anywhere on the webpage to satisfy Chrome autoplay security policies, or check volume slider / mute button in the app.

---

## 9. Testing Checklist

- [x] **Camera Preview**: Click "Start Camera", verify live video feed appears with green status badge.
- [x] **Start/Stop Session**: Click "Start Study", verify timer increments and "Focused" status displays.
- [x] **Face Missing Alert**: Step out of camera view for 5 seconds; verify red alert badge and warning audio trigger.
- [x] **Face Return**: Re-enter camera view; verify status switches to green "Focused & Studying" and audio chime plays.
- [x] **Tab Switch Alert**: Switch browser tabs while study session is active; verify tab change warning audio plays.
- [x] **Audio Cooldown**: Verify 8-second cooldown prevents repeated loud audio spamming.
- [x] **Session Reset**: Click "Reset Session"; verify timer counters and log reset to 0.
