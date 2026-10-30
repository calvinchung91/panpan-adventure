import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { PathScene } from './scenes/PathScene';
import { ParentScene } from './scenes/ParentScene';
import { StickerScene } from './scenes/StickerScene';
import { MapScene } from './scenes/MapScene';
import { StageScene } from './scenes/StageScene';
import { OverlayScene } from './scenes/OverlayScene';
import { CountScene } from './games/CountScene';
import { WordScene } from './games/WordScene';
import { ScienceScene } from './games/ScienceScene';
import { MoralScene } from './games/MoralScene';
import { TapOnlyScene } from './games/TapOnlyScene';
import { MemoryScene } from './games/MemoryScene';
import { PatternScene } from './games/PatternScene';
import { SpotScene } from './games/SpotScene';

// The game is always 1080 tall; the width follows the phone's shape so wide phones have no black bars.
const H = 1080;
const aspect = Math.max(innerWidth, innerHeight) / Math.min(innerWidth, innerHeight);
const W = Math.round(Phaser.Math.Clamp(H * aspect, 1728, 2520));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#bfe9ff',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  input: { activePointers: 3 },
  // Order matters: Overlay is last so it always draws on top.
  scene: [
    BootScene, HomeScene, MapScene, StageScene, PathScene, ParentScene, StickerScene,
    CountScene, WordScene, ScienceScene, MoralScene, TapOnlyScene, MemoryScene, PatternScene, SpotScene,
    OverlayScene,
  ],
});

// handy for debugging in the browser console during development only
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
