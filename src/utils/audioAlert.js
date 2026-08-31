/**
 * Web Audio API High-Precision Alarm Engine
 * Generates loud, reliable alarm sounds synthetically with 0 external network dependencies.
 */

class AudioAlertEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.soundType = localStorage.getItem('alert_sound_type') || 'ALARM_CLOCK';
    this.volume = parseFloat(localStorage.getItem('alert_volume') || '1.0');
    this.enabled = localStorage.getItem('alert_sound_enabled') !== 'false';
    this.activeNodes = [];
    this.stopTimer = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  setSoundType(type) {
    this.soundType = type;
    localStorage.setItem('alert_sound_type', type);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('alert_volume', String(this.volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('alert_sound_enabled', String(enabled));
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Triggers the alarm sound
   */
  async playAlarm({ typeOverride = null, durationSeconds = 5 } = {}) {
    if (!this.enabled && !typeOverride) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.stop();
      this.isPlaying = true;

      const type = typeOverride || this.soundType;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volume * 0.7, ctx.currentTime);
      gainNode.connect(ctx.destination);

      if (type === 'MELODIC_BELL') {
        this.playMelodicBell(ctx, gainNode);
      } else if (type === 'RADAR_PING') {
        this.playRadarPing(ctx, gainNode);
      } else if (type === 'CYBER_SIREN') {
        this.playCyberSiren(ctx, gainNode);
      } else {
        // ALARM_CLOCK (Default Loud Digital Pulsing)
        this.playAlarmClock(ctx, gainNode);
      }

      if (durationSeconds > 0) {
        this.stopTimer = setTimeout(() => {
          this.stop();
        }, durationSeconds * 1000);
      }
    } catch (err) {
      console.warn('Audio alert playback notice:', err);
    }
  }

  playAlarmClock(ctx, masterGain) {
    const totalBursts = 12;
    for (let b = 0; b < totalBursts; b++) {
      const startTime = ctx.currentTime + b * 0.35;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const burstGain = ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(880, startTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, startTime);

      burstGain.gain.setValueAtTime(0, startTime);
      burstGain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
      burstGain.gain.setValueAtTime(0.8, startTime + 0.16);
      burstGain.gain.linearRampToValueAtTime(0, startTime + 0.18);

      osc1.connect(burstGain);
      osc2.connect(burstGain);
      burstGain.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + 0.20);
      osc2.stop(startTime + 0.20);

      this.activeNodes.push(osc1, osc2);
    }
  }

  playMelodicBell(ctx, masterGain) {
    const chords = [
      { f1: 1046.5, f2: 1318.5, delay: 0 },
      { f1: 1174.6, f2: 1567.9, delay: 0.4 },
      { f1: 1318.5, f2: 1760.0, delay: 0.8 },
      { f1: 2093.0, f2: 2637.0, delay: 1.3 }
    ];

    chords.forEach(({ f1, f2, delay }) => {
      const startTime = ctx.currentTime + delay;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f1, startTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(f2, startTime);

      noteGain.gain.setValueAtTime(0.7, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + 1.3);
      osc2.stop(startTime + 1.3);

      this.activeNodes.push(osc1, osc2);
    });
  }

  playRadarPing(ctx, masterGain) {
    for (let i = 0; i < 8; i++) {
      const startTime = ctx.currentTime + i * 0.45;
      const osc = ctx.createOscillator();
      const pingGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, startTime);
      osc.frequency.exponentialRampToValueAtTime(600, startTime + 0.25);

      pingGain.gain.setValueAtTime(0.9, startTime);
      pingGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.30);

      osc.connect(pingGain);
      pingGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.35);

      this.activeNodes.push(osc);
    }
  }

  playCyberSiren(ctx, masterGain) {
    const osc = ctx.createOscillator();
    const sirenGain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    
    // Siren sweep up and down
    for (let c = 0; c < 4; c++) {
      const cycleStart = now + c * 0.8;
      osc.frequency.setValueAtTime(500, cycleStart);
      osc.frequency.linearRampToValueAtTime(1400, cycleStart + 0.4);
      osc.frequency.linearRampToValueAtTime(500, cycleStart + 0.8);
    }

    sirenGain.gain.setValueAtTime(0.5, now);
    sirenGain.gain.linearRampToValueAtTime(0.5, now + 3.0);
    sirenGain.gain.linearRampToValueAtTime(0, now + 3.2);

    osc.connect(sirenGain);
    sirenGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 3.3);

    this.activeNodes.push(osc);
  }

  stop() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }
}

export const audioAlert = new AudioAlertEngine();
