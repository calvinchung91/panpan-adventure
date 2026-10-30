// Parent corner (behind the hold-to-open gear): language, rest reminder, which games appear in
// Today's Adventure, voice check, progress, reset.
import Phaser from 'phaser';
import { isEnabled, pathLength, persist, resetProgress, save, type LangMode } from '../core/save';
import { speech } from '../core/speech';
import { button, C, holdButton, txt } from '../core/ui';
import { GAMES, GAME_IDS } from '../data/games';
import { STICKERS } from '../data/stickers';
import { STAGES_PER_WORLD, WORLDS, worldProgress } from '../data/worlds';
import { MAX_LEVEL } from '../core/adapt';

export class ParentScene extends Phaser.Scene {
  constructor() {
    super('Parent');
  }

  create(): void {
    const { width: W } = this.scale;
    this.add.rectangle(W / 2, 540, W, 1080, 0xf4f7fb);
    txt(this, W / 2, 65, 'Parent Corner · 家长设置', 54);
    const left = 100;
    const col = 520;
    const label = (y: number, s: string) => txt(this, left, y, s, 38).setOrigin(0, 0.5);

    label(170, 'Language');
    const langs: [LangMode, string][] = [['en', 'English'], ['zh', '中文'], ['mixed', 'Mixed 混合']];
    langs.forEach(([v, name], i) => this.option(col + 130 + i * 280, 170, 260, name, save.settings.lang === v, () => (save.settings.lang = v)));

    label(285, 'Rest reminder');
    [0, 10, 15, 20, 30].forEach((m, i) =>
      this.option(col + 90 + i * 200, 285, 180, m === 0 ? 'Off' : `${m} min`, save.settings.restMinutes === m, () => (save.settings.restMinutes = m)),
    );

    label(450, 'In adventure');
    txt(this, left, 495, 'tap to switch games on/off', 24, '#5b6b88').setOrigin(0, 0.5);
    GAME_IDS.forEach((id, i) => {
      const on = isEnabled(id);
      const g = GAMES[id];
      this.option(col + 130 + (i % 4) * 280, 400 + Math.floor(i / 4) * 110, 260, `${g.icon} ${g.name.en}`, on, () => {
        const others = GAME_IDS.filter((o) => o !== id && isEnabled(o));
        if (on && others.length === 0) return; // keep at least one game
        save.settings.enabled[id] = !on;
        save.currentPath = null; // rebuild the adventure with the new choice
      });
    });

    label(650, 'Voices');
    const en = speech.enVoice?.name ?? 'default';
    const zh = speech.zhVoice?.name ?? '⚠ none found';
    const pack = speech.hasPack ? 'Voice pack: installed ✅ (recorded voices)' : 'Voice pack: not installed (phone voice)';
    txt(this, col, 650, `${pack}\nPhone voices: ${en} / ${zh}`, 28, '#5b6b88', { align: 'left' }).setOrigin(0, 0.5);
    button(this, W - 500, 650, 250, 96, '🔊 English', () => void speech.say([{ text: 'Hello! I am Pan Pan.', lang: 'en' }]), { fill: C.blue, size: 32 });
    button(this, W - 230, 650, 250, 96, '🔊 中文', () => void speech.say([{ text: '你好！我是盼盼。', lang: 'zh' }]), { fill: C.blue, size: 32 });
    if (!speech.zhVoice) {
      txt(this, col, 720, 'Install Chinese: Android Settings → Text-to-speech → Google → Install voice data → Chinese (China)', 24, '#c0392b').setOrigin(0, 0.5);
    }

    label(810, 'Progress');
    const lv = GAME_IDS.map((id) => `${GAMES[id].name.en} ${save.levels[id]}/${MAX_LEVEL}`);
    const prog = worldProgress();
    const world = prog.allDone
      ? 'all worlds done ✅'
      : `${WORLDS[prog.world].icon} ${WORLDS[prog.world].name.en}, stage ${prog.stage + 1}/${STAGES_PER_WORLD}`;
    txt(
      this,
      col,
      835,
      `⭐ ${save.stars} stars   🏆 ${save.adventuresDone} adventures   📒 ${save.stickers.owned.length}/${STICKERS.length} stickers\n` +
        `World: ${world}   Adventure length: ${pathLength()} games\n` +
        `Levels:  ${lv.slice(0, 4).join('   ')}\n           ${lv.slice(4).join('   ')}`,
      28,
      '#2b3a55',
      { align: 'left' },
    ).setOrigin(0, 0.5);

    button(this, W / 2, 985, 360, 120, '◀ Back', () => this.scene.start('Home'), { fill: C.green, size: 46 });
    holdButton(this, W - 170, 975, '🗑️', 3000, () => {
      resetProgress();
      this.scene.restart();
    }, 110, 0xffd6d6);
    txt(this, W - 170, 1050, 'hold 3s: reset progress', 22, '#c0392b');
  }

  private option(x: number, y: number, w: number, name: string, selected: boolean, set: () => void): void {
    button(this, x, y, w, 90, name, () => {
      set();
      persist();
      this.scene.restart();
    }, { fill: selected ? C.orange : C.grey, size: 32, color: selected ? '#ffffff' : '#2b3a55' });
  }
}
