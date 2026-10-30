// ─── Sentences with changing parts (numbers, names) ──────────────────────
// The games and the voice-pack generator (scripts/make-voices.ts) both use these, so every
// sentence the game can say gets a recorded voice. Fixed sentences live in phrases.ts.
import { zhCount, type Bi, type Lang } from '../core/lang';
import type { Line } from '../core/speech';
import type { Countable } from './words';

type Named = { en: string; zh: string };

// Maths
export const S = {
  countPrompt: (it: Countable, hint: boolean): Bi => ({
    en: `How many ${it.en}?${hint ? ' Tap each one to count!' : ''}`,
    zh: `数一数，有几${it.mw}${it.zh}？${hint ? '一个一个点着数！' : ''}`,
  }),
  /** Said as two pieces ("12" + "fish!") so 50 numbers × 12 things don't each need a recording. */
  countConfirm: (n: number, it: Countable, lang: Lang): Line[] =>
    n === 2 // 两条鱼, not 二条鱼
      ? [{ text: lang === 'en' ? `2 ${it.en}!` : `两${it.mw}${it.zh}！`, lang }]
      : [{ text: String(n), lang }, { text: lang === 'en' ? `${it.en}!` : `${it.mw}${it.zh}！`, lang }],
  seqConfirm: (nums: number[]): Bi => ({ en: `${nums.join(', ')}!`, zh: `${nums.join(', ')}！` }),
  compareConfirm: (kind: 'more' | 'fewer', big: number, small: number): Bi =>
    kind === 'more'
      ? { en: `${big} is more than ${small}.`, zh: `${big}比${small}多。` }
      : { en: `${small} is fewer than ${big}.`, zh: `${small}比${big}少。` },
  addPrompt: (a: number, b: number): Bi => ({ en: `${a} plus ${b}. How many altogether?`, zh: `${a}加${b}，一共是多少？` }),
  addConfirm: (a: number, b: number): Bi => ({ en: `${a} plus ${b} is ${a + b}!`, zh: `${a}加${b}等于${a + b}！` }),
  subPrompt: (a: number, b: number): Bi => ({ en: `${a} take away ${b}. How many are left?`, zh: `${a}减${b}，还剩多少？` }),
  subConfirm: (a: number, b: number): Bi => ({ en: `${a} take away ${b} is ${a - b}!`, zh: `${a}减${b}等于${a - b}！` }),

  // Words
  findWord: (w: Named): Bi => ({ en: `Find the ${w.en}.`, zh: `找一找，${w.zh}在哪里？` }),

  // Kindness
  feelConfirm: (f: Named): Bi => ({ en: `They feel ${f.en}.`, zh: `感到${f.zh}。` }),

  // Spot It
  spotPrompt: (k: number): Bi => ({
    en: k === 1 ? 'Look carefully! Find 1 difference.' : `Look carefully! Find ${k} differences.`,
    zh: `仔细看！找出${zhCount(k)}个不同的地方。`,
  }),

  // Focus (balloon colours or sea animals)
  tapRule: (t: Named, balloon: boolean): Bi =>
    balloon ? { en: `Tap only the ${t.en} balloons!`, zh: `只点${t.zh}的气球！` } : { en: `Tap only the ${t.en}!`, zh: `只点${t.zh}！` },
  tapHint: (t: Named, balloon: boolean): Bi =>
    balloon ? { en: `Only the ${t.en} ones!`, zh: `只点${t.zh}的！` } : { en: `Only the ${t.en}!`, zh: `只点${t.zh}！` },
  tapSwitch: (t: Named, balloon: boolean): Bi =>
    balloon ? { en: `Now tap only the ${t.en} balloons!`, zh: `现在只点${t.zh}的气球！` } : { en: `Now tap only the ${t.en}!`, zh: `现在只点${t.zh}！` },

  // Map & stages
  mapExplore: (w: Named, stage: number, of: number): Bi => ({
    en: `Let's explore the ${w.en}! Stage ${stage} of ${of}.`,
    zh: `我们去${w.zh}探险吧！第${stage}关，一共${of}关。`,
  }),
  mapAllDone: { en: 'You finished every world! You can keep playing in Space.', zh: '你完成了所有的世界！可以继续在太空冒险。' } as Bi,
  mapFinished: (w: Named): Bi => ({ en: `You finished the ${w.en}! Great job!`, zh: `你完成了${w.zh}！真棒！` }),
  allWorldsDone: { en: '🎉 You finished every world!', zh: '🎉 你完成了所有的世界！' } as Bi,
  stageDone: (icon: string, stage: number, of: number): Bi => ({
    en: `${icon} Stage ${stage} of ${of} done!`,
    zh: `${icon} 完成第${stage}关，一共${of}关！`,
  }),
};
