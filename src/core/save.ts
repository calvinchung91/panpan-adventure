// Everything that should survive closing the app lives here, stored in the phone's localStorage.
import { STAGES, stageForLevel } from './stageMath';

export type LangMode = 'en' | 'zh' | 'mixed';
export type GameId = 'count' | 'word' | 'science' | 'moral' | 'taponly' | 'memory' | 'pattern' | 'spot';

export interface PlacedSticker {
  s: string;
  x: number;
  y: number;
}

export interface SaveData {
  settings: {
    lang: LangMode;
    restMinutes: number; // 0 = no rest reminder
    music: number; // background music: 0 off, 1 low, 2 medium, 3 high
    enabled: Partial<Record<GameId, boolean>>; // games allowed in Today's Adventure (missing = on)
  };
  stars: number;
  adventuresDone: number;
  stages: Record<GameId, StageProgress>; // 30 stages per game
  currentPath: { games: GameId[]; index: number } | null; // today's adventure in progress
  stickers: { owned: string[]; placed: PlacedSticker[] };
}

export interface StageProgress {
  unlocked: number; // highest stage he can play (1..30)
  stars: number[]; // best stars per stage; stars[0] is stage 1
}

const KEY = 'panpan-save-v1';
const GAME_IDS: GameId[] = ['count', 'word', 'science', 'moral', 'taponly', 'memory', 'pattern', 'spot'];

function defaults(): SaveData {
  return {
    settings: { lang: 'mixed', restMinutes: 15, music: 2, enabled: {} },
    stars: 0,
    adventuresDone: 0,
    stages: Object.fromEntries(GAME_IDS.map((id) => [id, { unlocked: 1, stars: [] }])) as unknown as Record<GameId, StageProgress>,
    currentPath: null,
    stickers: { owned: [], placed: [] },
  };
}

function load(): SaveData {
  const def = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // older saves had "levels" (1..8) instead of stages: start him at the matching stage
      const d = JSON.parse(raw) as Partial<SaveData> & { levels?: Partial<Record<GameId, number>> };
      const stages = { ...def.stages };
      for (const id of GAME_IDS) {
        if (d.stages?.[id]) stages[id] = d.stages[id];
        else if (d.levels?.[id]) stages[id] = { unlocked: stageForLevel(d.levels[id]!), stars: [] };
      }
      const { levels: _old, ...rest } = d;
      return {
        ...def,
        ...rest,
        settings: { ...def.settings, ...d.settings },
        stages,
        stickers: { ...def.stickers, ...d.stickers },
      };
    }
  } catch {
    // storage blocked or corrupted: start fresh
  }
  return def;
}

export const save: SaveData = load();

export function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // ignore: progress just won't be kept
  }
}

export function addStars(n: number): void {
  save.stars += n;
  persist();
}

export function resetProgress(): void {
  const settings = save.settings;
  Object.assign(save, defaults(), { settings });
  persist();
}

/** The stage he plays next in a game (his highest unlocked stage). */
export function nextStage(id: GameId): number {
  return save.stages[id].unlocked;
}

/** Saves the best stars for a stage and unlocks the next one. Returns true if a new stage was unlocked. */
export function recordStage(id: GameId, stage: number, stars: number): boolean {
  const p = save.stages[id];
  p.stars[stage - 1] = Math.max(p.stars[stage - 1] ?? 0, stars);
  const unlockedNew = stage === p.unlocked && p.unlocked < STAGES;
  if (unlockedNew) p.unlocked++;
  persist();
  return unlockedNew;
}

export function isEnabled(id: GameId): boolean {
  return save.settings.enabled[id] !== false;
}

/** Focus training: the adventure starts with 3 games and grows by one every 3 finished adventures, up to 6. */
export function pathLength(): number {
  return Math.min(6, 3 + Math.floor(save.adventuresDone / 3));
}
