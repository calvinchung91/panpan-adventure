// Turns a sentence into the name of its recorded audio file, e.g. "zh-1a2b3c4d5".
// The game and the voice generator must compute exactly the same name, so both use this file.

/** Text as it is spoken: emoji removed (never read aloud), spaces tidied. */
export function cleanSpeech(text: string): string {
  return text.replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s+/g, ' ').trim();
}

export function voiceKey(text: string, lang: 'en' | 'zh'): string {
  const t = cleanSpeech(text);
  let h = 0x811c9dc5; // FNV-1a hash
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${lang}-${h.toString(16).padStart(8, '0')}${t.length.toString(36)}`;
}
