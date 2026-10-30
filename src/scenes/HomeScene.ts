// Home: the big "Today's Adventure" button, free-play tiles, star count, and the parent gear (hold 2.5s).
import Phaser from 'phaser';
import { modeLines } from '../core/lang';
import { pickOne } from '../core/rand';
import { save } from '../core/save';
import { speech } from '../core/speech';
import { background, button, C, holdButton, mascot, pulse, tapCard, txt } from '../core/ui';
import { GAMES, GAME_IDS } from '../data/games';
import { HELLO, P } from '../data/phrases';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create(): void {
    const { width: W } = this.scale;
    background(this, 'meadow');

    txt(this, W / 2, 100, P.title.en, 80, '#ffffff').setStroke('#2b6cb0', 12);
    txt(this, W / 2, 195, P.title.zh, 62, '#ffffff').setStroke('#2b6cb0', 10);

    const m = mascot(this, W * 0.17, 640, 300);
    m.setInteractive({ useHandCursor: true });
    m.on('pointerdown', () => {
      this.tweens.add({ targets: m, scale: 1.12, duration: 120, yoyo: true });
      void speech.say(modeLines(pickOne(HELLO)));
    });

    const path = save.currentPath;
    const label =
      path && path.index > 0
        ? `▶  ${P.continueAdventure.en}  ${path.index}/${path.games.length}\n${P.continueAdventure.zh}`
        : `▶  ${P.todaysAdventure.en}\n${P.todaysAdventure.zh}`;
    const adv = button(this, W * 0.6, 385, 780, 200, label, () => this.go('Path', {}), { fill: C.orange, size: 60 });
    pulse(this, adv, 1.04);

    // free play: all games, 4 per row
    const fills = [C.blue, C.pink, C.green, C.purple];
    GAME_IDS.forEach((id, i) => {
      const g = GAMES[id];
      const x = W * 0.6 + ((i % 4) - 1.5) * 250;
      const y = 650 + Math.floor(i / 4) * 230;
      const tile = tapCard(this, x, y, 230, 200, () => this.go(g.scene, {}), { fill: fills[i % fills.length], radius: 40 });
      tile.add(txt(this, 0, -38, g.icon, 70));
      tile.add(txt(this, 0, 52, `${g.name.en}\n${g.name.zh}`, 28, '#ffffff').setShadow(0, 3, 'rgba(0,0,0,0.25)', 4));
    });

    button(this, W - 380, 85, 150, 120, '📒', () => this.go('Sticker', {}), { fill: C.pink, size: 64 });
    txt(this, W - 150, 85, `⭐ ${save.stars}`, 64).setStroke('#ffffff', 8);
    holdButton(this, 90, 85, '⚙️', 2500, () => this.go('Parent', {}));
    txt(this, 90, 165, 'hold', 22, '#5b6b88');
  }

  private go(key: string, data: object): void {
    speech.stop();
    this.scene.start(key, data);
  }
}
