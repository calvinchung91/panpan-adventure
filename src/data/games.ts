// The list of games. New games get added here so the home screen and adventure path can use them.
import type { Bi } from '../core/lang';
import type { GameId } from '../core/save';

export interface GameInfo {
  scene: string; // Phaser scene key
  icon: string;
  name: Bi;
}

export const GAMES: Record<GameId, GameInfo> = {
  count: { scene: 'Count', icon: '🔢', name: { en: 'Maths', zh: '数学' } },
  word: { scene: 'Word', icon: '🔤', name: { en: 'Words', zh: '识字' } },
  taponly: { scene: 'TapOnly', icon: '🎈', name: { en: 'Focus', zh: '专注' } },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];
