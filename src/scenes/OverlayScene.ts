// Always runs on top of everything. Shows the rest reminder after the time set in Parent Corner,
// pausing whatever game is running until someone taps OK.
import Phaser from 'phaser';
import { modeLines, modeText } from '../core/lang';
import { save } from '../core/save';
import { speech } from '../core/speech';
import { button, C, popIn, tapCard, txt } from '../core/ui';
import { P } from '../data/phrases';

export class OverlayScene extends Phaser.Scene {
  private lastRest = Date.now();
  private showing = false;

  constructor() {
    super('Overlay');
  }

  create(): void {
    this.lastRest = Date.now();
    this.time.addEvent({ delay: 5000, loop: true, callback: () => this.check() });
  }

  private check(): void {
    const mins = save.settings.restMinutes;
    if (!mins || this.showing) return;
    if (Date.now() - this.lastRest >= mins * 60_000) this.show();
  }

  private show(): void {
    this.showing = true;
    const paused = this.scene.manager.getScenes(true).filter((s) => s !== this);
    paused.forEach((s) => this.scene.pause(s.scene.key));
    speech.stop();

    const { width: W, height: H } = this.scale;
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1b2a4a, 0.6).setInteractive();
    const card = tapCard(this, W / 2, H / 2, 1000, 700, null, { radius: 60 });
    card.add(txt(this, 0, -170, '🐼💤', 200));
    card.add(txt(this, 0, 50, modeText(P.rest), 52));
    card.add(
      button(this, 0, 230, 380, 150, `👍 ${P.ok.en} ${P.ok.zh}`, () => {
        dim.destroy();
        card.destroy();
        paused.forEach((s) => this.scene.resume(s.scene.key));
        this.showing = false;
        this.lastRest = Date.now();
      }, { fill: C.green, size: 52 }),
    );
    popIn(this, card);
    void speech.say(modeLines(P.rest));
  }
}
