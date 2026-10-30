// Parent corner (behind the hold-to-open gear): language, rest reminder, voice check, progress, reset.
import Phaser from 'phaser';
import { resetProgress, persist, save, pathLength, type LangMode } from '../core/save';
import { speech } from '../core/speech';
import { button, C, holdButton, txt } from '../core/ui';
import { GAMES, GAME_IDS } from '../data/games';

export class ParentScene extends Phaser.Scene {
  constructor() {
    super('Parent');
  }

  create(): void {
    const { width: W } = this.scale;
    this.add.rectangle(W / 2, 540, W, 1080, 0xf4f7fb);
    txt(this, W / 2, 75, 'Parent Corner · 家长设置', 58);
    const left = 110;
    const label = (y: number, s: string) => txt(this, left, y, s, 40).setOrigin(0, 0.5);

    label(210, 'Language');
    const langs: [LangMode, string][] = [['en', 'English'], ['zh', '中文'], ['mixed', 'Mixed 混合']];
    langs.forEach(([v, name], i) => this.option(560 + i * 290, 210, 270, name, save.settings.lang === v, () => (save.settings.lang = v)));

    label(350, 'Rest reminder');
    [0, 10, 15, 20, 30].forEach((m, i) =>
      this.option(560 + i * 200, 350, 180, m === 0 ? 'Off' : `${m} min`, save.settings.restMinutes === m, () => (save.settings.restMinutes = m)),
    );

    label(490, 'Voices');
    const en = speech.enVoice?.name ?? 'default';
    const zh = speech.zhVoice?.name ?? '⚠ none found';
    txt(this, 560, 470, `English: ${en}\nChinese: ${zh}`, 30, '#5b6b88', { align: 'left' }).setOrigin(0, 0.5);
    button(this, W - 520, 490, 260, 100, '🔊 English', () => void speech.say([{ text: 'Hello! I am Pan Pan.', lang: 'en' }]), { fill: C.blue, size: 34 });
    button(this, W - 230, 490, 260, 100, '🔊 中文', () => void speech.say([{ text: '你好！我是盼盼。', lang: 'zh' }]), { fill: C.blue, size: 34 });
    if (!speech.zhVoice) {
      txt(this, 560, 560, 'Install Chinese: Android Settings → Text-to-speech → Google → Install voice data → Chinese (China)', 26, '#c0392b').setOrigin(0, 0.5);
    }

    label(660, 'Progress');
    const lv = GAME_IDS.map((id) => `${GAMES[id].name.en} level ${save.levels[id]}/5`).join('    ');
    txt(
      this,
      560,
      690,
      `⭐ ${save.stars} stars    🏆 ${save.adventuresDone} adventures    Adventure length: ${pathLength()} games\n${lv}`,
      32,
      '#2b3a55',
      { align: 'left' },
    ).setOrigin(0, 0.5);

    button(this, W / 2, 940, 380, 140, '◀ Back', () => this.scene.start('Home'), { fill: C.green, size: 50 });
    holdButton(this, W - 170, 940, '🗑️', 3000, () => {
      resetProgress();
      this.scene.restart();
    }, 120, 0xffd6d6);
    txt(this, W - 170, 1030, 'hold 3s: reset progress', 22, '#c0392b');
  }

  private option(x: number, y: number, w: number, name: string, selected: boolean, set: () => void): void {
    button(this, x, y, w, 100, name, () => {
      set();
      persist();
      this.scene.restart();
    }, { fill: selected ? C.orange : C.grey, size: 36, color: selected ? '#ffffff' : '#2b3a55' });
  }
}
