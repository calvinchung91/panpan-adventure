// 💛 Kindness stories (Moral)
// A short story is told with a picture, then he chooses what to do. The kind choice shows a happy
// outcome; the unkind one explains gently how someone would feel, and he tries again.
import { BaseGame } from '../core/BaseGame';
import { line } from '../core/lang';
import { pickOne, shuffle } from '../core/rand';
import { popIn, tapCard, txt, type TapCard } from '../core/ui';
import { STORIES, STORY_QUESTION, type Story } from '../data/stories';

export class MoralScene extends BaseGame {
  readonly gameId = 'moral' as const;
  private used = new Set<Story>();

  constructor() {
    super('Moral');
  }

  create(): void {
    this.tasksTotal = 3; // stories are longer, so 3 per round
    this.used = new Set();
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff0f5).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const story = pickOne(STORIES.filter((s) => !this.used.has(s)));
    this.used.add(story);
    const W = this.scale.width;
    const lang = this.lang;

    const cw = Math.min(W - 240, 1500);
    const card = tapCard(this, W / 2, 380, cw, 400, null, { radius: 50 });
    card.add(txt(this, 0, -75, story.scene, 150));
    card.add(txt(this, 0, 115, story.text[lang], 44, undefined, { wordWrap: { width: cw - 100 } }));
    this.layer!.add(card);
    popIn(this, card);
    this.layer!.add(txt(this, W / 2, 640, STORY_QUESTION[lang], 48));

    const options = shuffle([story.good, story.bad]);
    const cards: TapCard[] = [];
    options.forEach((o, i) => {
      const kind = o === story.good;
      const c = tapCard(this, W / 2 + (i === 0 ? -370 : 370), 860, 660, 280, () =>
        void this.handleAnswer(c, kind, cards[options.indexOf(story.good)], [line(story.goodOut, lang)], [line(story.badOut, lang)]), {
        radius: 44,
      });
      c.add(txt(this, 0, -50, o.emoji, 110));
      c.add(txt(this, 0, 80, o[lang], 38, undefined, { wordWrap: { width: 600 } }));
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 300 + i * 120);
    });

    void this.setPrompt([line(story.text, lang), line(STORY_QUESTION, lang)]);
  }
}
