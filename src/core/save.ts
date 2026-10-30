// Everything that should survive closing the app lives here, stored in the phone's localStorage.

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
    enabled: Partial<Record<GameId, boolean>>; // games allowed in Today's Adventure (missing = on)
  };
  stars: number;
  adventuresDone: number;
  levels: Record<GameId, number>; // difficulty 1..5 per game, adjusted automatically
  currentPath: { games: GameId[]; index: number } | null; // today's adventure in progress
  stickers: { owned: string[]; placed: PlacedSticker[] };
}

const KEY = 'panpan-save-v1';

function defaults(): SaveData {
  return {
    settings: { lang: 'mixed', restMinutes: 15, enabled: {} },
    stars: 0,
    adventuresDone: 0,
    levels: { count: 2, word: 2, science: 2, moral: 1, taponly: 1, memory: 1, pattern: 2, spot: 1 },
    currentPath: null,
    stickers: { owned: [], placed: [] },
  };
}

function load(): SaveData {
  const def = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<SaveData>;
      return {
        ...def,
        ...d,
        settings: { ...def.settings, ...d.settings },
        levels: { ...def.levels, ...d.levels },
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

export function isEnabled(id: GameId): boolean {
  return save.settings.enabled[id] !== false;
}

/** Focus training: the adventure starts with 3 games and grows by one every 3 finished adventures, up to 6. */
export function pathLength(): number {
  return Math.min(6, 3 + Math.floor(save.adventuresDone / 3));
}
