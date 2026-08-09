// Web Audio API Sonification Engine for Algorithm Visualizer
// Dynamically synthesizes audio pitch mapped to array values and algorithm events.

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = false;
    this.volume = 0.15;
    this.soundProfile = 'marimba'; // 'sine' | 'synth' | 'marimba' | 'arcade'
    
    // Audio Node Pooling
    this.poolSize = 15;
    this.oscPool = [];
    this.poolIndex = 0;
    this.isPoolInitialized = false;
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
    if (this.audioCtx && !this.isPoolInitialized && this.isEnabled) {
      this.initializePool();
    }
  }

  initializePool() {
    this.oscPool = [];
    for (let i = 0; i < this.poolSize; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine'; // Default type
      gain.gain.value = 0; // Silent initially
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(); // Start them immediately, but they are silent
      
      this.oscPool.push({ osc, gain, isActive: false });
    }
    this.isPoolInitialized = true;
  }

  enable() {
    this.isEnabled = true;
    this.init();
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
    // Update all oscillators in pool to new waveform type
    if (this.isPoolInitialized) {
      const typeMap = {
        'arcade': 'square',
        'synth': 'sawtooth',
        'marimba': 'sine',
        'sine': 'sine'
      };
      const newType = typeMap[profile] || 'sine';
      this.oscPool.forEach(node => {
        node.osc.type = newType;
      });
    }
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
    if (!this.audioCtx || !this.isPoolInitialized) return;

    try {
      const freq = this.calcFreq(val, minVal, maxVal);
      const now = this.audioCtx.currentTime;

      // Get next available oscillator from pool (Round Robin)
      const node = this.oscPool[this.poolIndex];
      this.poolIndex = (this.poolIndex + 1) % this.poolSize;

      // Handle waveform specifics per type temporarily if needed, though usually profile dictates this
      if (this.soundProfile === 'arcade') {
        node.osc.type = type === 'swap' ? 'square' : 'triangle';
      } else if (this.soundProfile === 'synth') {
        node.osc.type = type === 'swap' ? 'sawtooth' : 'sine';
      } else if (this.soundProfile === 'marimba') {
        node.osc.type = 'sine';
      }

      // Snap frequency
      node.osc.frequency.setValueAtTime(freq, now);

      // Envelope logic via Gain
      const peakVol = type === 'swap' ? this.volume * 1.2 : this.volume;
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setValueAtTime(0, now);
      node.gain.gain.linearRampToValueAtTime(peakVol, now + 0.01); // Quick Attack
      node.gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Decay
      node.gain.gain.setValueAtTime(0, now + duration + 0.01); // Ensure it drops to pure 0
      
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
    if (!this.audioCtx || !this.isPoolInitialized) return;

    // Victory arpeggio chord
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const now = this.audioCtx.currentTime;
          const node = this.oscPool[this.poolIndex];
          this.poolIndex = (this.poolIndex + 1) % this.poolSize;

          node.osc.type = 'triangle';
          node.osc.frequency.setValueAtTime(freq, now);

          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setValueAtTime(0, now);
          node.gain.gain.linearRampToValueAtTime(this.volume * 1.5, now + 0.02);
          node.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
          node.gain.gain.setValueAtTime(0, now + 0.36);
        } catch (e) {}
      }, idx * 70);
    });
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
