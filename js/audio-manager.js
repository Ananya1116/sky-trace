/**
 * audio-manager.js
 * Procedural Web Audio API sound synthesizer and speech synthesis phonics engine.
 * Generates sparkling chimes, dings, fanfare, and kid-friendly phonics speech.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.speechSynth = window.speechSynthesis || null;
    this.voice = null;
    this.lastSparkleTime = 0;

    // Load available voices when ready
    if (this.speechSynth) {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.selectFriendlyVoice();
      }
      this.selectFriendlyVoice();
    }
  }

  // Ensure AudioContext is initialized on user interaction
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  selectFriendlyVoice() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    // Prefer warm, natural English voices (Google, Natural, Samantha, Jenny, etc.)
    const preferred = voices.find(v =>
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Female')) &&
      v.lang.startsWith('en')
    );
    this.voice = preferred || voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.speechSynth) {
      this.speechSynth.cancel();
    }
    return this.isMuted;
  }

  // Play a soft bubble pop for button clicks
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Shimmering sparkle chime while actively tracing
  playSparkle() {
    if (this.isMuted) return;
    const nowMs = performance.now();
    // Throttle sparkles to every 90ms so it sounds musical, not noisy
    if (nowMs - this.lastSparkleTime < 90) return;
    this.lastSparkleTime = nowMs;

    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    // Musical pentatonic notes for magical fairy dust
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Gentle ding when reaching a checkpoint
  playCheckpoint() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Bright uplifting 2-note chime when a stroke is fully completed
  playStrokeSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 987.77]; // E5, B5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  // Soft playful "boop" for off-track warning (gentle and friendly)
  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Triumphant victory fanfare when the entire letter is completed
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Triumphant fanfare arpeggio: C5, E5, G5, High C6
    const melody = [
      { f: 523.25, t: 0.0, d: 0.14 },
      { f: 659.25, t: 0.14, d: 0.14 },
      { f: 783.99, t: 0.28, d: 0.18 },
      { f: 1046.50, t: 0.46, d: 0.75 }
    ];

    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + note.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + note.d);
    });
  }

  // Speak phonics, letter name, or cheering message
  speak(text, onEnd = null) {
    if (this.isMuted || !this.speechSynth) return;

    this.speechSynth.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 0.92;  // Slightly slower, clear for kids
    utterance.pitch = 1.15; // Friendly, warm, slightly cheerful pitch
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.speechSynth.speak(utterance);
  }

  // Speak phonics sound for a letter
  speakPhonics(letterItem) {
    const praises = ['Terrific!', 'Super star!', 'You got it!', 'Hooray!', 'Awesome tracing!'];
    const randomPraise = praises[Math.floor(Math.random() * praises.length)];
    const message = `${randomPraise} ${letterItem.letter}! ${letterItem.phonics}`;
    this.speak(message);
  }
}
