import { save } from './save';
import type { Line } from './speech';

export type Lang = 'en' | 'zh';

/** A bilingual piece of text. py = pinyin, shown above the Chinese. */
export interface Bi {
  en: string;
  zh: string;
  py?: string;
}

/** Language for task number i. In mixed mode tasks alternate English / Chinese. */
export function taskLang(i: number): Lang {
  const m = save.settings.lang;
  return m === 'mixed' ? (i % 2 === 0 ? 'en' : 'zh') : m;
}

export function line(bi: Bi, lang: Lang): Line {
  return { text: bi[lang], lang };
}

/** Speech for the current language setting (mixed = English then Chinese). */
export function modeLines(bi: Bi): Line[] {
  const m = save.settings.lang;
  return m === 'mixed' ? [line(bi, 'en'), line(bi, 'zh')] : [line(bi, m)];
}

/** On-screen text for the current language setting (mixed = two lines). */
export function modeText(bi: Bi): string {
  const m = save.settings.lang;
  return m === 'mixed' ? `${bi.en}\n${bi.zh}` : bi[m];
}

/** "2" before a Chinese measure word is read 两 (两个), not 二. */
export function zhCount(n: number): string {
  return n === 2 ? '两' : String(n);
}
