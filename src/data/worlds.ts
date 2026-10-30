// ─── Adventure worlds (the stage map) ────────────────────────────────────
// Each finished Today's Adventure completes one stage. Finish all stages of a world to unlock
// the next one. bg = background style, decor = little pictures along the bottom of the path.
import type { Bi } from '../core/lang';
import { save } from '../core/save';
import type { BgKind } from '../core/ui';
import type { TrackId } from './music';

export interface World {
  icon: string;
  name: Bi;
  bg: BgKind;
  color: number;
  decor: string[];
  music: TrackId;
}

export const STAGES_PER_WORLD = 5;

export const WORLDS: World[] = [
  { icon: '🚜', name: { en: 'Farm', zh: '农场' }, bg: 'meadow', color: 0x7cc95a, decor: ['🐄', '🐷', '🌾', '🐔', '🏡'], music: 'farm' },
  { icon: '🌳', name: { en: 'Forest', zh: '森林' }, bg: 'forest', color: 0x3f9b5a, decor: ['🌲', '🍄', '🦊', '🦉', '🌲'], music: 'forest' },
  { icon: '🌊', name: { en: 'Sea', zh: '大海' }, bg: 'sea', color: 0x3a9ad9, decor: ['🐠', '🐙', '🐚', '🐳', '🦀'], music: 'sea' },
  { icon: '❄️', name: { en: 'Snowland', zh: '冰雪世界' }, bg: 'snow', color: 0x8fc8ee, decor: ['⛄', '🐧', '🏔️', '❄️', '🎿'], music: 'snow' },
  { icon: '🌵', name: { en: 'Desert', zh: '沙漠' }, bg: 'desert', color: 0xe8a94f, decor: ['🌵', '🐫', '🦎', '🌵', '🏜️'], music: 'desert' },
  { icon: '🚀', name: { en: 'Space', zh: '太空' }, bg: 'space', color: 0x4b3fa0, decor: ['🪐', '👽', '🛸', '🌙', '⭐'], music: 'space' },
];

/** Where he is on the map, worked out from how many adventures he has finished. */
export function worldProgress(done = save.adventuresDone): { world: number; stage: number; allDone: boolean } {
  const world = Math.floor(done / STAGES_PER_WORLD);
  if (world >= WORLDS.length) return { world: WORLDS.length - 1, stage: STAGES_PER_WORLD, allDone: true };
  return { world, stage: done % STAGES_PER_WORLD, allDone: false };
}
