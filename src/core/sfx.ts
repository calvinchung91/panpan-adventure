// Little sound effects synthesised with Web Audio, so there are no audio files to load.

let ctx: AudioContext | null = null;

/** Must be called from a tap: browsers only allow audio after the user touches the screen. */
export function unlockAudio(): void {
  ctx ??= new AudioContext();
  void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, delay = 0, slideTo?: number): void {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0.08, 'triangle', 0.12),
  pop: () => tone(500, 0.14, 'sine', 0.25, 0, 1100),
  correct: () => {
    tone(784, 0.14, 'triangle', 0.2);
    tone(1046, 0.22, 'triangle', 0.2, 0.1);
  },
  wrong: () => tone(320, 0.22, 'sine', 0.14, 0, 220),
  star: () => tone(1200, 0.16, 'sine', 0.16, 0, 1800),
  tada: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.18, i * 0.12)),
};
