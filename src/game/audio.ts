// Procedural WebAudio engine for SFX and looping chiptune music.
// No external audio assets — keeps bundle tiny and avoids autoplay-asset issues.

type Settings = { music: number; sfx: number; muted: boolean };

const KEY = "unipix_audio";

const DEFAULTS: Settings = { music: 0.5, sfx: 0.7, muted: false };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const p = JSON.parse(raw);
    return {
      music: clamp(typeof p.music === "number" ? p.music : DEFAULTS.music, 0, 1),
      sfx: clamp(typeof p.sfx === "number" ? p.sfx : DEFAULTS.sfx, 0, 1),
      muted: !!p.muted,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private musicPlaying = false;
  private settings: Settings = load();
  private listeners = new Set<(s: Settings) => void>();

  getSettings(): Settings { return { ...this.settings }; }

  subscribe(fn: (s: Settings) => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private emit() {
    const snap = this.getSettings();
    this.listeners.forEach((l) => l(snap));
  }

  private save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.settings)); } catch { }
  }

  setMusic(v: number) {
    this.settings.music = clamp(v, 0, 1);
    if (this.musicGain) this.musicGain.gain.value = this.effMusic();
    this.save(); this.emit();
  }

  setSfx(v: number) {
    this.settings.sfx = clamp(v, 0, 1);
    if (this.sfxGain) this.sfxGain.gain.value = this.effSfx();
    this.save(); this.emit();
  }

  setMuted(m: boolean) {
    this.settings.muted = m;
    if (this.musicGain) this.musicGain.gain.value = this.effMusic();
    if (this.sfxGain) this.sfxGain.gain.value = this.effSfx();
    this.save(); this.emit();
  }

  private effMusic() { return this.settings.muted ? 0 : this.settings.music * 0.35; }
  private effSfx() { return this.settings.muted ? 0 : this.settings.sfx * 0.6; }

  /** Must be called from a user gesture. Safe to call repeatedly. */
  async unlock() {
    if (!this.ctx) {
      const Ctx: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.effMusic();
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.effSfx();
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") {
      try { await this.ctx.resume(); } catch { }
    }
  }

  // ----- SFX -----
  private tone(freq: number, dur: number, type: OscillatorType, vol = 1, attack = 0.005, decay = 0.08) {
    if (!this.ctx || !this.sfxGain) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + decay);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + decay + 0.02);
  }

  private slide(f1: number, f2: number, dur: number, type: OscillatorType, vol = 1) {
    if (!this.ctx || !this.sfxGain) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.05);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.08);
  }

  private noise(dur: number, vol = 1, hp = 800) {
    if (!this.ctx || !this.sfxGain) return;
    const t0 = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = hp;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t0);
  }

  jump() { this.slide(520, 880, 0.18, "square", 0.3); }
  coin() {
    this.tone(988, 0.06, "square", 0.25);
    setTimeout(() => this.tone(1318, 0.1, "square", 0.22), 60);
  }
  power() {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.1, "triangle", 0.3), i * 70),
    );
  }
  hit() {
    this.slide(220, 60, 0.25, "sawtooth", 0.45);
    this.noise(0.18, 0.3, 200);
  }
  milestone() {
    [659, 784, 988, 1318].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.12, "square", 0.28), i * 80),
    );
  }
  gameover() {
    [523, 466, 415, 349, 277].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.18, "triangle", 0.32), i * 130),
    );
  }

  // ----- Looping chiptune music -----
  startMusic() {
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;
    this.musicStep = 0;
    // Synthwave-ish arpeggio in A minor + simple bass
    const lead = [440, 523, 659, 784, 880, 784, 659, 523,
      493, 587, 698, 880, 932, 880, 698, 587];
    const bass = [110, 110, 110, 110, 123, 123, 123, 123,
      146, 146, 146, 146, 130, 130, 130, 130];
    const stepMs = 180;
    const tick = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const t0 = this.ctx.currentTime;
      const i = this.musicStep % lead.length;
      // lead
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "square";
      o.frequency.value = lead[i];
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.1, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.connect(g).connect(this.musicGain);
      o.start(t0); o.stop(t0 + 0.22);
      // bass every 2 steps
      if (i % 2 === 0) {
        const b = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        b.type = "triangle";
        b.frequency.value = bass[i];
        bg.gain.setValueAtTime(0, t0);
        bg.gain.linearRampToValueAtTime(0.18, t0 + 0.01);
        bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
        b.connect(bg).connect(this.musicGain);
        b.start(t0); b.stop(t0 + 0.36);
      }
      this.musicStep++;
    };
    tick();
    this.musicTimer = window.setInterval(tick, stepMs);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer != null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new AudioEngine();
