// 🃏 Memory Match
// Flip two cards at a time to find matching pairs. Low levels show all cards first ("peek").
// Each match says the word, so it doubles as vocabulary practice.
import Phaser from 'phaser';
import { adaptByStars } from '../core/adapt';
import { BaseGame } from '../core/BaseGame';
import { line, modeLines, taskLang } from '../core/lang';
import { shuffle } from '../core/rand';
import { sfx } from '../core/sfx';
import { C, confetti, popIn, tapCard, txt, wait, type TapCard } from '../core/ui';
import { WORDS, type Word } from '../data/words';

const LEVELS: Record<number, { pairs: number; peekMs: number }> = {
  1: { pairs: 2, peekMs: 3000 },
  2: { pairs: 3, peekMs: 2500 },
  3: { pairs: 4, peekMs: 2000 },
  4: { pairs: 5, peekMs: 0 },
  5: { pairs: 6, peekMs: 0 },
};

interface Card {
  box: Phaser.GameObjects.Container;
  front: TapCard;
  back: TapCard;
  word: Word;
  up: boolean;
  matched: boolean;
}

export class MemoryScene extends BaseGame {
  readonly gameId = 'memory' as const;
  private cards: Card[] = [];
  private open: Card[] = [];
  private locked = true;
  private matches = 0;
  private misses = 0;

  constructor() {
    super('Memory');
  }

  create(): void {
    const cfg = LEVELS[this.level];
    this.cards = [];
    this.open = [];
    this.locked = true;
    this.matches = 0;
    this.misses = 0;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xf1ecff).setOrigin(0).setDepth(-10);
    this.header(false);

    const words = shuffle(WORDS).slice(0, cfg.pairs);
    const deck = shuffle([...words, ...words]);
    const n = deck.length;
    const cols = n <= 6 ? n : Math.ceil(n / 2);
    const rows = n <= 6 ? 1 : 2;
    const W = this.scale.width;
    deck.forEach((word, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = W / 2 + (col - (cols - 1) / 2) * 260;
      const y = 600 + (row - (rows - 1) / 2) * 320;
      this.cards.push(this.makeCard(x, y, word));
    });
    void this.start(cfg.peekMs);
  }

  private makeCard(x: number, y: number, word: Word): Card {
    const box = this.add.container(x, y);
    const back = tapCard(this, 0, 0, 230, 290, null, { fill: C.purple, radius: 36 });
    back.add(txt(this, 0, 0, '🐼', 90).setAlpha(0.85));
    const front = tapCard(this, 0, 0, 230, 290, null, { radius: 36 });
    front.add(txt(this, 0, 0, word.emoji, 140));
    front.setVisible(false);
    box.add([back, front]);
    box.setSize(230, 290).setInteractive({ useHandCursor: true });
    const card: Card = { box, front, back, word, up: false, matched: false };
    box.on('pointerup', () => this.tap(card));
    popIn(this, box, this.cards.length * 60);
    return card;
  }

  private flip(card: Card, up: boolean): void {
    card.up = up;
    this.tweens.add({
      targets: card.box,
      scaleX: 0,
      duration: 110,
      onComplete: () => {
        card.front.setVisible(up);
        card.back.setVisible(!up);
        this.tweens.add({ targets: card.box, scaleX: 1, duration: 110 });
      },
    });
  }

  private async start(peekMs: number): Promise<void> {
    await wait(this, 700);
    if (peekMs > 0) {
      this.cards.forEach((c) => this.flip(c, true));
      void this.setPrompt(modeLines({ en: 'Look carefully and remember!', zh: '仔细看，记住它们！' }));
      await wait(this, peekMs + 800);
      this.cards.forEach((c) => this.flip(c, false));
      await wait(this, 400);
    }
    void this.setPrompt(modeLines({ en: 'Find the matching pairs!', zh: '找出一样的两张卡片！' }));
    this.locked = false;
  }

  private async tap(card: Card): Promise<void> {
    if (this.locked || card.up || card.matched) return;
    sfx.tap();
    this.flip(card, true);
    this.open.push(card);
    if (this.open.length < 2) return;

    this.locked = true;
    const [a, b] = this.open;
    this.open = [];
    await wait(this, 450);
    if (a.word === b.word) {
      a.matched = b.matched = true;
      a.front.paint(C.green);
      b.front.paint(C.green);
      sfx.correct();
      confetti(this, (a.box.x + b.box.x) / 2, (a.box.y + b.box.y) / 2, 30);
      void this.say([line(a.word, taskLang(this.matches))]);
      this.matches++;
      if (this.matches === this.cards.length / 2) return void this.end();
    } else {
      this.misses++;
      await wait(this, 600);
      this.flip(a, false);
      this.flip(b, false);
      await wait(this, 250);
    }
    this.locked = false;
  }

  private async end(): Promise<void> {
    const pairs = this.cards.length / 2;
    const stars = this.misses <= pairs * 0.5 ? 3 : this.misses <= pairs * 1.5 ? 2 : 1;
    adaptByStars(this.gameId, stars);
    await wait(this, 1200);
    if (this.alive) this.finishRound(stars);
  }
}
