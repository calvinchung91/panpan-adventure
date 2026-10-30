// Today's Adventure: a path of games ending in a trophy. Finishing the whole path is the
// focus goal; the path grows longer as your child completes them (see pathLength in save.ts).
import Phaser from 'phaser';
import { modeLines, modeText } from '../core/lang';
import { pickOne, shuffle } from '../core/rand';
import { isEnabled, pathLength, persist, save, type GameId } from '../core/save';
import { sfx } from '../core/sfx';
import { speech } from '../core/speech';
import { background, button, C, confetti, popIn, pulse, tapCard, txt, wait } from '../core/ui';
import { GAMES, GAME_IDS } from '../data/games';
import { P } from '../data/phrases';
import { awardSticker } from '../data/stickers';

/** Picks games (only those switched on in Parent Corner), all different where possible, never the same twice in a row. */
function makePath(len: number): GameId[] {
  const ids = GAME_IDS.filter(isEnabled);
  const out = shuffle(ids).slice(0, Math.min(len, ids.length));
  while (out.length < len) {
    const choices = ids.filter((g) => g !== out[out.length - 1]);
    out.push(pickOne(choices.length ? choices : ids));
  }
  return out;
}

export class PathScene extends Phaser.Scene {
  private advanced = false;

  constructor() {
    super('Path');
  }

  init(data?: { advanced?: boolean }): void {
    this.advanced = !!data?.advanced;
  }

  create(): void {
    const { width: W } = this.scale;
    background(this, 'meadow');
    if (!save.currentPath) {
      save.currentPath = { games: makePath(pathLength()), index: 0 };
      persist();
    }
    const path = save.currentPath;
    const n = path.games.length;
    const idx = path.index;

    button(this, 95, 85, 140, 120, '🏠', () => this.leave('Home'), { fill: C.blue, size: 60 });
    txt(this, W / 2, 105, modeText(P.todaysAdventure), 54).setStroke('#ffffff', 8);

    // stop positions along a gentle wave, plus a trophy at the end
    const total = n + 1;
    const pts = Array.from({ length: total }, (_, i) => ({
      x: W * 0.1 + (i * W * 0.8) / (total - 1),
      y: 560 + (i % 2 === 0 ? 80 : -80),
    }));

    const dots = this.add.graphics();
    dots.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < total - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const steps = Math.floor(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 42);
      for (let s = 1; s < steps; s++) dots.fillCircle(a.x + ((b.x - a.x) * s) / steps, a.y + ((b.y - a.y) * s) / steps, 9);
    }

    path.games.forEach((g, i) => {
      const done = i < idx;
      const current = i === idx;
      const c = this.add.container(pts[i].x, pts[i].y);
      c.add(this.add.circle(0, 8, 82, 0x000000, 0.12));
      c.add(this.add.circle(0, 0, 82, done ? C.green : current ? C.orange : 0xffffff).setStrokeStyle(8, 0xffffff));
      c.add(txt(this, 0, 0, GAMES[g].icon, 80));
      if (done) c.add(txt(this, 55, -55, '✅', 48));
      if (current) {
        c.setSize(170, 170).setInteractive({ useHandCursor: true });
        c.on('pointerup', () => this.play());
        pulse(this, c, 1.08);
      }
    });
    const trophy = this.add.container(pts[n].x, pts[n].y);
    trophy.add(this.add.circle(0, 0, 96, C.yellow).setStrokeStyle(8, 0xffffff));
    trophy.add(txt(this, 0, 0, '🏆', 96));

    const from = this.advanced ? idx - 1 : idx;
    const token = txt(this, pts[from].x, pts[from].y - 140, '🐼', 110);
    const arrive = () => {
      if (idx >= n) void this.complete(token);
    };
    if (this.advanced) {
      this.tweens.add({ targets: token, x: pts[idx].x, duration: 900, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: token, y: pts[idx].y - 140, duration: 900, ease: 'Sine.easeInOut', onComplete: arrive });
      this.tweens.add({ targets: token, scale: 1.25, duration: 450, yoyo: true });
    } else {
      arrive();
    }

    if (idx < n) {
      const go = button(this, W / 2, 960, 460, 150, `▶  ${P.go.en}  ${P.go.zh}`, () => this.play(), { fill: C.green, size: 58 });
      pulse(this, go, 1.05);
      const said = this.advanced ? P.moreToGo(n - idx) : idx === 0 ? P.adventureStart(n) : P.letsContinue;
      void speech.say(modeLines(said));
    }
  }

  private play(): void {
    const path = save.currentPath;
    if (!path) return;
    speech.stop();
    this.scene.start(GAMES[path.games[path.index]].scene, { fromPath: true });
  }

  private leave(key: string): void {
    speech.stop();
    this.scene.start(key);
  }

  /** The whole adventure is done: big celebration and +5 stars. */
  private async complete(token: Phaser.GameObjects.Text): Promise<void> {
    const { width: W, height: H } = this.scale;
    const before = pathLength();
    save.stars += 5;
    save.adventuresDone++;
    save.currentPath = null;
    persist();
    const longer = pathLength() > before;

    sfx.tada();
    this.tweens.add({ targets: token, scale: 1.4, duration: 300, yoyo: true, repeat: 2 });
    confetti(this, W * 0.25, H * 0.6, 120);
    this.time.delayedCall(400, () => confetti(this, W * 0.75, H * 0.6, 120));
    this.time.delayedCall(800, () => confetti(this, W * 0.5, H * 0.5, 160));

    await wait(this, 900);
    const sticker = awardSticker();
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35).setInteractive().setDepth(100);
    const card = tapCard(this, W / 2, H / 2, 1000, 820, null, { radius: 60 }).setDepth(101);
    popIn(this, card);
    card.add(txt(this, 0, -300, '🏆  +5 ⭐', 100));
    const gift = txt(this, 0, -40, sticker ? '🎁' : '🌟', 220);
    card.add(gift);
    const label = txt(this, 0, 150, '', 52);
    card.add(label);
    const home = button(this, sticker ? -170 : 0, 310, 300, 140, '🏠', () => this.leave('Home'), { fill: C.blue, size: 70 });
    card.add(home);
    if (sticker) card.add(button(this, 170, 310, 300, 140, '📒', () => this.leave('Sticker'), { fill: C.pink, size: 70 }));

    const lines = [...modeLines(P.adventureDone), ...(longer ? modeLines(P.longer) : [])];
    if (!sticker) return void speech.say(lines);

    // gift wobbles, then opens into the new sticker
    this.tweens.add({ targets: gift, angle: { from: -10, to: 10 }, duration: 120, yoyo: true, repeat: 5 });
    await wait(this, 1500);
    sfx.tada();
    gift.setText(sticker);
    popIn(this, gift);
    confetti(this, W / 2, H / 2 - 40, 100);
    label.setText(modeText(P.newSticker));
    void speech.say([...lines, ...modeLines(P.newSticker)]);
  }
}
