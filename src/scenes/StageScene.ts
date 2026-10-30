// Stage map for one game: stages 1–30 with the best stars won on each. Finishing a stage unlocks
// the next; any unlocked stage can be replayed for more stars.
import Phaser from 'phaser';
import { music } from '../core/music';
import { modeLines, oneLine } from '../core/lang';
import { save, type GameId } from '../core/save';
import { sfx } from '../core/sfx';
import { speech } from '../core/speech';
import { STAGES } from '../core/stageMath';
import { background, button, C, popIn, pulse, txt, wiggle } from '../core/ui';
import { GAMES } from '../data/games';
import { P } from '../data/phrases';

export class StageScene extends Phaser.Scene {
  private gameId: GameId = 'count';

  constructor() {
    super('Stage');
  }

  init(data?: { game?: GameId }): void {
    this.gameId = data?.game ?? 'count';
  }

  create(): void {
    const { width: W } = this.scale;
    music.play('playful');
    const info = GAMES[this.gameId];
    const prog = save.stages[this.gameId];
    background(this, 'sky');

    button(this, 95, 85, 140, 120, '🏠', () => this.go('Home'), { fill: C.blue, size: 60 });
    txt(this, W / 2, 90, `${info.icon} ${oneLine(info.name)}`, 60, '#ffffff').setStroke('#2b6cb0', 12);
    const total = prog.stars.reduce((n, s) => n + (s ?? 0), 0);
    txt(this, W - 170, 85, `⭐ ${total}/${STAGES * 3}`, 46).setStroke('#ffffff', 8);

    for (let i = 0; i < STAGES; i++) {
      const stage = i + 1;
      const col = i % 10, row = Math.floor(i / 10);
      const x = W / 2 + (col - 4.5) * 165;
      const y = 320 + row * 260;
      const stars = prog.stars[i] ?? 0;
      const locked = stage > prog.unlocked;
      const current = stage === prog.unlocked;

      const c = this.add.container(x, y);
      const fill = locked ? C.grey : current ? C.orange : stars > 0 ? C.green : C.blue;
      c.add(this.add.circle(0, 6, 66, 0x000000, 0.15));
      c.add(this.add.circle(0, 0, 66, fill).setStrokeStyle(6, 0xffffff));
      c.add(txt(this, 0, 0, String(stage), 52, '#ffffff').setAlpha(locked ? 0.6 : 1));
      if (locked) c.add(txt(this, 44, -44, '🔒', 34));
      for (let s = 0; s < 3; s++) c.add(txt(this, (s - 1) * 38, 92, '⭐', 30).setAlpha(s < stars ? 1 : 0.2));
      c.setSize(140, 140).setInteractive({ useHandCursor: true });
      c.on('pointerup', () => (locked ? this.locked(c) : this.play(stage)));
      popIn(this, c, i * 15);
      if (current) this.time.delayedCall(700, () => pulse(this, c, 1.1));
    }

    void speech.say(modeLines(P.pickStage(info.name)));
  }

  private play(stage: number): void {
    sfx.tap();
    speech.stop();
    this.scene.start(GAMES[this.gameId].scene, { stage });
  }

  private locked(c: Phaser.GameObjects.Container): void {
    sfx.wrong();
    wiggle(this, c);
    void speech.say(modeLines(P.stageLocked));
  }

  private go(key: string): void {
    speech.stop();
    this.scene.start(key);
  }
}
