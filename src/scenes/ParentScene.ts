// Parent corner (behind the hold-to-open gear): language, rest reminder, which games appear in
// Today's Adventure, background music, voice check, progress, reset.
import Phaser from 'phaser';
import { isEnabled, pathLength, persist, resetProgress, save, type LangMode } from '../core/save';
import { music } from '../core/music';
import { speech } from '../core/speech';
import { button, C, holdButton, txt } from '../core/ui';
import { GAMES, GAME_IDS } from '../data/games';
import { STICKERS } from '../data/stickers';
import { STAGES_PER_WORLD, WORLDS, worldStages } from '../data/worlds';
import { STAGES } from '../core/stageMath';

export class ParentScene extends Phaser.Scene {
  constructor() {
    super('Parent');
  }

  create(): void {
    const { width: W } = this.scale;
    music.play('playful');
    this.add.rectangle(W / 2, 540, W, 1080, 0xf4f7fb);
    txt(this, W / 2, 65, 'Parent Corner · 家长设置', 54);
    const left = 100;
    const col = 520;
    const label = (y: number, s: string) => txt(this, left, y, s, 38).setOrigin(0, 0.5);

    label(155, 'Language');
    const langs: [LangMode, string][] = [['en', 'English'], ['zh', '中文'], ['mixed', 'Mixed 混合']];
    langs.forEach(([v, name], i) => this.option(col + 130 + i * 280, 155, 260, name, save.settings.lang === v, () => (save.settings.lang = v)));

    label(255, 'Rest reminder');
    [0, 10, 15, 20, 30].forEach((m, i) =>
      this.option(col + 90 + i * 200, 255, 180, m === 0 ? 'Off' : `${m} min`, save.settings.restMinutes === m, () => (save.settings.restMinutes = m)),
    );

    label(355, 'Music');
    ['Off', 'Low', 'Medium', 'High'].forEach((name, i) =>
      this.option(col + 90 + i * 200, 355, 180, name, save.settings.music === i, () => {
        save.settings.music = i;
        music.applyVolume();
      }),
    );

    label(510, 'In adventure');
    txt(this, left, 552, 'tap to switch games on/off', 24, '#5b6b88').setOrigin(0, 0.5);
    GAME_IDS.forEach((id, i) => {
      const on = isEnabled(id);
      const g = GAMES[id];
      this.option(col + 130 + (i % 4) * 280, 465 + Math.floor(i / 4) * 100, 260, `${g.icon} ${g.name.en}`, on, () => {
        const others = GAME_IDS.filter((o) => o !== id && isEnabled(o));
        if (on && others.length === 0) return; // keep at least one game
        save.settings.enabled[id] = !on;
        save.currentPath = null; // rebuild the adventure with the new choice
      });
    });

    label(690, 'Voices');
    const en = speech.enVoice?.name ?? 'default';
    const zh = speech.zhVoice?.name ?? '⚠ none found';
    const pack = speech.hasPack ? 'Voice pack: installed ✅ (recorded voices)' : 'Voice pack: not installed (phone voice)';
    txt(this, col, 690, `${pack}\nPhone voices: ${en} / ${zh}`, 28, '#5b6b88', { align: 'left' }).setOrigin(0, 0.5);
    button(this, W - 500, 690, 250, 90, '🔊 English', () => void speech.say([{ text: 'Hello! I am Pan Pan.', lang: 'en' }]), { fill: C.blue, size: 32 });
    button(this, W - 230, 690, 250, 90, '🔊 中文', () => void speech.say([{ text: '你好！我是盼盼。', lang: 'zh' }]), { fill: C.blue, size: 32 });
    if (!speech.zhVoice && !speech.hasPack) {
      txt(this, col, 752, 'Install Chinese: Android Settings → Text-to-speech → Google → Install voice data → Chinese (China)', 24, '#c0392b').setOrigin(0, 0.5);
    }

    label(860, 'Progress');
    const lv = GAME_IDS.map((id) => `${GAMES[id].name.en} ${save.stages[id].unlocked}/${STAGES}`);
    const world = worldStages().map((n, i) => `${WORLDS[i].icon}${n}/${STAGES_PER_WORLD}`).join(' ');
    txt(
      this,
      col,
      862,
      `⭐ ${save.stars} stars   🏆 ${save.adventuresDone} adventures   📒 ${save.stickers.owned.length}/${STICKERS.length} stickers\n` +
        `Worlds: ${world}   Adventure length: ${pathLength()} games\n` +
        `Stages:  ${lv.slice(0, 4).join('   ')}\n           ${lv.slice(4).join('   ')}`,
      28,
      '#2b3a55',
      { align: 'left' },
    ).setOrigin(0, 0.5);

    button(this, W / 2, 1005, 340, 100, '◀ Back', () => this.scene.start('Home'), { fill: C.green, size: 46 });
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
