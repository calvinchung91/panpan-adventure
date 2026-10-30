// Shared drawing helpers: text, big buttons, cards, backgrounds and celebration effects.
import Phaser from 'phaser';
import { sfx } from './sfx';

export const FONT = '"Nunito", "Varela Round", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const INK = '#2b3a55';

export const C = {
  orange: 0xff9f40,
  green: 0x4cd36b,
  blue: 0x4a90ff,
  pink: 0xff6fa8,
  purple: 0xa66bff,
  yellow: 0xffd23f,
  red: 0xff5a5a,
  grey: 0xc9d3e0,
  white: 0xffffff,
};

export type TapCard = Phaser.GameObjects.Container & {
  paint: (color: number) => void;
  label?: Phaser.GameObjects.Text;
};

export function shade(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).darken(amount).color;
}

export function txt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  s: string,
  size = 56,
  color = INK,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, s, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color,
      align: 'center',
      fontStyle: 'bold',
      padding: { x: 4, y: Math.round(size * 0.15) }, // stops emoji tops being clipped
      ...extra,
    })
    .setOrigin(0.5);
}

/** A rounded card with a soft 3D edge. Tappable when onTap is given (fires on finger lift). */
export function tapCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  onTap: (() => void) | null,
  opts: { fill?: number; alpha?: number; radius?: number } = {},
): TapCard {
  const r = Math.min(opts.radius ?? 36, h / 2, w / 2);
  const alpha = opts.alpha ?? 1;
  const c = scene.add.container(x, y) as TapCard;
  const g = scene.add.graphics();
  c.paint = (col: number) => {
    g.clear();
    g.fillStyle(shade(col, 25), alpha);
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, r);
    g.fillStyle(col, alpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    const hr = Math.min(r * 0.8, h * 0.15);
    if (hr > 2 && col !== C.white) {
      g.fillStyle(0xffffff, 0.22);
      g.fillRoundedRect(-w / 2 + 16, -h / 2 + 10, w - 32, h * 0.3, hr);
    }
  };
  c.paint(opts.fill ?? C.white);
  c.add(g);
  c.setSize(w, h);
  if (onTap) {
    c.setInteractive({ useHandCursor: true });
    let down = false;
    const release = () => {
      if (!down) return;
      down = false;
      scene.tweens.add({ targets: c, scale: 1, duration: 90 });
    };
    c.on('pointerdown', () => {
      down = true;
      sfx.tap();
      scene.tweens.add({ targets: c, scale: 0.93, duration: 70 });
    });
    c.on('pointerup', () => {
      const was = down;
      release();
      if (was) onTap();
    });
    c.on('pointerout', release);
  }
  return c;
}

/** A coloured button with a (possibly multi-line) label. */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onTap: () => void,
  opts: { fill?: number; size?: number; color?: string } = {},
): TapCard {
  const c = tapCard(scene, x, y, w, h, onTap, { fill: opts.fill ?? C.orange, radius: 44 });
  const t = txt(scene, 0, 0, label, opts.size ?? Math.round(h * 0.32), opts.color ?? '#ffffff');
  t.setShadow(0, 3, 'rgba(0,0,0,0.25)', 4);
  c.add(t);
  c.label = t;
  return c;
}

/** A button that must be held down (for the parent gate), with a filling ring. */
export function holdButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  ms: number,
  onDone: () => void,
  size = 110,
  fill = 0xffffff,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const bg = scene.add.circle(0, 0, size / 2, fill, 0.75);
  const ring = scene.add.graphics();
  const t = txt(scene, 0, 0, label, Math.round(size * 0.42));
  c.add([bg, ring, t]);
  c.setSize(size, size).setInteractive();
  let ev: Phaser.Time.TimerEvent | null = null;
  const stop = () => {
    ev?.remove();
    ev = null;
    ring.clear();
  };
  c.on('pointerdown', () => {
    const start = scene.time.now;
    ev = scene.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        const p = Math.min(1, (scene.time.now - start) / ms);
        ring.clear();
        ring.lineStyle(10, C.pink, 1);
        ring.beginPath();
        ring.arc(0, 0, size / 2 - 6, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
        ring.strokePath();
        if (p >= 1) {
          stop();
          onDone();
        }
      },
    });
  });
  c.on('pointerup', stop);
  c.on('pointerout', stop);
  return c;
}

export type BgKind = 'sky' | 'meadow' | 'sea';

