// Automatic difficulty: each game has a level 1..8 that follows how your child is doing.
import { save, persist, type GameId } from './save';

export const MAX_LEVEL = 8;

export interface Streak {
  right: number;
  wrong: number;
}

/** For task games: 3 first-try successes in a row = level up, 2 misses in a row = level down. */
export function adapt(id: GameId, firstTry: boolean, s: Streak): void {
  const lv = save.levels[id];
  if (firstTry) {
    s.right++;
    s.wrong = 0;
    if (s.right >= 3 && lv < MAX_LEVEL) {
      save.levels[id] = lv + 1;
      s.right = 0;
    }
  } else {
    s.wrong++;
    s.right = 0;
    if (s.wrong >= 2 && lv > 1) {
      save.levels[id] = lv - 1;
      s.wrong = 0;
    }
  }
  persist();
}

/** For whole-round games: 3 stars = level up, 1 star = level down. */
export function adaptByStars(id: GameId, stars: number): void {
  const lv = save.levels[id];
  if (stars === 3 && lv < MAX_LEVEL) save.levels[id] = lv + 1;
  if (stars === 1 && lv > 1) save.levels[id] = lv - 1;
  persist();
}
