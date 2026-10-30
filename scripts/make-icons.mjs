// Draws the panda app icon and writes public/icons/icon-192.png and icon-512.png.
// Pure Node (zlib only), no image libraries needed. Run: npm run icons
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const BG = [124, 200, 240];
const WHITE = [255, 255, 255];
const BLACK = [43, 43, 52];
const PINK = [255, 150, 180];

// Shapes in unit coordinates (0..1), painted in order; later shapes cover earlier ones.
const S = 0.85; // shrink toward centre so the face fits Android's round "maskable" crop
const p = (v) => 0.5 + (v - 0.5) * S;
const shapes = [
  { cx: 0.31, cy: 0.29, rx: 0.12, ry: 0.12, c: BLACK }, // ears
  { cx: 0.69, cy: 0.29, rx: 0.12, ry: 0.12, c: BLACK },
  { cx: 0.5, cy: 0.55, rx: 0.34, ry: 0.31, c: WHITE }, // face
  { cx: 0.385, cy: 0.52, rx: 0.075, ry: 0.095, c: BLACK }, // eye patches
  { cx: 0.615, cy: 0.52, rx: 0.075, ry: 0.095, c: BLACK },
  { cx: 0.395, cy: 0.505, rx: 0.026, ry: 0.026, c: WHITE }, // eye shine
  { cx: 0.605, cy: 0.505, rx: 0.026, ry: 0.026, c: WHITE },
  { cx: 0.3, cy: 0.64, rx: 0.045, ry: 0.03, c: PINK }, // cheeks
  { cx: 0.7, cy: 0.64, rx: 0.045, ry: 0.03, c: PINK },
  { cx: 0.5, cy: 0.635, rx: 0.042, ry: 0.03, c: BLACK }, // nose
].map((s) => ({ ...s, cx: p(s.cx), cy: p(s.cy), rx: s.rx * S, ry: s.ry * S }));

function colourAt(x, y) {
  let c = BG;
  for (const s of shapes) {
    const dx = (x - s.cx) / s.rx, dy = (y - s.cy) / s.ry;
    if (dx * dx + dy * dy <= 1) c = s.c;
  }
  return c;
}

function render(size) {
  const SS = 3; // supersampling for smooth edges
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // PNG filter: none
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const c = colourAt((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
          r += c[0]; g += c[1]; b += c[2];
        }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r / (SS * SS); raw[o + 1] = g / (SS * SS); raw[o + 2] = b / (SS * SS); raw[o + 3] = 255;
    }
  }
  return png(size, size, raw);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
for (const size of [192, 512]) writeFileSync(`public/icons/icon-${size}.png`, render(size));
console.log('Icons written to public/icons/');
