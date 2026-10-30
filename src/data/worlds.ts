// ─── Adventure worlds (the stage map) ────────────────────────────────────
// Every world is open: he picks a world on the map, and each finished adventure there completes
// one of its 5 stages. bg = background style, decor = little pictures along the bottom of the path.
import type { Bi } from '../core/lang';
import { persist, save } from '../core/save';
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

/** Stages finished in each world. Older saves only counted adventures, so they are filled in world by world. */
export function worldStages(): number[] {
  if (!save.worldStages || save.worldStages.length !== WORLDS.length) {
    const old = save.worldStages ?? [];
    save.worldStages = WORLDS.map(
      (_, i) => old[i] ?? Math.max(0, Math.min(STAGES_PER_WORLD, save.adventuresDone - i * STAGES_PER_WORLD)),
    );
  }
  return save.worldStages;
}

/** The world the map suggests next (shown glowing): the first one not finished yet. */
export function suggestedWorld(): number {
  const i = worldStages().findIndex((n) => n < STAGES_PER_WORLD);
  return i === -1 ? WORLDS.length - 1 : i;
}

export function allWorldsDone(): boolean {
  return worldStages().every((n) => n >= STAGES_PER_WORLD);
}

/** Counts a finished adventure in a world. Says whether that finished the world, or every world. */
export function completeWorldStage(world: number): { stage: number; finishedWorld: boolean; finishedAll: boolean } {
  const ws = worldStages();
  const wasAll = allWorldsDone();
  const before = ws[world];
  ws[world] = Math.min(STAGES_PER_WORLD, before + 1);
  persist();
  return {
    stage: ws[world],
    finishedWorld: before < STAGES_PER_WORLD && ws[world] === STAGES_PER_WORLD,
    finishedAll: !wasAll && allWorldsDone(),
  };
}
