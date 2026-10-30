// Background music: plays the tunes from data/music.ts with small synthesised instruments.
// Notes are scheduled a fraction of a second ahead (smooth even if the game is busy),
// tunes cross-fade when the screen changes, and the music gets quieter while Pan Pan talks.
import { TRACKS, type Instrument, type TrackId } from '../data/music';
import { save } from './save';
import { audioContext } from './sfx';

type Note = { freqs: number[]; beats: number }; // empty freqs = rest

const SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function freqOf(name: string): number {
  const m = name.match(/^([A-G])([#b]?)(\d)$/);
  if (!m) throw new Error(`Bad note "${name}"`);
  const midi = 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function parse(notes: string): Note[] {
  return notes
    .replace(/\|/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const [n, b] = tok.split(':');
      return { freqs: n === 'r' ? [] : n.split('+').map(freqOf), beats: b ? Number(b) : 1 };
    });
}

/** Volume for each Parent Corner setting: 0 off, 1 low, 2 medium, 3 high. */
const LEVEL_GAIN = [0, 0.09, 0.18, 0.3];

class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null; // volume setting
  private duck: GainNode | null = null; // quieter while speaking / resting
  private wanted: TrackId | null = null;
  private playing: TrackId | null = null;
  private trackGain: GainNode | null = null;
  private layers: { inst: Instrument; vol: number; notes: Note[]; i: number; next: number }[] = [];
  private spb = 0.5; // seconds per beat
  private timer: number | null = null;
  private speaking = false;
  private resting = false;

  constructor() {
    // stop the music when the app is in the background (phone locked, other app opened)
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  /** Call after the first tap (once audio is unlocked); starts whatever tune is wanted. */
  start(): void {
    const ctx = audioContext();
    if (!ctx || this.ctx) return;
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor(); // keeps chords from getting harsh
    this.duck = ctx.createGain();
    this.master = ctx.createGain();
    this.master.gain.value = LEVEL_GAIN[save.settings.music] ?? LEVEL_GAIN[2];
    this.duck.connect(this.master).connect(comp).connect(ctx.destination);
    this.timer = window.setInterval(() => this.tick(), 100);
    if (this.wanted) this.switchTo(this.wanted);
  }

  /** Plays a tune (no change if it is already playing). */
  play(id: TrackId): void {
    this.wanted = id;
    if (this.ctx && this.playing !== id) this.switchTo(id);
  }

  /** Re-reads the volume setting from Parent Corner. */
  applyVolume(): void {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(LEVEL_GAIN[save.settings.music] ?? 0, this.ctx.currentTime, 0.1);
  }

  /** Quieter while Pan Pan is talking, so instructions are always clear. */
  setSpeaking(on: boolean): void {
    this.speaking = on;
    this.updateDuck();
  }

  /** Almost silent during the rest reminder. */
  setResting(on: boolean): void {
    this.resting = on;
    this.updateDuck();
  }

  private updateDuck(): void {
    if (!this.ctx || !this.duck) return;
    const target = this.resting ? 0.05 : this.speaking ? 0.3 : 1;
    this.duck.gain.setTargetAtTime(target, this.ctx.currentTime, this.speaking || this.resting ? 0.08 : 0.4);
  }

  private switchTo(id: TrackId): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    // fade the old tune out, the new one in
    if (this.trackGain) {
      const old = this.trackGain;
      old.gain.setTargetAtTime(0, now, 0.3);
      setTimeout(() => old.disconnect(), 2500);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.setTargetAtTime(1, now + 0.2, 0.4);
    g.connect(this.duck!);
    this.trackGain = g;
    this.playing = id;
    const t = TRACKS[id];
    this.spb = 60 / t.bpm;
    this.layers = t.layers.map((l) => ({ inst: l.inst, vol: l.vol, notes: parse(l.notes), i: 0, next: now + 0.25 }));
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || !this.trackGain || ctx.state !== 'running') return;
    if (!save.settings.music) {
      // music off: schedule nothing, but keep the tune's place so turning it on doesn't burst
      for (const l of this.layers) l.next = Math.max(l.next, ctx.currentTime + 0.1);
      return;
    }
    const until = ctx.currentTime + 0.4;
    for (const l of this.layers) {
      while (l.next < until) {
        const n = l.notes[l.i];
        const dur = n.beats * this.spb;
        for (const f of n.freqs) this.note(l.inst, f, l.next, dur, l.vol / Math.sqrt(n.freqs.length), this.trackGain);
        l.next += dur;
        l.i = (l.i + 1) % l.notes.length;
      }
    }
  }

  /** One note on one instrument. */
  private note(inst: Instrument, f: number, t: number, dur: number, vol: number, out: AudioNode): void {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.connect(out);
    const osc = (type: OscillatorType, freq: number, gain = 1) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      if (gain === 1) o.connect(env);
      else {
        const g = ctx.createGain();
        g.gain.value = gain;
        o.connect(g).connect(env);
      }
      return o;
    };
    // plucked sound: quick attack, then fades away by itself
    const strike = (decay: number) => {
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      return t + decay + 0.05;
    };
    let oscs: OscillatorNode[];
    let end: number;
    switch (inst) {
      case 'marimba':
        oscs = [osc('sine', f), osc('sine', f * 4, 0.12)];
        end = strike(0.5);
        break;
      case 'musicbox':
        oscs = [osc('sine', f), osc('sine', f * 2, 0.25), osc('sine', f * 3, 0.08)];
        end = strike(1.4);
        break;
      case 'bells':
        oscs = [osc('sine', f), osc('sine', f * 2.76, 0.2), osc('sine', f * 5.4, 0.07)];
        end = strike(2);
        break;
      case 'bass':
        oscs = [osc('sine', f), osc('triangle', f * 2, 0.15)];
        end = strike(Math.min(0.6, dur));
        break;
      case 'pluck': {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2500, t);
        lp.frequency.exponentialRampToValueAtTime(500, t + 0.3);
        o.connect(lp).connect(env);
        oscs = [o];
        end = strike(0.45);
        break;
      }
      case 'flute': {
        // breathy: soft attack, held for the note, gentle vibrato
        const o = osc('triangle', f);
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.value = 5;
        depth.gain.value = f * 0.006;
        lfo.connect(depth).connect(o.frequency);
        oscs = [o, lfo];
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vol, t + 0.08);
        env.gain.setValueAtTime(vol, t + Math.max(0.1, dur * 0.85));
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
        end = t + dur + 0.2;
        break;
      }
      case 'pad': {
        // two slightly detuned voices through a soft filter, slow fade in and out
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        lp.connect(env);
        oscs = [-4, 4].map((cents) => {
          const o = ctx.createOscillator();
          o.type = 'triangle';
          o.frequency.value = f;
          o.detune.value = cents;
          o.connect(lp);
          return o;
        });
        const peak = vol * 0.6;
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.8, dur * 0.4));
        env.gain.setValueAtTime(peak, t + dur * 0.8);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1);
        end = t + dur + 1.05;
        break;
      }
    }
    for (const o of oscs) {
      o.start(t);
      o.stop(end);
    }
    oscs[0].onended = () => env.disconnect();
  }
}

export const music = new Music();
