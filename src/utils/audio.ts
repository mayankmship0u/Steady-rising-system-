// Web Audio API Synthesizer for Dark Fantasy / Hunter Aesthetic Sound FX & Ambient Engine

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Ambient nodes
  private isAmbientActive: boolean = false;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientTimer: NodeJS.Timeout | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Ambient Gain
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
    if (muted && this.isAmbientActive) {
      this.stopAmbient();
    }
  }

  public setMasterVolume(vol: number) {
    this.initCtx();
    if (this.ctx && this.masterGain && !this.isMuted) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public setAmbientVolume(vol: number) {
    this.initCtx();
    if (this.ctx && this.ambientGain) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.ambientGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.1);
    }
  }

  public isAmbientRunning(): boolean {
    return this.isAmbientActive;
  }

  // --- AMBIENT SOUND GENERATOR: "SHADOW SANCTUARY" ATMOSPHERE ---
  public startAmbient(volume: number = 0.25) {
    if (this.isMuted || this.isAmbientActive) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.ambientGain) return;

      this.isAmbientActive = true;
      const now = this.ctx.currentTime;

      // Reset ambient gain with smooth fade in
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), now + 1.5);

      // Low sub-bass binaural mana hum (55Hz and 57.5Hz)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc2 = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.22, now);

      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, now); // A1 note
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(57.5, now); // Slight beat frequency shimmer

      // Filter to keep it deep and warm
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(120, now);
      this.ambientFilter.Q.setValueAtTime(2, now);

      this.ambientOsc1.connect(oscGain);
      this.ambientOsc2.connect(oscGain);
      oscGain.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);

      // Distant cavern / shadow wind noise generator
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise algorithm
        lastOut = output[i];
        output[i] *= 2.5;
      }

      this.ambientNoiseSource = this.ctx.createBufferSource();
      this.ambientNoiseSource.buffer = noiseBuffer;
      this.ambientNoiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(320, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);

      this.ambientNoiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);

      this.ambientNoiseSource.start(now);

      // Periodic subtle high mana crystal twinkle in the background
      const scheduleManaChime = () => {
        if (!this.isAmbientActive || !this.ctx) return;
        this.playManaAmbientChime();
        const nextDelay = 8000 + Math.random() * 10000;
        this.ambientTimer = setTimeout(scheduleManaChime, nextDelay);
      };
      this.ambientTimer = setTimeout(scheduleManaChime, 6000);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  public stopAmbient() {
    if (!this.isAmbientActive) return;
    this.isAmbientActive = false;

    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }

    try {
      if (this.ctx && this.ambientGain) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        setTimeout(() => {
          try {
            this.ambientOsc1?.stop();
            this.ambientOsc1?.disconnect();
            this.ambientOsc2?.stop();
            this.ambientOsc2?.disconnect();
            this.ambientNoiseSource?.stop();
            this.ambientNoiseSource?.disconnect();
          } catch {
            // Already disconnected
          }
          this.ambientOsc1 = null;
          this.ambientOsc2 = null;
          this.ambientNoiseSource = null;
        }, 1300);
      }
    } catch {
      // AudioContext cleanup
    }
  }

  private playManaAmbientChime() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start(now);
      osc.stop(now + 3.1);
    } catch {
      // Ignore
    }
  }

  // --- ACTION SOUND EFFECTS ---

  /**
   * Action: UI Button / Holographic Menu Click
   * A crisp, high-tech hunter status interface tap with subtle dual-layer frequency blip.
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Metallic click layer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(4, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: EXP Gain Surge
   * Rising cyan mana particles sound: rapid ascending melodic pentatonic glissando.
   */
  public playXpGain() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Sub thud
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(90, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.13);

      // Fast rising mana sparkle notes: C5 -> D5 -> G5 -> A5 -> C6
      const freqs = [523.25, 587.33, 783.99, 880.0, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.1, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.19);
      });
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: Quest Completion
   * Deep shadow bass + luminous crystal mana chime (Minor to Major resolution).
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Deep shadow bass pulse
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(110, now); // A2
      bass.frequency.exponentialRampToValueAtTime(55, now + 0.4);
      bassGain.gain.setValueAtTime(0.25, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      bass.connect(bassGain);
      bassGain.connect(this.masterGain);
      bass.start(now);
      bass.stop(now + 0.46);

      // Crystal chime chords (E5, B5, E6, G#6) - Radiant awakening
      const notes = [
        { f: 659.25, delay: 0.04, dur: 0.35, vol: 0.15 },
        { f: 987.77, delay: 0.1, dur: 0.4, vol: 0.16 },
        { f: 1318.51, delay: 0.18, dur: 0.55, vol: 0.18 },
        { f: 1661.22, delay: 0.26, dur: 0.7, vol: 0.2 },
      ];

      notes.forEach(({ f, delay, dur, vol }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + delay);

        gain.gain.setValueAtTime(vol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.02);
      });
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: Level Up!
   * Sovereign Monarch Fanfare: Deep sawtooth drone, brass chord swells, and high angelic crystal fanfare.
   */
  public playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Heavy Monarch Sub Drone (Sawtooth through lowpass filter)
      const drone = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      const droneFilter = this.ctx.createBiquadFilter();

      drone.type = 'sawtooth';
      drone.frequency.setValueAtTime(65.41, now); // C2
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(160, now);
      droneFilter.frequency.exponentialRampToValueAtTime(500, now + 0.6);

      droneGain.gain.setValueAtTime(0.3, now);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      drone.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain);
      drone.start(now);
      drone.stop(now + 1.25);

      // Heroic Monarch Chords
      const chords = [
        { freqs: [261.63, 329.63, 392.0], start: 0.05, dur: 0.22, vol: 0.18 }, // C Major
        { freqs: [293.66, 369.99, 440.0], start: 0.25, dur: 0.22, vol: 0.2 },  // D Major
        { freqs: [392.0, 493.88, 587.33], start: 0.45, dur: 0.28, vol: 0.22 }, // G Major
        { freqs: [523.25, 659.25, 783.99, 1046.5], start: 0.72, dur: 0.85, vol: 0.25 }, // C High Radiant
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + chord.start);

          const filter = this.ctx!.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(freq * 3, now + chord.start);

          gain.gain.setValueAtTime(chord.vol / chord.freqs.length, now + chord.start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.start + chord.dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now + chord.start);
          osc.stop(now + chord.start + chord.dur + 0.05);
        });
      });
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: Push-Up Record / Monarch Blade Slash
   * Resonant blade swoosh + thunderous ground impact.
   */
  public playPushUpRecord() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Heavy Ground Impact Sub Bass
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.52);

      // Steel blade ring
      const blade = this.ctx.createOscillator();
      const bladeGain = this.ctx.createGain();
      blade.type = 'triangle';
      blade.frequency.setValueAtTime(1760, now + 0.08); // A6
      blade.frequency.exponentialRampToValueAtTime(1318.5, now + 0.7);

      bladeGain.gain.setValueAtTime(0.2, now + 0.08);
      bladeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      blade.connect(bladeGain);
      bladeGain.connect(this.masterGain);
      blade.start(now + 0.08);
      blade.stop(now + 0.72);
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: Timer Bell / Sanctum Singing Bowl
   */
  public playTimerBell() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Harmonic singing bowl overtones: Fundamental (432Hz), 2nd (864Hz), 3rd (1296Hz)
      const harmonics = [432, 864, 1296];
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.2 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 2.3);
      });
    } catch {
      // AudioContext suppression
    }
  }

  /**
   * Action: Boss Milestone / Blade Clash
   */
  public playBossClash() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // AudioContext suppression
    }
  }
}

export const soundFx = new SoundManager();

export function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' = 'light',
  enabled = true
) {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate([35, 20, 35]);
        break;
      case 'success':
        navigator.vibrate([20, 30, 45]);
        break;
    }
  } catch {
    // Vibration ignored if blocked
  }
}
