// 🔢 Count & Compare (Maths)
// Counting objects (tap each one to count; this trains careful one-by-one attention),
// "which side has more / fewer", and simple adding and taking away with pictures.
import { BaseGame } from '../core/BaseGame';
import { line, zhCount, type Bi } from '../core/lang';
import { pickOne, randInt, shuffle } from '../core/rand';
import { sfx } from '../core/sfx';
import type { Line } from '../core/speech';
import { button, C, gridLayout, popIn, tapCard, txt, type TapCard } from '../core/ui';
import { COUNTABLES, type Countable } from '../data/words';

type TaskType = 'count' | 'more' | 'fewer' | 'add' | 'sub';

// What each difficulty level contains. Types listed twice come up more often.
const LEVELS: Record<number, { types: TaskType[]; min: number; max: number; addMax: number; subMax: number }> = {
  1: { types: ['count'], min: 3, max: 10, addMax: 5, subMax: 5 },
  2: { types: ['count', 'count', 'more'], min: 5, max: 15, addMax: 5, subMax: 5 },
  3: { types: ['count', 'more', 'fewer', 'add'], min: 8, max: 20, addMax: 5, subMax: 5 },
  4: { types: ['count', 'add', 'add', 'sub', 'more'], min: 10, max: 25, addMax: 10, subMax: 6 },
  5: { types: ['count', 'add', 'sub', 'sub', 'fewer'], min: 12, max: 30, addMax: 10, subMax: 10 },
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
    const cfg = LEVELS[this.level];
    const type = pickOne(cfg.types);
    const item = pickOne(COUNTABLES);
    if (type === 'count') this.countTask(item, cfg.min, cfg.max);
    else if (type === 'more' || type === 'fewer') this.compareTask(item, type, this.level);
    else if (type === 'add') this.addTask(item, cfg.addMax);
    else this.subTask(item, cfg.subMax);
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
    this.showPrompt(
      {
        en: `How many ${item.en}?${hint ? ' Tap each one to count!' : ''}`,
        zh: `数一数，有几${item.mw}${item.zh}？${hint ? '一个一个点着数！' : ''}`,
      },
      a.x + a.w / 2,
    );
    this.numberChoices(n, max, [line({ en: `${n} ${item.en}!`, zh: `${zhCount(n)}${item.mw}${item.zh}！` }, this.lang)]);
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
    const confirm: Line[] = [
      line(
        kind === 'more'
          ? { en: `${big} is more than ${small}.`, zh: `${big}比${small}多。` }
          : { en: `${small} is fewer than ${big}.`, zh: `${small}比${big}少。` },
        this.lang,
      ),
    ];
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
    this.showPrompt(
      { en: `${a} plus ${b}. How many altogether?`, zh: `${a}加${b}，一共有几${item.mw}？` },
      ar.x + ar.w / 2,
    );
    this.numberChoices(r, max, [line({ en: `${a} plus ${b} is ${r}!`, zh: `${a}加${b}等于${r}！` }, this.lang)]);
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
    this.showPrompt(
      { en: `${a} take away ${b}. How many are left?`, zh: `${a}减${b}，还剩几${item.mw}${item.zh}？` },
      ar.x + ar.w / 2,
    );
    this.numberChoices(r, max, [line({ en: `${a} take away ${b} is ${r}!`, zh: `${a}减${b}等于${r}！` }, this.lang)]);
  }

  private group(item: Countable, n: number, x: number, w: number): void {
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.8);
    panel.fillRoundedRect(x, 330, w, 620, 40);
    this.layer!.add(panel);
    const { pts, cell } = gridLayout(n, { x: x + 20, y: 350, w: w - 40, h: 580 }, 3, 150);
    pts.forEach((p) => this.layer!.add(txt(this, p.x, p.y, item.emoji, Math.round(cell * 0.72))));
  }

  /** Three big number buttons on the right: the answer plus two close numbers. */
  private numberChoices(answer: number, max: number, confirm: Line[]): void {
    const values = new Set([answer]);
    while (values.size < 3) {
      const v = answer + pickOne([-3, -2, -1, 1, 2, 3]);
      if (v >= 0 && v <= max + 3) values.add(v);
    }
    const W = this.scale.width;
    const fills = [C.blue, C.pink, C.purple];
    let correct!: TapCard;
    shuffle([...values]).forEach((v, i) => {
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
