// 🔍 Spot the Difference (focus & careful looking)
// Two picture grids that look the same, except for a few cells. Tap the differences.
import Phaser from 'phaser';
import { BaseGame } from '../core/BaseGame';
import { line, zhCount } from '../core/lang';
import { pickOne, shuffle } from '../core/rand';
import { sfx } from '../core/sfx';
import { confetti, pulse, txt, wiggle } from '../core/ui';

const THEMES = [
  ['🐱', '🐶', '🐰', '🐻', '🐼', '🐸', '🐷', '🐵', '🦁', '🐯', '🐮', '🐔'],
  ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🍐', '🥕', '🌽', '🥦', '🍋'],
  ['🚗', '🚌', '🚂', '✈️', '🚲', '🚀', '🚁', '⛵', '🚒', '🚓', '🚜', '🛵'],
  ['⭐', '🌙', '☀️', '🌈', '☁️', '🌸', '🌻', '🍀', '🌳', '🍄', '❄️', '🔥'],
];

// subtle = one difference is the same picture but smaller, which needs really careful looking
const LEVELS: Record<number, { cols: number; rows: number; diffs: number; subtle?: boolean }> = {
  1: { cols: 3, rows: 2, diffs: 1 },
  2: { cols: 3, rows: 3, diffs: 1 },
  3: { cols: 3, rows: 3, diffs: 2 },
  4: { cols: 4, rows: 3, diffs: 2 },
  5: { cols: 4, rows: 4, diffs: 3 },
  6: { cols: 5, rows: 4, diffs: 3 },
  7: { cols: 5, rows: 4, diffs: 4, subtle: true },
  8: { cols: 5, rows: 5, diffs: 5, subtle: true },
};
const SMALL = 0.6;

export class SpotScene extends BaseGame {
  readonly gameId = 'spot' as const;

  constructor() {
    super('Spot');
  }

  create(): void {
    this.tasksTotal = 3;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe9f4ff).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const cfg = LEVELS[this.level];
    const theme = pickOne(THEMES);
    const n = cfg.cols * cfg.rows;
    const left = Array.from({ length: n }, () => pickOne(theme));
    const diffs = new Set(shuffle([...Array(n).keys()]).slice(0, cfg.diffs));
    const small = new Set(cfg.subtle ? [...diffs].slice(0, 1) : []);
    const right = left.map((e, i) => (diffs.has(i) && !small.has(i) ? pickOne(theme.filter((t) => t !== e)) : e));

    const W = this.scale.width;
    const lang = this.lang;
    const k = cfg.diffs;
    const prompt = {
      en: k === 1 ? 'Look carefully! Find 1 difference.' : `Look carefully! Find ${k} differences.`,
      zh: `仔细看！找出${zhCount(k)}个不同的地方。`,
    };
    this.layer!.add(txt(this, W / 2, 175, prompt[lang], 48));

    const pw = (W - 260) / 2;
    const ph = 780;
    const cell = Math.min(pw / cfg.cols, ph / cfg.rows, 210) * 0.95;
    const marks = this.add.graphics();
    const found = new Set<number>();
    let mistakes = 0;
    let hinted = false;
    const cellsRight: Phaser.GameObjects.Text[] = [];

    [left, right].forEach((grid, side) => {
      const cx = side === 0 ? 100 + pw / 2 : W - 100 - pw / 2;
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 1);
      bg.fillRoundedRect(cx - pw / 2, 640 - ph / 2 - 20, pw, ph + 40, 40);
      this.layer!.add(bg);
      grid.forEach((e, i) => {
        const x = cx + ((i % cfg.cols) - (cfg.cols - 1) / 2) * cell;
        const y = 640 + (Math.floor(i / cfg.cols) - (cfg.rows - 1) / 2) * cell;
        const t = txt(this, x, y, e, Math.round(cell * 0.68));
        t.setInteractive({ useHandCursor: true });
        t.on('pointerdown', () => tap(i, t));
        this.layer!.add(t);
        if (side === 1) {
          cellsRight.push(t);
          if (small.has(i)) t.setScale(SMALL);
        }
      });
    });
    this.layer!.add(marks); // added last so the red circles draw on top of the panels

    const circle = (i: number) => {
      for (const side of [0, 1]) {
        const cx = side === 0 ? 100 + pw / 2 : W - 100 - pw / 2;
        const x = cx + ((i % cfg.cols) - (cfg.cols - 1) / 2) * cell;
        const y = 640 + (Math.floor(i / cfg.cols) - (cfg.rows - 1) / 2) * cell;
        marks.lineStyle(10, 0xff4d6d, 1);
        marks.strokeCircle(x, y, cell * 0.46);
      }
    };

    const tap = (i: number, t: Phaser.GameObjects.Text) => {
      if (this.busy || found.has(i)) return;
      if (diffs.has(i)) {
        found.add(i);
        circle(i);
        sfx.correct();
        confetti(this, t.x, t.y, 20);
        this.tweens.killTweensOf(cellsRight[i]);
        cellsRight[i].setScale(small.has(i) ? SMALL : 1);
        if (found.size === diffs.size) {
          void this.completeTask(mistakes === 0, [line({ en: 'You found them all!', zh: '全部找到了！' }, lang)]);
        }
      } else {
        mistakes++;
        sfx.wrong();
        wiggle(this, t);
        if (mistakes >= 3 && !hinted) {
          hinted = true;
          const next = [...diffs].find((d) => !found.has(d));
          if (next !== undefined) pulse(this, cellsRight[next], cellsRight[next].scale * 1.15);
        }
      }
    };

    void this.setPrompt([line(prompt, lang)]);
  }
}
