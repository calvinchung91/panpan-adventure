// 🔢 Count & Compare (Maths)
// Counting objects (tap each one to count; this trains careful one-by-one attention),
// "which side has more / fewer", and simple adding and taking away with pictures.
import { BaseGame } from '../core/BaseGame';
import { line, type Bi } from '../core/lang';
import { pickOne, randInt, shuffle } from '../core/rand';
import { sfx } from '../core/sfx';
import type { Line } from '../core/speech';
import { button, C, gridLayout, popIn, tapCard, txt, type TapCard } from '../core/ui';
import { S } from '../data/sentences';
import { COUNTABLES, type Countable } from '../data/words';

type TaskType = 'count' | 'more' | 'fewer' | 'add' | 'sub' | 'seq';

// What each difficulty level contains. Types listed twice come up more often.
// steps = how the "missing number" rows count (1 = 4,5,6… 2 = 2,4,6… 10 = 10,20,30…)
const LEVELS: Record<number, { types: TaskType[]; min: number; max: number; addMax: number; subMax: number; steps?: number[] }> = {
  1: { types: ['count'], min: 3, max: 10, addMax: 5, subMax: 5 },
  2: { types: ['count', 'count', 'more'], min: 5, max: 15, addMax: 5, subMax: 5 },
  3: { types: ['count', 'more', 'fewer', 'add'], min: 8, max: 20, addMax: 5, subMax: 5 },
  4: { types: ['count', 'add', 'add', 'sub', 'more'], min: 10, max: 25, addMax: 10, subMax: 6 },
  5: { types: ['count', 'add', 'sub', 'sub', 'fewer'], min: 12, max: 30, addMax: 10, subMax: 10 },
  6: { types: ['count', 'add', 'sub', 'seq', 'fewer'], min: 15, max: 40, addMax: 15, subMax: 10, steps: [1] },
  7: { types: ['count', 'add', 'sub', 'seq', 'seq'], min: 20, max: 50, addMax: 20, subMax: 15, steps: [1, 2] },
  8: { types: ['add', 'sub', 'sub', 'seq', 'count'], min: 25, max: 50, addMax: 20, subMax: 20, steps: [2, 5, 10] },
};

export class CountScene extends BaseGame {
  readonly gameId = 'count' as const;
  private countHintGiven = false;

  constructor() {
    super('Count');
  }

  create(): void {
    this.countHintGiven = false;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff6e0).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  /** Area for objects when number buttons sit on the right. */
  private area() {
    return { x: 110, y: 250, w: this.scale.width - 110 - 540, h: 780 };
  }

  protected buildTask(): void {
    // numbers grow a little with each stage, towards the next difficulty setting
    const cur = LEVELS[this.level], nxt = LEVELS[this.level + 1] ?? cur, t = this.stageStep;
    const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
    const cfg = { ...cur, min: mix(cur.min, nxt.min), max: mix(cur.max, nxt.max), addMax: mix(cur.addMax, nxt.addMax), subMax: mix(cur.subMax, nxt.subMax) };
    const type = pickOne(cfg.types);
    const item = pickOne(COUNTABLES);
    if (type === 'count') this.countTask(item, cfg.min, cfg.max);
    else if (type === 'more' || type === 'fewer') this.compareTask(item, type, this.level);
    else if (type === 'add') this.addTask(item, cfg.addMax);
    else if (type === 'seq') this.seqTask(pickOne(cfg.steps ?? [1]));
    else this.subTask(item, cfg.subMax);
  }

  /** A row of numbers with one missing, e.g. 12 13 ❓ 15 16, or counting by 2s, 5s, 10s. */
  private seqTask(step: number): void {
    const len = 5;
    const start = step === 1 ? randInt(1, 45) : step * randInt(0, 4);
    const nums = Array.from({ length: len }, (_, i) => start + i * step);
    const missing = randInt(1, len - 1);
    const answer = nums[missing];
    const a = this.area();
    nums.forEach((n, i) => {
      const x = a.x + a.w / 2 + (i - (len - 1) / 2) * 200;
      const gap = i === missing;
      const c = tapCard(this, x, 600, 170, 200, null, { fill: gap ? C.yellow : C.white, radius: 30 });
      c.add(txt(this, 0, 0, gap ? '❓' : String(n), 90));
      this.layer!.add(c);
      popIn(this, c, i * 80);
    });
    if (step > 1) this.layer!.add(txt(this, a.x + a.w / 2, 800, `+${step}  +${step}  +${step} …`, 50, '#a66bff'));
    this.showPrompt({ en: 'Which number is missing?', zh: '缺少哪个数字？' }, a.x + a.w / 2);
    // wrong choices: off by one (a common slip) or by a whole step, never a number already shown
    const wrongs = shuffle([answer - 1, answer + 1, answer + step * 2, answer - step * 2, answer + 2]).filter(
      (v, i, arr) => v >= 0 && v !== answer && !nums.includes(v) && arr.indexOf(v) === i,
    );
    this.choiceButtons([answer, ...wrongs.slice(0, 2)], answer, [line(S.seqConfirm(nums), this.lang)]);
  }

  private showPrompt(bi: Bi, x: number): void {
    this.layer!.add(txt(this, x, 175, bi[this.lang], 50));
    void this.setPrompt([line(bi, this.lang)]);
  }