export function background(scene: Phaser.Scene, kind: BgKind): void {
  const { width: W, height: H } = scene.scale;
  const g = scene.add.graphics().setDepth(-10);
  const [top, bottom] = kind === 'sea' ? [0x5cc4f0, 0x1f73b8] : [0x8fd3ff, 0xdff5ff];
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, W, H);

  if (kind === 'meadow') {
    g.fillStyle(0x9fdc74, 1);
    g.fillEllipse(W * 0.25, H * 1.05, W * 1.0, H * 0.55);
    g.fillStyle(0x86cf5f, 1);
    g.fillEllipse(W * 0.8, H * 1.08, W * 1.1, H * 0.6);
  }
  if (kind === 'sea') {
    g.fillStyle(0xf3d9a4, 1);
    g.fillEllipse(W * 0.5, H * 1.08, W * 1.4, H * 0.28);
    for (let i = 0; i < 14; i++) {
      const b = scene.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(H * 0.3, H), Phaser.Math.Between(6, 16), 0xffffff, 0.35).setDepth(-9);
      scene.tweens.add({ targets: b, y: -40, duration: Phaser.Math.Between(6000, 12000), repeat: -1, delay: Phaser.Math.Between(0, 5000) });
    }
    return;
  }
  // drifting clouds
  for (let i = 0; i < 4; i++) {
    const cl = scene.add.container(Phaser.Math.Between(0, W), Phaser.Math.Between(60, H * 0.35)).setDepth(-9);
    const cg = scene.add.graphics();
    cg.fillStyle(0xffffff, 0.9);
    cg.fillCircle(0, 0, 50);
    cg.fillCircle(55, -15, 62);
    cg.fillCircle(115, 0, 48);
    cg.fillRoundedRect(-30, 0, 170, 45, 22);
    cl.add(cg);
    cl.setScale(Phaser.Math.FloatBetween(0.7, 1.3));
    scene.tweens.add({ targets: cl, x: W + 250, duration: Phaser.Math.Between(40000, 70000), repeat: -1, onRepeat: () => (cl.x = -250) });
  }
}

export function confetti(scene: Phaser.Scene, x: number, y: number, count = 80): void {
  if (!scene.textures.exists('confetti')) {
    const g = scene.make.graphics({}, false);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 18, 11);
    g.generateTexture('confetti', 18, 11);
    g.destroy();
  }
  const e = scene.add.particles(x, y, 'confetti', {
    speed: { min: 350, max: 1000 },
    angle: { min: 215, max: 325 },
    gravityY: 1300,
    lifespan: 1900,
    rotate: { min: 0, max: 360 },
    scale: { start: 1.4, end: 0.7 },
    tint: [C.red, C.yellow, C.green, C.blue, C.pink, C.purple, C.orange],
    emitting: false,
  });
  e.setDepth(1000);
  e.explode(count);
  scene.time.delayedCall(2600, () => e.destroy());
}

export function wiggle(scene: Phaser.Scene, obj: Phaser.GameObjects.Container | Phaser.GameObjects.Text): void {
  if (obj.getData('wiggling')) return;
  obj.setData('wiggling', true);
  scene.tweens.add({
    targets: obj,
    x: obj.x + 18,
    duration: 55,
    yoyo: true,
    repeat: 3,
    onComplete: () => obj.setData('wiggling', false),
  });
}

export function pulse(scene: Phaser.Scene, obj: Phaser.GameObjects.GameObject, scale = 1.1): Phaser.Tweens.Tween {
  return scene.tweens.add({ targets: obj, scale, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

export function popIn(scene: Phaser.Scene, obj: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject, delay = 0): void {
  obj.setScale(0);
  scene.tweens.add({ targets: obj, scale: 1, duration: 360, delay, ease: 'Back.easeOut' });
}

/** Pan Pan, our panda guide. */
export function mascot(scene: Phaser.Scene, x: number, y: number, size: number): Phaser.GameObjects.Text {
  const m = txt(scene, x, y, '🐼', size);
  scene.tweens.add({ targets: m, y: y - 14, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return m;
}

export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => scene.time.delayedCall(ms, resolve));
}

/** Lays out n objects in rows of `perRow`, with a small gap after every 5 (like a ten-frame). */
export function gridLayout(n: number, a: { x: number; y: number; w: number; h: number }, perRow = 10, maxCell = 170) {
  const cols = Math.min(n, perRow);
  const rows = Math.ceil(n / perRow);
  const gapUnits = Math.floor((cols - 1) / 5) * 0.5;
  const cell = Math.min(a.w / (cols + gapUnits), a.h / rows, maxCell);
  const x0 = a.x + (a.w - cell * (cols + gapUnits)) / 2 + cell / 2;
  const y0 = a.y + (a.h - cell * rows) / 2 + cell / 2;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % perRow;
    pts.push({ x: x0 + cell * (col + Math.floor(col / 5) * 0.5), y: y0 + Math.floor(i / perRow) * cell });
  }
  return { pts, cell };
}
