// 🗺️ Adventure Map: six worlds with 5 stages each. Every finished Today's Adventure completes one
// stage; finishing a world unlocks the next. Tap the glowing world to play its next stage.
import Phaser from 'phaser';
import { music } from '../core/music';
import { modeLines, modeText, type Bi } from '../core/lang';
import { sfx } from '../core/sfx';
import { speech } from '../core/speech';
import { background, button, C, popIn, pulse, tapCard, txt, wiggle } from '../core/ui';
import { S } from '../data/sentences';
import { STAGES_PER_WORLD, WORLDS, worldProgress } from '../data/worlds';

export class MapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create(): void {
    const { width: W } = this.scale;
    music.play('playful');
    const prog = worldProgress();
    background(this, 'sky');
    button(this, 95, 85, 140, 120, '🏠', () => this.go('Home'), { fill: C.blue, size: 60 });
    txt(this, W / 2, 90, modeText({ en: 'Adventure Map', zh: '冒险地图' }).replace('\n', ' · '), 60, '#ffffff').setStroke('#2b6cb0', 12);

    WORLDS.forEach((w, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = W / 2 + (col - 1) * 520;
      const y = 390 + row * 390;
      const locked = i > prog.world;
      const current = i === prog.world;
      const done = i < prog.world || (current && prog.allDone);
      const stagesDone = done ? STAGES_PER_WORLD : current ? prog.stage : 0;

      const tile = tapCard(this, x, y, 470, 330, () => this.tapWorld(i, locked, done, tile), {
        fill: locked ? C.grey : w.color,
        radius: 50,
      });
      tile.add(txt(this, 0, -70, w.icon, 120).setAlpha(locked ? 0.4 : 1));
      tile.add(txt(this, 0, 45, modeText(w.name).replace('\n', ' · '), 44, '#ffffff').setShadow(0, 3, 'rgba(0,0,0,0.3)', 4));
      // one star per stage
      for (let s = 0; s < STAGES_PER_WORLD; s++) {
        tile.add(txt(this, (s - 2) * 70, 120, '⭐', 50).setAlpha(s < stagesDone ? 1 : 0.25));
      }
      if (locked) tile.add(txt(this, 170, -110, '🔒', 64));
      if (done) tile.add(txt(this, 170, -110, '✅', 60));
      popIn(this, tile, i * 90);
      if (current && !prog.allDone) {
        this.time.delayedCall(700, () => pulse(this, tile, 1.05));
        tile.add(txt(this, -170, -110, '▶', 60, '#ffffff'));
      }
    });

    const w = WORLDS[prog.world];
    const said: Bi = prog.allDone ? S.mapAllDone : S.mapExplore(w.name, prog.stage + 1, STAGES_PER_WORLD);
    void speech.say(modeLines(said));
  }

  private tapWorld(i: number, locked: boolean, done: boolean, tile: Phaser.GameObjects.Container): void {
    const prog = worldProgress();
    const w = WORLDS[i];
    if (locked) {
      sfx.wrong();
      wiggle(this, tile);
      const prev = WORLDS[i - 1];
      void speech.say(modeLines(S.mapLocked(prev.name)));
      return;
    }
    // the current world (or Space after everything is done) starts the next adventure
    if (i === prog.world) return this.go('Path');
    if (done) void speech.say(modeLines(S.mapFinished(w.name)));
  }

  private go(key: string): void {
    speech.stop();
    this.scene.start(key);
  }
}
