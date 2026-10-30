// 🔤 Word ↔ Picture (English & Chinese reading)
// Low levels: see + hear a word, find its picture. Higher levels: read the word without hearing it,
// then see a picture and pick the right written word. Chinese always shows pinyin above.
import { BaseGame } from '../core/BaseGame';
import { line, type Bi, type Lang } from '../core/lang';
import { pickOne, shuffle } from '../core/rand';
import { save } from '../core/save';
import type { Line } from '../core/speech';
import { button, C, popIn, tapCard, txt, type TapCard } from '../core/ui';
import { S } from '../data/sentences';
import { difficulty, WORDS, type Word } from '../data/words';

// mode A = word → pick picture, mode B = picture → pick word
// similar = wrong choices look alike (same first letter, or share a Chinese character), so he must read carefully
const LEVELS: Record<number, { mode: 'A' | 'B'; choices: number; speak: boolean; maxDiff: number; similar?: boolean }> = {
  1: { mode: 'A', choices: 2, speak: true, maxDiff: 1 },
  2: { mode: 'A', choices: 3, speak: true, maxDiff: 2 },
  3: { mode: 'A', choices: 3, speak: false, maxDiff: 3 },
  4: { mode: 'B', choices: 3, speak: false, maxDiff: 2 },
  5: { mode: 'B', choices: 4, speak: false, maxDiff: 3 },
  6: { mode: 'A', choices: 4, speak: false, maxDiff: 3, similar: true },
  7: { mode: 'B', choices: 4, speak: false, maxDiff: 3, similar: true },
  8: { mode: 'B', choices: 5, speak: false, maxDiff: 3, similar: true },
};

function looksAlike(a: Word, b: Word, lang: Lang): boolean {
  return lang === 'en' ? a.en[0] === b.en[0] : [...b.zh].some((ch) => a.zh.includes(ch));
}

export class WordScene extends BaseGame {
  readonly gameId = 'word' as const;
  private used = new Set<Word>();

  constructor() {
    super('Word');
  }

  create(): void {
    this.used = new Set();
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xeaf6ff).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const cfg = LEVELS[this.level];
    const lang = this.lang;
    let pool = WORDS.filter((w) => difficulty(w, lang) <= cfg.maxDiff && !this.used.has(w));
    if (pool.length < cfg.choices) pool = WORDS.filter((w) => difficulty(w, lang) <= cfg.maxDiff);
    const target = pickOne(pool);
    this.used.add(target);
    let others = shuffle(WORDS.filter((w) => w !== target && w[lang] !== target[lang] && difficulty(w, lang) <= cfg.maxDiff + 1));
    if (cfg.similar) others = [...others.filter((w) => looksAlike(target, w, lang)), ...others.filter((w) => !looksAlike(target, w, lang))];
    const options = shuffle([target, ...others.slice(0, cfg.choices - 1)]);

    // After a correct answer: say the word; in mixed mode also say it in the other language.
    const confirm: Line[] = [line(target, lang)];
    if (save.settings.lang === 'mixed') confirm.push(line(target, lang === 'en' ? 'zh' : 'en'));

    if (cfg.mode === 'A') this.wordToPicture(target, options, cfg.speak, confirm);
    else this.pictureToWord(target, options, confirm);
  }

  /** The word itself, with pinyin above when Chinese. */
  private wordBlock(w: Word, lang: Lang, size: number) {
    const parts = [];
    if (lang === 'zh') {
      parts.push(txt(this, 0, -size * 0.66, w.py, Math.round(size * 0.46), '#8e4ff0'));
      parts.push(txt(this, 0, size * 0.22, w.zh, size));
    } else {
      parts.push(txt(this, 0, 0, w.en, size));
    }
    return parts;
  }

  private wordToPicture(target: Word, options: Word[], speak: boolean, confirm: Line[]): void {
    const W = this.scale.width;
    const lang = this.lang;
    const card = tapCard(this, W / 2, 370, 760, 280, null, { radius: 50 });
    card.add(this.wordBlock(target, lang, lang === 'zh' ? 120 : 110));
    this.layer!.add(card);
    popIn(this, card);

    if (!speak) {
      // reading mode: the word isn't spoken, but he can tap 🔊 to hear it if stuck
      const help = button(this, W / 2 + 470, 370, 130, 130, '🔊', () => void this.say([line(target, lang)]), { fill: C.purple, size: 54 });
      this.layer!.add(help);
    }

    const size = options.length === 2 ? 340 : 300;
    const gap = size + 70;
    const cards: TapCard[] = [];
    options.forEach((w, i) => {
      const x = W / 2 + (i - (options.length - 1) / 2) * gap;
      const c = tapCard(this, x, 790, size, size, () => void this.handleAnswer(c, w === target, cards[options.indexOf(target)], confirm), {
        radius: 44,
      });
      c.add(txt(this, 0, 0, w.emoji, Math.round(size * 0.6)));
      this.addSpeaker(c, size, size, [line(w, lang)]); // 🔊 says what this picture is
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 150 + i * 100);
    });

    this.showPrompt(
      speak
        ? S.findWord(target)
        : { en: 'Read the word. Which picture is it?', zh: '读一读，是哪一个？' },
    );
  }

  private pictureToWord(target: Word, options: Word[], confirm: Line[]): void {
    const W = this.scale.width;
    const lang = this.lang;
    const pic = tapCard(this, W * 0.3, 620, 520, 520, null, { radius: 60 });
    pic.add(txt(this, 0, 0, target.emoji, 320));
    this.layer!.add(pic);
    popIn(this, pic);

    const n = options.length;
    const h = n === 3 ? 220 : n === 4 ? 175 : 140;
    const gap = h + (n === 5 ? 20 : 30);
    const cards: TapCard[] = [];
    options.forEach((w, i) => {
      const y = 620 + (i - (n - 1) / 2) * gap;
      const c = tapCard(this, W * 0.7, y, 680, h, () => void this.handleAnswer(c, w === target, cards[options.indexOf(target)], confirm), {
        radius: 40,
      });
      c.add(this.wordBlock(w, lang, Math.round(h * 0.42)));
      this.addSpeaker(c, 680, h, [line(w, lang)]); // 🔊 reads this word aloud
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 150 + i * 100);
    });

    this.showPrompt({ en: 'What is this? Find the right word.', zh: '这是什么？找出正确的词。' });
  }

  private showPrompt(bi: Bi): void {
    this.layer!.add(txt(this, this.scale.width / 2, 175, bi[this.lang], 46));
    void this.setPrompt([line(bi, this.lang)]);
  }
}
