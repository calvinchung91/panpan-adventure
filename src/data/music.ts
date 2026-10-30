// ─── Background music ────────────────────────────────────────────────────
// Every tune is written here as notes and played by little synthesised instruments (core/music.ts),
// so there are no music files. Each layer loops on its own.
//
// Notes: "C5:1" = C in octave 5 for 1 beat; "r:2" = rest for 2 beats; "C4+E4+G4:4" = a chord.
// Sharps/flats: "F#4", "Bb3". Bars are separated with "|" just for reading.
// Instruments: marimba, musicbox, bells, flute, pluck, pad, bass.

export type Instrument = 'marimba' | 'musicbox' | 'bells' | 'flute' | 'pluck' | 'pad' | 'bass';

export interface Track {
  bpm: number;
  layers: { inst: Instrument; vol: number; notes: string }[];
}

export type TrackId = 'playful' | 'gentle' | 'calm' | 'farm' | 'forest' | 'sea' | 'snow' | 'desert' | 'space';

export const TRACKS: Record<TrackId, Track> = {
  // Menus and maps: bouncy marimba
  playful: {
    bpm: 112,
    layers: [
      {
        inst: 'marimba',
        vol: 0.5,
        notes: `C5:.5 E5:.5 G5:.5 E5:.5 A5:1 G5:1 | F5:.5 A5:.5 G5:.5 F5:.5 E5:1 C5:1 |
                D5:.5 E5:.5 F5:.5 D5:.5 G5:1 E5:1 | C5:.5 D5:.5 E5:.5 D5:.5 C5:2 |
                E5:.5 G5:.5 C6:.5 G5:.5 A5:1 G5:1 | F5:.5 E5:.5 D5:.5 E5:.5 F5:1 A5:1 |
                G5:.5 F5:.5 E5:.5 D5:.5 C5:1 E5:1 | D5:.5 G4:.5 B4:.5 D5:.5 C5:2`,
      },
      {
        inst: 'bass',
        vol: 0.45,
        notes: `C3 G3 C3 G3 | F3 C4 F3 C4 | G3 D4 G3 D4 | C3 G3 C3:2 |
                C3 G3 C3 G3 | F3 C4 F3 C4 | C3 G3 E3 G3 | G3 D4 C3:2`,
      },
    ],
  },

  // Thinking games: soft music box, slow and sparse
  gentle: {
    bpm: 76,
    layers: [
      {
        inst: 'musicbox',
        vol: 0.4,
        notes: `E6 G6 C6:2 | D6 E6 G5:2 | A5 C6 D6 E6 | D6:3 r |
                E6 D6 C6:2 | A5 G5 A5:2 | C6 D6 E6 G6 | C6:3 r`,
      },
      {
        inst: 'pad',
        vol: 0.22,
        notes: `C4+E4+G4:4 | G3+B3+D4:4 | A3+C4+E4:4 | G3+B3+D4:4 |
                C4+E4+G4:4 | F3+A3+C4:4 | C4+E4+G4:4 | C4+E4+G4:4`,
      },
    ],
  },

  // Focus balloons and Kindness stories: warm pads, no real tune, a rare soft bell
  calm: {
    bpm: 60,
    layers: [
      { inst: 'pad', vol: 0.3, notes: `C4+G4+E5:4 | A3+E4+C5:4 | F3+C4+A4:4 | G3+D4+B4:4` },
      { inst: 'bells', vol: 0.12, notes: `r:2 G5:2 | r:3 E5 | r:2 A5:2 | r:4` },
    ],
  },

  // ── Adventure worlds ──
  farm: {
    bpm: 104,
    layers: [
      {
        inst: 'pluck',
        vol: 0.45,
        notes: `G4:.5 B4:.5 D5 B4:.5 D5:.5 G5 | E5:.5 D5:.5 B4 A4:2 |
                C5:.5 B4:.5 A4 B4:.5 A4:.5 G4 | A4 B4 G4:2`,
      },
      { inst: 'bass', vol: 0.45, notes: `G2 D3 G2 D3 | E3 B2 D3 A2 | C3 G2 G2 D3 | D3:2 G2:2` },
    ],
  },
  forest: {
    bpm: 84,
    layers: [
      {
        inst: 'flute',
        vol: 0.35,
        notes: `A4 C5 D5 E5 | G5:2 E5:2 | D5 E5 C5 A4 | G4:2 A4:2 |
                C5 D5 E5:2 | G5 E5 D5:2 | C5 A4 G4 C5 | A4:4`,
      },
      { inst: 'pad', vol: 0.2, notes: `A3+C4+E4:8 | G3+B3+D4:8 | F3+A3+C4:8 | E3+G3+B3:4 A3+C4+E4:4` },
    ],
  },
  sea: {
    bpm: 70,
    layers: [
      { inst: 'musicbox', vol: 0.35, notes: `D5 F#5 A5 F#5 | B5 A5 F#5:2 | E5 F#5 A5 E5 | D5:4` },
      { inst: 'pad', vol: 0.25, notes: `D4+F#4+A4:4 | G3+B3+D4:4 | A3+C#4+E4:4 | D4+F#4+A4:4` },
    ],
  },
  snow: {
    bpm: 90,
    layers: [
      {
        inst: 'bells',
        vol: 0.3,
        notes: `E6:.5 G6:.5 E6:.5 C6:.5 D6 G5 | E6:.5 G6:.5 A6:.5 G6:.5 E6:2 |
                F6:.5 E6:.5 D6:.5 C6:.5 D6 B5 | C6:2 r:2`,
      },
      { inst: 'pad', vol: 0.2, notes: `C4+E4+G4:4 | A3+C4+E4:4 | F3+A3+C4:2 G3+B3+D4:2 | C4+E4+G4:4` },
    ],
  },
  desert: {
    bpm: 96,
    layers: [
      {
        inst: 'pluck',
        vol: 0.45,
        notes: `D5:.5 F5:.5 G5 A5 G5 | F5:.5 G5:.5 F5:.5 D5:.5 C5:2 |
                D5:.5 F5:.5 G5 C6 A5 | G5:.5 F5:.5 D5 D5:2`,
      },
      { inst: 'bass', vol: 0.45, notes: `D3 r A2 r | D3 r A2 r | C3 r G2 r | D3 A2 D3:2` },
    ],
  },
  space: {
    bpm: 64,
    layers: [
      { inst: 'pad', vol: 0.3, notes: `C4+G4+D5:4 | Bb3+F4+C5:4 | Ab3+Eb4+C5:4 | Bb3+F4+D5:4` },
      { inst: 'musicbox', vol: 0.25, notes: `G5:2 D6:2 | F5:2 C6:2 | Eb5:2 C6:2 | D6:4` },
    ],
  },
};
