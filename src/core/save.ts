// Everything that should survive closing the app lives here, stored in the phone's localStorage.

export type LangMode = 'en' | 'zh' | 'mixed';
export type GameId = 'count' | 'word' | 'taponly';

export interface SaveData {
  settings: {
    lang: LangMode;
    restMinutes: number; // 0 = no rest reminder
  };
  stars: number;
  adventuresDone: number;
  levels: Record<GameId, number>; // difficulty 1..5 per game, adjusted automatically
  currentPath: { games: GameId[]; index: number } | null; // today's adventure in progress
}

const KEY = 'panpan-save-v1';

function defaults(): SaveData {
  return {
    settings: { lang: 'mixed', restMinutes: 15 },
    stars: 0,
    adventuresDone: 0,
    levels: { count: 2, word: 2, taponly: 1 },
    currentPath: null,
  };
}

function load(): SaveData {
  const def = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<SaveData>;
      return { ...def, ...d, settings: { ...def.settings, ...d.settings }, levels: { ...def.levels, ...d.levels } };
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

/** Focus training: the adventure starts with 3 games and grows by one every 3 finished adventures, up to 6. */
export function pathLength(): number {
  return Math.min(6, 3 + Math.floor(save.adventuresDone / 3));
}
