// 🔬 Science
// Picture questions about the world: where animals live, healthy food, the five senses,
// day and night, sink or float, weather and clothes, and life cycles.
import { BaseGame } from '../core/BaseGame';
import { line } from '../core/lang';
import { pickOne } from '../core/rand';
import { popIn, tapCard, txt, type TapCard } from '../core/ui';
import { makeQuestion, type QType, type Question } from '../data/scienceQuestions';

const LEVELS: Record<number, { types: QType[]; choices: number }> = {
  1: { types: ['habitat', 'healthy'], choices: 2 },
  2: { types: ['habitat', 'healthy', 'senses', 'daynight'], choices: 3 },
  3: { types: ['habitat', 'senses', 'sinkfloat', 'weather', 'healthy'], choices: 3 },
  4: { types: ['sinkfloat', 'weather', 'life', 'senses', 'unhealthy'], choices: 3 },
  5: { types: ['habitat', 'senses', 'daynight', 'sinkfloat', 'weather', 'life', 'unhealthy'], choices: 4 },
  6: { types: ['sounds', 'habitat', 'life', 'weather', 'sinkfloat'], choices: 4 },
  7: { types: ['seasons', 'sounds', 'life', 'unhealthy', 'weather'], choices: 4 },
  8: { types: ['seasons', 'sounds', 'habitat', 'senses', 'daynight', 'sinkfloat', 'weather', 'life', 'unhealthy'], choices: 4 },
};

export class ScienceScene extends BaseGame {
  readonly gameId = 'science' as const;
  private lastPicture = '';

  constructor() {
    super('Science');
  }

  create(): void {
    this.lastPicture = '';
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe8f8ec).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const cfg = LEVELS[this.level];
    let q: Question;
    do q = makeQuestion(pickOne(cfg.types), cfg.choices);
    while (q.picture === this.lastPicture);
    this.lastPicture = q.picture;

    const W = this.scale.width;
    const lang = this.lang;
    this.layer!.add(txt(this, W / 2, 175, q.prompt[lang], 48));
    const pic = tapCard(this, W / 2, 400, 900, 320, null, { radius: 50 });
    pic.add(txt(this, 0, 0, q.picture, q.picture.includes('\n') ? 100 : q.picture.includes('➜') ? 110 : 190));
    this.layer!.add(pic);
    popIn(this, pic);

    const cards: TapCard[] = [];
    const { xs, w } = this.answerRow(q.choices.length, 290, 810, 300);
    q.choices.forEach((ch, i) => {
      const submit = () => void this.handleAnswer(c, i === q.answer, cards[q.answer], [line(q.explain, lang)]);
      const c = tapCard(this, xs[i], 810, w, 300, () => this.chooseAnswer(c, [line(ch.label, lang)], submit), {
        radius: 44,
      });
      c.add(txt(this, 0, -35, ch.emoji, 140));
      c.add(txt(this, 0, 100, ch.label[lang], 36));
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 150 + i * 100);
    });
    void this.setPrompt([line(q.prompt, lang)]);
  }
}
