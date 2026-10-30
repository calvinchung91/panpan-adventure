// 🎈 Tap Only The ___ (Focus)
// Balloons float up (or sea animals swim by). Tap ONLY the ones that match the rule and ignore
// the rest. This trains attention and impulse control. Level 5 switches the rule halfway through.
import Phaser from 'phaser';
import { adaptByStars } from '../core/adapt';
import { BaseGame } from '../core/BaseGame';
import { modeLines, modeText, type Bi } from '../core/lang';
import { pickOne, randInt, shuffle } from '../core/rand';
import { sfx } from '../core/sfx';
import { background, button, C, confetti, popIn, tapCard, txt, wait, wiggle } from '../core/ui';
import { S } from '../data/sentences';
import { BALLOON_COLORS, SEA_ANIMALS } from '../data/words';

type Balloon = (typeof BALLOON_COLORS)[number];
type Animal = (typeof SEA_ANIMALS)[number];

// switches = how many times the rule changes during the round
const LEVELS: Record<number, { kind: 'color' | 'sea'; options: number; speed: number; spawnMs: number; need: number; switches?: number }> = {
  1: { kind: 'color', options: 2, speed: 1, spawnMs: 1400, need: 6 },
  2: { kind: 'color', options: 3, speed: 1.25, spawnMs: 1150, need: 8 },
  3: { kind: 'color', options: 4, speed: 1.5, spawnMs: 950, need: 10 },
  4: { kind: 'sea', options: 4, speed: 1.2, spawnMs: 1000, need: 10 },
  5: { kind: 'color', options: 4, speed: 1.5, spawnMs: 900, need: 12, switches: 1 },
  6: { kind: 'color', options: 5, speed: 1.7, spawnMs: 800, need: 14, switches: 1 },
  7: { kind: 'sea', options: 5, speed: 1.5, spawnMs: 850, need: 14, switches: 1 },
  8: { kind: 'color', options: 6, speed: 1.9, spawnMs: 750, need: 16, switches: 2 },
};

interface Item {
  obj: Phaser.GameObjects.Container | Phaser.GameObjects.Text;
  vx: number;
  vy: number;
  phase: number;
  isTarget: boolean;
  dead: boolean;
}

export class TapOnlyScene extends BaseGame {
  readonly gameId = 'taponly' as const;
  private cfg = LEVELS[1];
  private colors: Balloon[] = [];
  private animals: Animal[] = [];
  private target: Balloon | Animal = BALLOON_COLORS[0];
  private items: Item[] = [];
  private spawner?: Phaser.Time.TimerEvent;
  private running = false;
  private caught = 0;
  private wrongTaps = 0;
  private sinceTarget = 0;
  private switchesDone = 0;
  private lastHint = 0;
  private bar!: Phaser.GameObjects.Graphics;
  private banner?: Phaser.GameObjects.Container;

  constructor() {
    super('TapOnly');
  }

  create(): void {
    this.cfg = LEVELS[this.level];
    this.items = [];
    this.running = false;
    this.caught = 0;
    this.wrongTaps = 0;
    this.sinceTarget = 0;
    this.switchesDone = 0;
    this.lastHint = 0;
    this.banner = undefined;
    if (this.cfg.kind === 'color') {
      this.colors = shuffle(BALLOON_COLORS).slice(0, this.cfg.options);
      this.target = this.colors[0];
    } else {
      this.animals = shuffle(SEA_ANIMALS).slice(0, this.cfg.options);
      this.target = this.animals[0];
    }
    background(this, this.cfg.kind === 'sea' ? 'sea' : 'sky');
    this.header(false);
    this.bar = this.add.graphics().setDepth(50);
    this.drawBar();
    this.drawBanner();
    this.showReady();
  }

  private isColor(t: Balloon | Animal): t is Balloon {
    return 'color' in t;
  }

  private rule(): Bi {
    const t = this.target;
    return S.tapRule(t, this.isColor(t));
  }

  private hint(): Bi {
    const t = this.target;
    return S.tapHint(t, this.isColor(t));
  }

  /** Small picture of the target, so he doesn't need to read the rule. */
  private targetIcon(x: number, y: number, scale: number) {
    const t = this.target;
    if (this.isColor(t)) return this.makeBalloon(t.color, x, y).setScale(scale);
    return txt(this, x, y, t.emoji, Math.round(120 * scale));
  }

  private drawBar(): void {
    const W = this.scale.width;
    const w = 640, x = W / 2 - w / 2, y = 52;
    this.bar.clear();
    this.bar.fillStyle(0xffffff, 0.75);
    this.bar.fillRoundedRect(x, y, w, 46, 23);
    const p = Math.min(1, this.caught / this.cfg.need);
    if (p > 0) {
      this.bar.fillStyle(C.green, 1);
      this.bar.fillRoundedRect(x + 4, y + 4, Math.max(38, (w - 8) * p), 38, 19);
    }
  }

