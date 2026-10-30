// Stickers he can win: one new sticker for every finished Today's Adventure.
// Add or change emoji freely; already-won stickers stay won.
import { persist, save } from '../core/save';
import { pickOne } from '../core/rand';

export const STICKERS = [
  '🦁', '🐯', '🐵', '🐼', '🐨', '🦒', '🦓', '🐘', '🦄', '🐲',
  '🦖', '🦕', '🐳', '🐠', '🦜', '🦩', '🐝', '🐞', '🦋', '🐢',
  '🚀', '🚁', '🚒', '🚓', '🚜', '⛵', '🎈', '🎁', '🍦', '🍩',
  '🍉', '🌈', '⭐', '🌙', '☀️', '🌻', '🌴', '🏰', '👑', '💎',
];

/** Gives a random sticker he doesn't have yet. Returns null when he has them all. */
export function awardSticker(): string | null {
  const left = STICKERS.filter((s) => !save.stickers.owned.includes(s));
  if (left.length === 0) return null;
  const s = pickOne(left);
  save.stickers.owned.push(s);
  persist();
  return s;
}
