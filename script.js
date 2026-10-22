/**
 * PORSCHE 911 GT3 RS — MOTORSPORT ENGINE & INTERACTION CONTROLLER
 * High-performance, zero-bloat vanilla JavaScript architecture.
 */

// =============================================================================
// 1. CAR SPECIFICATIONS & EDITIONS DATA
// =============================================================================
const STAGE_CARS = [
  {
    id: 'gt3rs-blue',
    brand: 'PORSCHE MOTORSPORT',
    model: '911 GT3 RS (992)',
    sub: 'Weissach Cobalt Livery',
    speed: '296',
    accel: '3.2',
    hp: '525',
    icon: 'assets/icons/dock-porsche-blue.png',
    themeColor: '#0066d6',
    image: 'assets/images/gt3rs-blue.webp',
    link: 'gt3rs.html'
  },
  {
    id: 'gt3rs-red',
    brand: 'PORSCHE MOTORSPORT',
    model: '911 GT3 RS (GUARDS RED)',
    sub: 'Nordschleife Record Edition',
    speed: '296',
    accel: '3.2',
    hp: '525',
    icon: 'assets/icons/dock-porsche-red.png',
    themeColor: '#d91424',
    image: 'assets/images/gt3rs-red.webp',
    link: 'gt3rs.html'
  },
  {
    id: 'gt3rs-green',
    brand: 'PORSCHE MOTORSPORT',
    model: '911 GT3 RS (MANTHEY)',
    sub: 'Manthey Racing Aero Spec',
    speed: '296',
    accel: '3.2',
    hp: '525',
    icon: 'assets/icons/dock-porsche-green.png',
    themeColor: '#14be50',
    image: 'assets/images/gt3rs-green.webp',
    link: 'gt3rs.html'
  },
  {
    id: 'gt3rs-yellow',
    brand: 'PORSCHE MOTORSPORT',
    model: '911 GT3 RS (RACING YELLOW)',
    sub: 'Weissach Magnesium Spec',
    speed: '296',
    accel: '3.2',
    hp: '525',
    icon: 'assets/icons/dock-porsche-yellow.png',
    themeColor: '#ebb400',
    image: 'assets/images/gt3rs-yellow.webp',
    link: 'gt3rs.html'
  }
];

// =============================================================================
// 2. WEB AUDIO SYNTHESIS & REAL-TIME ENGINE
// =============================================================================
class PorscheAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isRevving = false;
    this.revAudio = null;
    this.chirpAudio = null;

    // Preload audio elements
    try {
      this.revAudio = new Audio('assets/audio/gt3rs-rev.wav');
      this.revAudio.preload = 'auto';
      this.chirpAudio = new Audio('assets/audio/keyfob-chirp.wav');
      this.chirpAudio.preload = 'auto';
    } catch (e) {
      console.warn('Audio preloading note:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const soundPill = document.getElementById('btnToggleSound');
    if (soundPill) {
      if (this.isMuted) {
        soundPill.classList.add('muted');
        soundPill.classList.remove('playing');
        const text = soundPill.querySelector('.sound-text');
        if (text) text.textContent = 'Sound: OFF';
      } else {
        soundPill.classList.remove('muted');
        soundPill.classList.add('playing');
        const text = soundPill.querySelector('.sound-text');
        if (text) text.textContent = 'Sound: ON';
      }
    }
    return this.isMuted;
  }

  playButtonTick() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  playKeyfobChirp() {
    if (this.isMuted) return;
    
    // Play HTML5 pre-rendered audio if available
    if (this.chirpAudio) {
      this.chirpAudio.currentTime = 0;
      this.chirpAudio.play().catch(() => {});
    }

    // Synthesized Web Audio Fallback
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [0, 0.11].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now + offset);
      osc.frequency.exponentialRampToValueAtTime(3200, now + offset + 0.045);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.25, now + offset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.045);
    });
  }

  playFlatSixRev() {
    if (this.isMuted || this.isRevving) return;
    this.isRevving = true;

    // Visual shake effect
    const activeCarImg = document.querySelector('.lambo-vehicle-card.active .lambo-truck-img') || document.querySelector('.showcase-car-img');
    if (activeCarImg) {
      activeCarImg.classList.add('engine-rumble-shake');
      setTimeout(() => activeCarImg.classList.remove('engine-rumble-shake'), 900);
    }

    const btnRev = document.getElementById('btnRevEngine');
    if (btnRev) {
      btnRev.classList.add('revving');
      setTimeout(() => btnRev.classList.remove('revving'), 1800);
    }

    // Try playing high-fidelity WAV file
    if (this.revAudio) {
      this.revAudio.currentTime = 0;
      this.revAudio.play().catch(() => {});
    }

    // Real-time Web Audio API synthesis
    const ctx = this.ensureContext();
    if (ctx) {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // 4.0L Boxer-6 fundamental firing frequency:
      // Idle 950 RPM: f0 = (950 / 60) * 3 = 47.5 Hz
      // 9,000 RPM Limiter: f0 = (9000 / 60) * 3 = 450 Hz
      osc1.frequency.setValueAtTime(48, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.9);
      osc1.frequency.setValueAtTime(450, now + 1.2);
      osc1.frequency.exponentialRampToValueAtTime(55, now + 2.0);

      osc2.frequency.setValueAtTime(96, now);
      osc2.frequency.exponentialRampToValueAtTime(900, now + 0.9);
      osc2.frequency.setValueAtTime(900, now + 1.2);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(4200, now + 0.9);
      filter.frequency.exponentialRampToValueAtTime(800, now + 2.0);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gain.gain.setValueAtTime(0.35, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.1);
      osc2.stop(now + 2.1);
    }

    setTimeout(() => {
      this.isRevving = false;
    }, 2200);
  }
}

const AUDIO = new PorscheAudioEngine();

// =============================================================================
// 3. MAIN GATEWAY STAGE CONTROLLER (index.html)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Sound Toggle Button
  const btnToggleSound = document.getElementById('btnToggleSound');
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      AUDIO.toggleMute();
    });
  }

  // Rev Engine Button
  const btnRevEngine = document.getElementById('btnRevEngine');
  if (btnRevEngine) {
    btnRevEngine.addEventListener('click', () => {
      if (AUDIO.isMuted) AUDIO.toggleMute();
      AUDIO.playFlatSixRev();
    });
  }

  // Keyfob Chirp Button
  const btnKeyfobTop = document.getElementById('btnKeyfobTop');
  if (btnKeyfobTop) {
    btnKeyfobTop.addEventListener('click', () => {
      AUDIO.playKeyfobChirp();

      // Ambient screen flash feedback
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.inset = '0';
      flash.style.background = 'rgba(0, 102, 214, 0.12)';
      flash.style.pointerEvents = 'none';
      flash.style.zIndex = '99999';
      flash.style.transition = 'opacity 0.28s ease';
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 280);
      }, 70);
    });
  }
});