  private countTask(item: Countable, min: number, max: number): void {
    const n = randInt(min, max);
    const a = this.area();
    const { pts, cell } = gridLayout(n, a, 10, n <= 10 ? 200 : 160);
    let tapped = 0;
    pts.forEach((p, i) => {
      const o = txt(this, p.x, p.y, item.emoji, Math.round(cell * 0.72));
      o.setInteractive({ useHandCursor: true });
      o.on('pointerdown', () => {
        if (o.getData('n') || this.busy) return;
        tapped++;
        o.setData('n', tapped);
        o.setAlpha(0.55);
        sfx.pop();
        const badge = this.add.container(p.x + cell * 0.3, p.y - cell * 0.3);
        badge.add(this.add.circle(0, 0, cell * 0.22, C.blue));
        badge.add(txt(this, 0, 0, String(tapped), Math.round(cell * 0.24), '#ffffff'));
        this.layer!.add(badge);
        popIn(this, badge);
        void this.say([{ text: String(tapped), lang: this.lang }]);
      });
      this.layer!.add(o);
      popIn(this, o, i * 25);
    });
    const hint = !this.countHintGiven;
    this.countHintGiven = true;
    this.showPrompt(S.countPrompt(item, hint), a.x + a.w / 2);
    this.numberChoices(n, max, S.countConfirm(n, item, this.lang));
  }

  private compareTask(item: Countable, kind: 'more' | 'fewer', level: number): void {
    const minDiff = level <= 2 ? 3 : level <= 3 ? 2 : 1;
    const top = level <= 2 ? 8 : 12;
    let a: number, b: number;
    do {
      a = randInt(1, top);
      b = randInt(1, top);
    } while (Math.abs(a - b) < minDiff);

    const W = this.scale.width;
    const pw = (W - 300) / 2;
    const answerLeft = kind === 'more' ? a > b : a < b;
    const panels: TapCard[] = [];
    [a, b].forEach((count, side) => {
      const x = 150 + pw / 2 + side * pw;
      const isRight = side === 0 ? answerLeft : !answerLeft;
      const panel = tapCard(this, x, 640, pw - 40, 720, () => void this.handleAnswer(panel, isRight, panels[answerLeft ? 0 : 1], confirm), {
        fill: 0xffffff,
        radius: 50,
      });
      const { pts, cell } = gridLayout(count, { x: -pw / 2 + 40, y: -320, w: pw - 120, h: 640 }, 4, 150);
      pts.forEach((p) => panel.add(txt(this, p.x, p.y, item.emoji, Math.round(cell * 0.72))));
      panels.push(panel);
      this.layer!.add(panel);
      popIn(this, panel, side * 120);
    });
    const big = Math.max(a, b), small = Math.min(a, b);
    const confirm: Line[] = [line(S.compareConfirm(kind, big, small), this.lang)];
    this.showPrompt(kind === 'more' ? { en: 'Which side has more?', zh: '哪边比较多？' } : { en: 'Which side has fewer?', zh: '哪边比较少？' }, W / 2);
  }

  private addTask(item: Countable, max: number): void {
    const a = randInt(1, max - 1);
    const b = randInt(1, max - a);
    const r = a + b;
    const ar = this.area();
    const gw = ar.w * 0.42;
    this.group(item, a, ar.x, gw);
    this.layer!.add(txt(this, ar.x + ar.w / 2, 640, '+', 120, '#ff6fa8'));
    this.group(item, b, ar.x + ar.w - gw, gw);
    this.showPrompt(S.addPrompt(a, b), ar.x + ar.w / 2);
    this.numberChoices(r, max, [line(S.addConfirm(a, b), this.lang)]);
  }

  private subTask(item: Countable, max: number): void {
    const a = randInt(3, max);
    const b = randInt(1, a - 1);
    const r = a - b;
    const ar = this.area();
    const { pts, cell } = gridLayout(a, { x: ar.x, y: ar.y, w: ar.w, h: ar.h }, 5, 150);
    pts.forEach((p, i) => {
      const o = txt(this, p.x, p.y, item.emoji, Math.round(cell * 0.72));
      this.layer!.add(o);
      if (i >= a - b) {
        // the "taken away" ones fade and get a red cross, one after another
        this.time.delayedCall(700 + (i - (a - b)) * 350, () => {
          if (!o.active) return;
          o.setAlpha(0.3);
          const x = txt(this, p.x, p.y, '✖', Math.round(cell * 0.7), '#ff3b3b');
          this.layer?.add(x);
          popIn(this, x);
          sfx.tap();
        });
      }
    });
    this.showPrompt(S.subPrompt(a, b), ar.x + ar.w / 2);
    this.numberChoices(r, max, [line(S.subConfirm(a, b), this.lang)]);
  }

  private group(item: Countable, n: number, x: number, w: number): void {
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.8);
    panel.fillRoundedRect(x, 330, w, 620, 40);
    this.layer!.add(panel);
    const { pts, cell } = gridLayout(n, { x: x + 20, y: 350, w: w - 40, h: 580 }, n > 9 ? 5 : 3, 150);
    pts.forEach((p) => this.layer!.add(txt(this, p.x, p.y, item.emoji, Math.round(cell * 0.72))));
  }

  /** Three big number buttons on the right: the answer plus two close numbers. */
  private numberChoices(answer: number, max: number, confirm: Line[]): void {
    const values = new Set([answer]);
    while (values.size < 3) {
      const v = answer + pickOne([-3, -2, -1, 1, 2, 3]);
      if (v >= 0 && v <= max + 3) values.add(v);
    }
    this.choiceButtons([...values], answer, confirm);
  }

  private choiceButtons(values: number[], answer: number, confirm: Line[]): void {
    const W = this.scale.width;
    const fills = [C.blue, C.pink, C.purple];
    let correct!: TapCard;
    shuffle(values).forEach((v, i) => {
      const b = button(this, W - 270, 360 + i * 245, 340, 200, String(v), () => void this.handleAnswer(b, v === answer, correct, confirm), {
        fill: fills[i],
        size: 110,
      });
      if (v === answer) correct = b;
      this.layer!.add(b);
      popIn(this, b, 200 + i * 100);
    });
  }
}
