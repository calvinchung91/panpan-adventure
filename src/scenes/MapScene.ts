// 🗺️ Adventure Map: six worlds with 5 stages each, all open. Each finished adventure in a world
// completes one of its stages. The glowing world is a suggestion: the first one not finished yet.
import Phaser from 'phaser';
import { music } from '../core/music';
import { modeLines, oneLine, type Bi } from '../core/lang';
import { sfx } from '../core/sfx';
import { speech } from '../core/speech';
import { background, button, C, popIn, pulse, tapCard, txt } from '../core/ui';
import { S } from '../data/sentences';
import { allWorldsDone, STAGES_PER_WORLD, suggestedWorld, WORLDS, worldStages } from '../data/worlds';

export class MapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create(): void {
    const { width: W } = this.scale;
    music.play('playful');
    const stages = worldStages();
    const suggested = suggestedWorld();
    const allDone = allWorldsDone();
    background(this, 'sky');
    button(this, 95, 85, 140, 120, '🏠', () => this.go('Home'), { fill: C.blue, size: 60 });
    txt(this, W / 2, 90, oneLine({ en: 'Adventure Map', zh: '冒险地图' }), 60, '#ffffff').setStroke('#2b6cb0', 12);

    WORLDS.forEach((w, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = W / 2 + (col - 1) * 520;
      const y = 390 + row * 390;
      const done = stages[i] >= STAGES_PER_WORLD;
      const glow = i === suggested && !allDone;

      const tile = tapCard(this, x, y, 470, 330, () => this.play(i), { fill: w.color, radius: 50 });
      tile.add(txt(this, 0, -70, w.icon, 120));
      tile.add(txt(this, 0, 45, oneLine(w.name), 44, '#ffffff').setShadow(0, 3, 'rgba(0,0,0,0.3)', 4));
      // one star per stage
      for (let s = 0; s < STAGES_PER_WORLD; s++) {
        tile.add(txt(this, (s - 2) * 70, 120, '⭐', 50).setAlpha(s < stages[i] ? 1 : 0.25));
      }
      if (done) tile.add(txt(this, 170, -110, '✅', 60));
      popIn(this, tile, i * 90);
      if (glow) {
        this.time.delayedCall(700, () => pulse(this, tile, 1.05));
        tile.add(txt(this, -170, -110, '▶', 60, '#ffffff'));
      }
    });

    const w = WORLDS[suggested];
    const said: Bi = allDone ? S.mapAllDone : S.mapExplore(w.name, stages[suggested] + 1, STAGES_PER_WORLD);
    void speech.say(modeLines(said));
  }

  /** Every world is open: start (or continue) an adventure there. */
  private play(world: number): void {
    sfx.tap();
    speech.stop();
    this.scene.start('Path', { world });
  }

  private go(key: string): void {
    speech.stop();
    this.scene.start(key);
  }
}
