// 🧩 Patterns (logic)
// A row like 🔴🔵🔴🔵❓ — find what comes next (or, at level 4, what's missing in the middle).
import { BaseGame } from '../core/BaseGame';
import { line, type Bi } from '../core/lang';
import { pickOne, randInt, shuffle } from '../core/rand';
import { C, popIn, tapCard, txt, type TapCard } from '../core/ui';

const SETS = [
  ['🔴', '🔵', '🟡', '🟢', '🟣'],
  ['🍎', '🍌', '🍇', '🍓', '🍊'],
  ['🐱', '🐶', '🐰', '🐻', '🐸'],
  ['⭐', '❤️', '🔷', '🌙', '☀️'],
];

// A = first item, B = second… "AAB" means 🔴🔴🔵🔴🔴🔵
const LEVELS: Record<number, { templates: string[]; choices: number; middle: boolean }> = {
  1: { templates: ['AB'], choices: 2, middle: false },
  2: { templates: ['AB', 'AAB', 'ABB'], choices: 3, middle: false },
  3: { templates: ['ABC', 'AABB', 'ABB'], choices: 3, middle: false },
  4: { templates: ['AB', 'ABC', 'AAB'], choices: 3, middle: true },
  5: { templates: ['ABCD', 'AABC', 'ABBC'], choices: 4, middle: false },
  6: { templates: ['ABAC', 'ABCB', 'AABBC'], choices: 4, middle: true },
  7: { templates: ['ABBA', 'AABCC', 'ABCCB'], choices: 4, middle: false },
  8: { templates: ['ABCDE', 'AABBCC', 'ABACAD'], choices: 4, middle: true },
};

export class PatternScene extends BaseGame {
  readonly gameId = 'pattern' as const;

  constructor() {
    super('Pattern');
  }

  create(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff8e1).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const cfg = LEVELS[this.level];
    const tpl = pickOne(cfg.templates);
    const letters = [...new Set(tpl)];
    const set = pickOne(SETS);
    const syms = shuffle(set).slice(0, letters.length);
    const symOf = (ch: string) => syms[letters.indexOf(ch)];
    const reps = Math.ceil(7 / tpl.length);
    const seq = tpl.repeat(reps).split('').map(symOf);
    const missing = cfg.middle ? randInt(2, seq.length - 2) : seq.length - 1;
    const answer = seq[missing];

    const W = this.scale.width;
    const lang = this.lang;
    const prompt: Bi = cfg.middle ? { en: 'What is missing?', zh: '缺少的是什么？' } : { en: 'What comes next?', zh: '接下来是什么？' };
    this.layer!.add(txt(this, W / 2, 175, prompt[lang], 50));

    const cell = Math.min(190, (W - 200) / seq.length);
    let gapText!: ReturnType<typeof txt>;
    let gapCard!: TapCard;
    seq.forEach((s, i) => {
      const x = W / 2 + (i - (seq.length - 1) / 2) * cell;
      const isGap = i === missing;
      const c = tapCard(this, x, 440, cell - 16, cell + 20, null, { fill: isGap ? C.yellow : C.white, radius: 28 });
      const t = txt(this, 0, 0, isGap ? '❓' : s, Math.round(cell * 0.6));
      c.add(t);
      if (isGap) {
        gapText = t;
        gapCard = c;
      }
      this.layer!.add(c);
      popIn(this, c, i * 70);
    });
    this.tweens.add({ targets: gapCard, y: 425, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const others = shuffle([...syms.filter((s) => s !== answer), ...set.filter((s) => !syms.includes(s))]);
    const options = shuffle([answer, ...others.slice(0, cfg.choices - 1)]);
    const cards: TapCard[] = [];
    options.forEach((s, i) => {
      const x = W / 2 + (i - (options.length - 1) / 2) * 300;
      const c = tapCard(this, x, 820, 250, 250, () => {
        const ok = s === answer;
        if (ok && !this.busy) gapText.setText(answer);
        void this.handleAnswer(c, ok, cards[options.indexOf(answer)], [line({ en: 'You found the pattern!', zh: '你找到规律了！' }, lang)]);
      }, { radius: 40 });
      c.add(txt(this, 0, 0, s, 140));
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 500 + i * 100);
    });
    void this.setPrompt([line(prompt, lang)]);
  }
}
