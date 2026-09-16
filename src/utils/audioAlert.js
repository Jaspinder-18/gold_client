/**
 * Web Audio API High-Precision Alarm Engine
 * Simplified into 5 clean, reliable options:
 * 1. Sound 1: Radar Alarm (RADAR_ALERT)
 * 2. Sound 2: Digital Alarm Clock (ALARM_CLOCK)
 * 3. Sound 3: Melodic Chime Bell (REMINDER_BELL)
 * 4. Vibration Only: Muted audio with haptic vibration (VIBRATE_ONLY)
 * 5. Browser / Device Sound: Standard device system beep (DEVICE_SOUND)
 */

export const ALERT_SOUND_OPTIONS = [
  { id: 'RADAR_ALERT', label: 'Sound 1: Radar Alert (Urgent)' },
  { id: 'ALARM_CLOCK', label: 'Sound 2: Digital Alarm Clock' },
  { id: 'REMINDER_BELL', label: 'Sound 3: Melodic Chime Bell' },
  { id: 'VIBRATE_ONLY', label: 'Vibration Only (Muted Audio)' },
  { id: 'DEVICE_SOUND', label: 'Device / Browser Standard Sound' }
];

class AudioAlertEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    let savedType = localStorage.getItem('alert_sound_type') || 'ALARM_CLOCK';
    // Legacy migration
    if (savedType === 'RADAR_PING' || savedType === 'CYBER_SIREN') savedType = 'RADAR_ALERT';
    if (savedType === 'MELODIC_BELL') savedType = 'REMINDER_BELL';
    this.soundType = savedType;

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

    const type = typeOverride || this.soundType;

    // Trigger device vibration if available
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 200, 600]);
      }
    } catch (_) {}

    if (type === 'VIBRATE_ONLY') {
      // Audio is muted in vibration only mode
      return;
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.stop();
      this.isPlaying = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volume * 0.75, ctx.currentTime);
      gainNode.connect(ctx.destination);

      if (type === 'REMINDER_BELL' || type === 'MELODIC_BELL') {
        this.playMelodicBell(ctx, gainNode);
      } else if (type === 'RADAR_ALERT' || type === 'RADAR_PING' || type === 'CYBER_SIREN') {
        this.playRadarAlert(ctx, gainNode);
      } else if (type === 'DEVICE_SOUND') {
        this.playDeviceSound(ctx, gainNode);
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

  // Sound 1: Urgent Radar Alert
  playRadarAlert(ctx, masterGain) {
    for (let i = 0; i < 10; i++) {
      const startTime = ctx.currentTime + i * 0.40;
      const osc = ctx.createOscillator();
      const pingGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, startTime);
      osc.frequency.exponentialRampToValueAtTime(550, startTime + 0.22);

      pingGain.gain.setValueAtTime(0.85, startTime);
      pingGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(pingGain);
      pingGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.32);

      this.activeNodes.push(osc);
    }
  }

  // Sound 2: Digital Alarm Clock (Pulsing Beep-Beep)
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
      burstGain.gain.linearRampToValueAtTime(0.85, startTime + 0.02);
      burstGain.gain.setValueAtTime(0.85, startTime + 0.16);
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

  // Sound 3: Melodic Chime Bell
  playMelodicBell(ctx, masterGain) {
    const chords = [
      { f1: 1046.5, f2: 1318.5, delay: 0 },
      { f1: 1174.6, f2: 1567.9, delay: 0.35 },
      { f1: 1318.5, f2: 1760.0, delay: 0.70 },
      { f1: 2093.0, f2: 2637.0, delay: 1.15 }
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

  // Sound 5: Standard Device / Browser Single Notification Beep
  playDeviceSound(ctx, masterGain) {
    const osc = ctx.createOscillator();
    const beepGain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1200, now + 0.12);

    beepGain.gain.setValueAtTime(0.8, now);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(beepGain);
    beepGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.50);

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
      } catch (_) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch (_) {}
  }
}

export const audioAlert = new AudioAlertEngine();
