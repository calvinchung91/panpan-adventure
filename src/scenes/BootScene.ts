// "Tap to Play" screen. The first tap unlocks sound and speech (browsers require a touch first)
// and switches the phone to full-screen landscape.
import Phaser from 'phaser';
import { modeLines } from '../core/lang';
import { unlockAudio } from '../core/sfx';
import { speech } from '../core/speech';
import { background, button, C, mascot, pulse, txt } from '../core/ui';
import { P } from '../data/phrases';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const { width: W } = this.scale;
    background(this, 'sky');
    mascot(this, W / 2, 400, 300);
    txt(this, W / 2, 130, `${P.title.en}  ·  ${P.title.zh}`, 76, '#ffffff').setStroke('#2b6cb0', 12);
    const b = button(this, W / 2, 800, 680, 200, `▶  ${P.tapToPlay.en}\n${P.tapToPlay.zh}`, () => this.start(), {
      fill: C.green,
      size: 62,
    });
    pulse(this, b, 1.06);
  }

  private start(): void {
    unlockAudio();
    void speech.say(modeLines(P.welcome));
    const os = this.sys.game.device.os;
    if ((os.android || os.iOS) && !this.scale.isFullscreen) {
      this.scale.once(Phaser.Scale.Events.ENTER_FULLSCREEN, () => {
        const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        o.lock?.('landscape').catch(() => {});
      });
      this.scale.startFullscreen();
    }
    this.scene.launch('Overlay');
    this.scene.start('Home');
  }
}
