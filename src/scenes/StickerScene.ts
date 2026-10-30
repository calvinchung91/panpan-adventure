// 📒 Sticker Book: drag won stickers from the tray onto the picture. Drag a sticker back
// onto the tray to remove it. Positions are saved.
import Phaser from 'phaser';
import { modeLines, modeText } from '../core/lang';
import { persist, save, type PlacedSticker } from '../core/save';
import { sfx } from '../core/sfx';
import { speech } from '../core/speech';
import { background, button, C, txt } from '../core/ui';
import { STICKERS } from '../data/stickers';

const MAX_PLACED = 80;
const TRAY_W = 420;

export class StickerScene extends Phaser.Scene {
  private dragging: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Sticker');
  }

  create(): void {
    const { width: W, height: H } = this.scale;
    const trayX = W - TRAY_W;
    this.dragging = null;
    background(this, 'meadow');

    // tray of stickers
    const tray = this.add.graphics().setDepth(10);
    tray.fillStyle(0xffffff, 0.92);
    tray.fillRoundedRect(trayX, 20, TRAY_W - 20, H - 40, 40);
    // won stickers first, then empty slots for the ones still to win
    const owned = STICKERS.filter((s) => save.stickers.owned.includes(s));
    [...owned, ...STICKERS.filter((s) => !owned.includes(s))].forEach((s, i) => {
      const x = trayX + 62 + (i % 4) * 92;
      const y = 80 + Math.floor(i / 4) * 92;
      if (i < owned.length) {
        const t = txt(this, x, y, s, 62).setDepth(11).setInteractive({ useHandCursor: true });
        t.on('pointerdown', (p: Phaser.Input.Pointer) => this.startNew(s, p));
      } else {
        this.add.circle(x, y, 32, 0xdde3ec).setDepth(11);
      }
    });

    button(this, 95, 85, 140, 120, '🏠', () => this.leave(), { fill: C.blue, size: 60 }).setDepth(20);
    txt(this, trayX / 2, 85, `📒 ${modeText({ en: 'Sticker Book', zh: '贴纸本' }).replace('\n', ' · ')}`, 52, '#ffffff')
      .setStroke('#2b6cb0', 10)
      .setDepth(20);
    txt(this, trayX / 2, 170, `${save.stickers.owned.length} / ${STICKERS.length}`, 40, '#ffffff').setStroke('#2b6cb0', 8).setDepth(20);

    for (const p of save.stickers.placed) this.makePlaced(p);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.dragging) this.dragging.setPosition(p.worldX, p.worldY);
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.drop(p, trayX));

    if (save.stickers.owned.length === 0) {
      const msg = { en: 'Finish an adventure to win stickers!', zh: '完成冒险就能得到贴纸！' };
      txt(this, trayX / 2, H / 2, `🏆 ➜ 🎁\n${modeText(msg)}`, 52).setStroke('#ffffff', 8);
      void speech.say(modeLines(msg));
    } else {
      void speech.say(modeLines({ en: 'Drag your stickers onto the picture!', zh: '把贴纸拖到图画上吧！' }));
    }
  }

  private makePlaced(p: PlacedSticker): Phaser.GameObjects.Text {
    const t = txt(this, p.x, p.y, p.s, 120).setDepth(5).setInteractive({ useHandCursor: true });
    t.setData('entry', p);
    t.on('pointerdown', () => {
      this.dragging = t;
      t.setDepth(30).setScale(1.15);
    });
    return t;
  }

  private startNew(s: string, p: Phaser.Input.Pointer): void {
    if (save.stickers.placed.length >= MAX_PLACED) return;
    sfx.pop();
    const entry: PlacedSticker = { s, x: p.worldX, y: p.worldY };
    save.stickers.placed.push(entry);
    const t = this.makePlaced(entry);
    this.dragging = t;
    t.setDepth(30).setScale(1.15);
  }

  private drop(p: Phaser.Input.Pointer, trayX: number): void {
    const t = this.dragging;
    if (!t) return;
    this.dragging = null;
    const entry = t.getData('entry') as PlacedSticker;
    if (p.worldX > trayX - 20) {
      // dropped back on the tray: remove it
      save.stickers.placed = save.stickers.placed.filter((e) => e !== entry);
      this.tweens.add({ targets: t, scale: 0, duration: 150, onComplete: () => t.destroy() });
    } else {
      entry.x = Math.round(p.worldX);
      entry.y = Math.round(p.worldY);
      t.setDepth(5);
      this.tweens.add({ targets: t, scale: 1, duration: 150, ease: 'Back.easeOut' });
      sfx.tap();
    }
    persist();
  }

  private leave(): void {
    speech.stop();
    this.scene.start('Home');
  }
}
