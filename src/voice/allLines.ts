// Every sentence with changing parts that the game can say, for the voice-pack generator.
// Fixed sentences written as { en: '…', zh: '…' } anywhere in src/ are found automatically by
// scripts/make-voices.ts, so only the generated ones need listing here.
// Anything missed still works: the game falls back to the phone's own voice for it.
import type { Bi, Lang } from '../core/lang';
import type { Line } from '../core/speech';
import { GAMES } from '../data/games';
import { P, PRAISE, TRY_AGAIN, HELLO } from '../data/phrases';
import { makeQuestion, Q_TYPES } from '../data/scienceQuestions';
import { S } from '../data/sentences';
import { FEELINGS, FEELING_SCENES, STORIES, STORY_QUESTION } from '../data/stories';
import { BALLOON_COLORS, COUNTABLES, SEA_ANIMALS, WORDS } from '../data/words';
import { STAGES_PER_WORLD, WORLDS } from '../data/worlds';

export function allLines(): Line[] {
  const out: Line[] = [];
  const bi = (b: Bi) => out.push({ text: b.en, lang: 'en' }, { text: b.zh, lang: 'zh' });
  const both = (f: (lang: Lang) => Line[]) => out.push(...f('en'), ...f('zh'));

  // phrases
  [...PRAISE, ...TRY_AGAIN, ...HELLO, STORY_QUESTION].forEach(bi);
  Object.values(P).forEach((v) => typeof v === 'object' && bi(v as Bi));
  for (let n = 1; n <= 6; n++) [P.adventureStart(n), P.moreToGo(n), P.stars(n)].forEach(bi);
  Object.values(GAMES).forEach((g) => bi(P.pickStage(g.name)));

  // numbers (tap-to-count, and the first half of "12 fish!")
  for (let n = 0; n <= 60; n++) both((lang) => [{ text: String(n), lang }]);

  // Maths
  for (const it of COUNTABLES) {
    bi(S.countPrompt(it, true));
    bi(S.countPrompt(it, false));
    for (const n of [2, 3]) both((lang) => S.countConfirm(n, it, lang));
  }
  for (let big = 2; big <= 12; big++) for (let small = 1; small < big; small++) {
    bi(S.compareConfirm('more', big, small));
    bi(S.compareConfirm('fewer', big, small));
  }
  for (let a = 1; a <= 20; a++) for (let b = 1; a + b <= 20; b++) [S.addPrompt(a, b), S.addConfirm(a, b)].forEach(bi);
  for (let a = 2; a <= 20; a++) for (let b = 1; b < a; b++) [S.subPrompt(a, b), S.subConfirm(a, b)].forEach(bi);
  for (let start = 1; start <= 45; start++) bi(S.seqConfirm([0, 1, 2, 3, 4].map((i) => start + i)));
  for (const step of [2, 5, 10]) for (let k = 0; k <= 4; k++) bi(S.seqConfirm([0, 1, 2, 3, 4].map((i) => step * k + i * step)));

  // Words & Memory
  for (const w of WORDS) {
    bi(w);
    bi(S.findWord(w));
  }

  // Science: questions are built randomly, so build plenty of each kind and collect every sentence
  for (const t of Q_TYPES) for (let i = 0; i < 400; i++) {
    const q = makeQuestion(t, 4);
    bi(q.prompt);
    bi(q.explain);
    q.choices.forEach((c) => bi(c.label));
  }

  // Kindness
  for (const s of STORIES) [s.text, s.good, s.bad, s.goodOut, s.badOut].forEach(bi);
  for (const f of Object.values(FEELINGS)) [f, S.feelConfirm(f)].forEach(bi);
  FEELING_SCENES.forEach((f) => bi(f.text));

  // Focus
  for (const c of BALLOON_COLORS) [S.tapRule(c, true), S.tapHint(c, true), S.tapSwitch(c, true)].forEach(bi);
  for (const a of SEA_ANIMALS) [S.tapRule(a, false), S.tapHint(a, false), S.tapSwitch(a, false)].forEach(bi);

  // Spot It
  for (let k = 1; k <= 5; k++) bi(S.spotPrompt(k));

  // Map & stages
  WORLDS.forEach((w, i) => {
    for (let s = 1; s <= STAGES_PER_WORLD; s++) [S.mapExplore(w.name, s, STAGES_PER_WORLD), S.stageDone(w.icon, s, STAGES_PER_WORLD)].forEach(bi);
    [S.mapFinished(w.name), S.newWorld(w.icon, w.name)].forEach(bi);
    if (i > 0) bi(S.mapLocked(WORLDS[i - 1].name));
  });
  [S.mapAllDone, S.allWorldsDone].forEach(bi);

  // Parent Corner voice test
  out.push({ text: 'Hello! I am Pan Pan.', lang: 'en' }, { text: '你好！我是盼盼。', lang: 'zh' });
  return out;
}
