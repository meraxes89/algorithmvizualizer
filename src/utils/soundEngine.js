// Web Audio API Sonification Engine for Algorithm Visualizer
// Dynamically synthesizes audio pitch mapped to array values and algorithm events.

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = false;
    this.volume = 0.15;
    this.soundProfile = 'marimba'; // 'sine' | 'synth' | 'marimba' | 'arcade'
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  enable() {
    this.init();
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setProfile(profile) {
    this.soundProfile = profile;
  }

  // Calculate frequency based on value proportion (200Hz to 1200Hz)
  calcFreq(val, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
    // Pentatonic scale frequency mapping for pleasant harmony
    const baseFreq = 220; // A3
    const octaves = 2.5;
    return baseFreq * Math.pow(2, norm * octaves);
  }

  playNote(val, minVal = 5, maxVal = 100, duration = 0.08, type = 'compare') {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const freq = this.calcFreq(val, minVal, maxVal);
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const now = this.audioCtx.currentTime;

      // Select oscillator waveform according to profile & type
      if (this.soundProfile === 'arcade') {
        osc.type = type === 'swap' ? 'square' : 'triangle';
      } else if (this.soundProfile === 'synth') {
        osc.type = type === 'swap' ? 'sawtooth' : 'sine';
      } else if (this.soundProfile === 'marimba') {
        osc.type = 'sine';
      } else {
        osc.type = 'sine';
      }

      osc.frequency.setValueAtTime(freq, now);

      // Envelope: attack and rapid decay for crisp visualizer feedback
      const peakVol = type === 'swap' ? this.volume * 1.2 : this.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (e) {
      // Ignore audio context errors if muted/blocked by browser policy
    }
  }

  playSwap(val1, val2, minVal, maxVal) {
    this.playNote(val1, minVal, maxVal, 0.1, 'swap');
    if (val2 !== undefined) {
      setTimeout(() => this.playNote(val2, minVal, maxVal, 0.1, 'swap'), 30);
    }
  }

  playCompare(val1, minVal, maxVal) {
    this.playNote(val1, minVal, maxVal, 0.06, 'compare');
  }

  playSuccess() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    // Victory arpeggio chord
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const now = this.audioCtx.currentTime;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(this.volume * 1.5, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.36);
        } catch (e) {}
      }, idx * 70);
    });
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