  private drawBanner(): void {
    this.banner?.destroy();
    const W = this.scale.width;
    const b = this.add.container(W / 2, 175).setDepth(50);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.85);
    bg.fillRoundedRect(-520, -60, 1040, 120, 60);
    b.add(bg);
    b.add(this.targetIcon(-440, 0, 0.55));
    b.add(txt(this, 40, 0, modeText(this.rule()), modeText(this.rule()).includes('\n') ? 34 : 44));
    this.banner = b;
  }

  /** Rule card with a Start button, so he listens before the action begins. */
  private showReady(): void {
    const { width: W, height: H } = this.scale;
    const card = tapCard(this, W / 2, H / 2 + 60, 980, 600, null, { radius: 60 }).setDepth(60);
    card.add(this.targetIcon(0, -150, 1.3));
    card.add(txt(this, 0, 50, modeText(this.rule()), 54));
    const go = button(this, 0, 200, 380, 140, `▶ Start 开始`, () => {
      card.destroy();
      this.begin();
    }, { fill: C.green, size: 50 });
    card.add(go);
    popIn(this, card);
    void this.setPrompt(modeLines(this.rule()));
  }

  private begin(): void {
    this.running = true;
    this.spawner = this.time.addEvent({ delay: this.cfg.spawnMs, loop: true, callback: () => this.spawn() });
    this.spawn();
  }

  private makeBalloon(color: number, x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.lineStyle(4, 0x7a8699, 1);
    g.beginPath();
    g.moveTo(0, 72);
    g.lineTo(-6, 105);
    g.lineTo(4, 140);
    g.strokePath();
    g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(15).color, 1);
    g.fillTriangle(-12, 74, 12, 74, 0, 60);
    g.fillStyle(color, 1);
    g.fillEllipse(0, 0, 120, 145);
    g.fillStyle(0xffffff, 0.45);
    g.fillEllipse(-24, -32, 24, 38);
    c.add(g);
    c.setSize(130, 160);
    return c;
  }

  private spawn(): void {
    if (!this.running) return;
    const { width: W, height: H } = this.scale;
    // about 40% targets, and never more than 2 non-targets in a row
    const isTarget = this.sinceTarget >= 2 || Math.random() < 0.4;
    this.sinceTarget = isTarget ? 0 : this.sinceTarget + 1;
    const s = this.cfg.speed;
    let item: Item;
    if (this.cfg.kind === 'color') {
      const b = isTarget ? (this.target as Balloon) : pickOne(this.colors.filter((c) => c !== this.target));
      const obj = this.makeBalloon(b.color, randInt(200, W - 200), H + 160).setScale(this.level <= 2 ? 1.5 : 1.3);
      item = { obj, vx: 0, vy: -randInt(150, 210) * s, phase: Math.random() * 6, isTarget, dead: false };
    } else {
      const a = isTarget ? (this.target as Animal) : pickOne(this.animals.filter((x) => x !== this.target));
      const dir = Math.random() < 0.5 ? 1 : -1;
      const obj = txt(this, dir > 0 ? -100 : W + 100, randInt(360, H - 130), a.emoji, 160);
      if (dir > 0) obj.setFlipX(true); // emoji face left; flip when swimming right
      item = { obj, vx: dir * randInt(200, 300) * s, vy: 0, phase: Math.random() * 6, isTarget, dead: false };
    }
    item.obj.setInteractive({ useHandCursor: true });
    item.obj.on('pointerdown', () => this.tapItem(item));
    this.items.push(item);
  }

  update(time: number, delta: number): void {
    if (!this.running) return;
    const { width: W } = this.scale;
    const dt = delta / 1000;
    for (const it of this.items) {
      if (it.dead) continue;
      it.obj.x += it.vx * dt + (it.vy !== 0 ? Math.sin(time / 500 + it.phase) * 0.8 : 0);
      it.obj.y += it.vy * dt + (it.vx !== 0 ? Math.sin(time / 400 + it.phase) * 0.8 : 0);
      if (it.obj.y < -260 || it.obj.x < -220 || it.obj.x > W + 220) {
        it.dead = true;
        it.obj.destroy();
      }
    }
    this.items = this.items.filter((it) => !it.dead);
  }

  private tapItem(it: Item): void {
    if (it.dead || !this.running) return;
    if (!it.isTarget) {
      this.wrongTaps++;
      sfx.wrong();
      wiggle(this, it.obj);
      if (this.time.now - this.lastHint > 4000) {
        this.lastHint = this.time.now;
        void this.say(modeLines(this.hint()));
      }
      return;
    }
    it.dead = true;
    it.obj.disableInteractive();
    sfx.pop();
    confetti(this, it.obj.x, it.obj.y, 18);
    this.tweens.add({ targets: it.obj, scale: it.obj.scale * 1.5, alpha: 0, duration: 250, onComplete: () => it.obj.destroy() });
    this.caught++;
    this.drawBar();
    const sw = this.cfg.switches ?? 0;
    if (this.switchesDone < sw && this.caught === Math.floor((this.cfg.need * (this.switchesDone + 1)) / (sw + 1))) void this.switchRule();
    else if (this.caught >= this.cfg.need) void this.end();
  }

  private clearItems(): void {
    for (const it of this.items) {
      it.dead = true;
      it.obj.disableInteractive();
      this.tweens.add({ targets: it.obj, alpha: 0, duration: 300, onComplete: () => it.obj.destroy() });
    }
    this.items = [];
  }

  /** Level 5+: the rule changes during the round, so he has to listen and switch focus. */
  private async switchRule(): Promise<void> {
    this.running = false;
    this.spawner?.remove();
    this.clearItems();
    this.switchesDone++;
    this.target = this.isColor(this.target)
      ? pickOne(this.colors.filter((c) => c !== this.target))
      : pickOne(this.animals.filter((a) => a !== this.target));
    this.drawBanner();
    if (this.banner) popIn(this, this.banner);
    const r = this.rule();
    const lines = modeLines(S.tapSwitch(this.target, this.isColor(this.target)));
    this.prompt = modeLines(r);
    await this.speakFor(lines, 6000);
    if (!this.alive) return;
    this.begin();
  }

  private async end(): Promise<void> {
    this.running = false;
    this.spawner?.remove();
    this.clearItems();
    const stars = this.wrongTaps <= 1 ? 3 : this.wrongTaps <= 3 ? 2 : 1;
    adaptByStars(this.gameId, stars);
    await wait(this, 600);
    this.finishRound(stars);
  }
}
