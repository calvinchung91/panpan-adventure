// 💛 Kindness stories (Moral)
// A short story is told with a picture, then he chooses what to do. The kind choice shows a happy
// outcome; the unkind one explains gently how someone would feel, and he tries again.
// From level 3, "How do they feel?" questions (recognising emotions) are mixed in.
import { BaseGame } from '../core/BaseGame';
import { line, type Bi } from '../core/lang';
import { pickOne, shuffle } from '../core/rand';
import { popIn, tapCard, txt, type TapCard } from '../core/ui';
import { FEELINGS, FEELING_SCENES, STORIES, STORY_QUESTION, type FeelingId, type Story } from '../data/stories';

// tasks = stories per round; faces = number of feeling choices (0 = no feeling questions yet)
const LEVELS: Record<number, { tasks: number; faces: number }> = {
  1: { tasks: 3, faces: 0 },
  2: { tasks: 3, faces: 0 },
  3: { tasks: 3, faces: 2 },
  4: { tasks: 4, faces: 3 },
  5: { tasks: 4, faces: 3 },
  6: { tasks: 4, faces: 4 },
  7: { tasks: 5, faces: 4 },
  8: { tasks: 5, faces: 5 },
};

const FEEL_QUESTION: Bi = { en: 'How do they feel?', zh: '这时候心情怎么样？' };

export class MoralScene extends BaseGame {
  readonly gameId = 'moral' as const;
  private used = new Set<object>();

  constructor() {
    super('Moral');
  }

  create(): void {
    this.tasksTotal = LEVELS[this.level].tasks; // stories are longer, so fewer per round
    this.used = new Set();
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xfff0f5).setOrigin(0).setDepth(-10);
    this.header();
    this.startTask();
  }

  protected buildTask(): void {
    const faces = LEVELS[this.level].faces;
    if (faces > 0 && this.taskIndex % 2 === 1) this.feelingTask(faces);
    else this.storyTask();
  }

  private storyCard(scene: string, text: Bi): void {
    const W = this.scale.width;
    const cw = Math.min(W - 240, 1500);
    const card = tapCard(this, W / 2, 380, cw, 400, null, { radius: 50 });
    card.add(txt(this, 0, -75, scene, 150));
    card.add(txt(this, 0, 115, text[this.lang], 44, undefined, { wordWrap: { width: cw - 100 } }));
    this.layer!.add(card);
    popIn(this, card);
  }

  private storyTask(): void {
    let pool = STORIES.filter((s) => !this.used.has(s));
    if (!pool.length) pool = STORIES;
    const story: Story = pickOne(pool);
    this.used.add(story);
    const W = this.scale.width;
    const lang = this.lang;
    this.storyCard(story.scene, story.text);
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

  private feelingTask(faces: number): void {
    let pool = FEELING_SCENES.filter((s) => !this.used.has(s));
    if (!pool.length) pool = FEELING_SCENES;
    const item = pickOne(pool);
    this.used.add(item);
    const W = this.scale.width;
    const lang = this.lang;
    this.storyCard(item.scene, item.text);
    this.layer!.add(txt(this, W / 2, 640, FEEL_QUESTION[lang], 48));

    const ids = Object.keys(FEELINGS) as FeelingId[];
    const options = shuffle([item.feel, ...shuffle(ids.filter((f) => f !== item.feel)).slice(0, faces - 1)]);
    const answer = FEELINGS[item.feel];
    const confirm = [line({ en: `They feel ${answer.en}.`, zh: `感到${answer.zh}。` }, lang)];
    const cards: TapCard[] = [];
    const gap = Math.min(330, (W - 200) / options.length);
    options.forEach((f, i) => {
      const fe = FEELINGS[f];
      const c = tapCard(this, W / 2 + (i - (options.length - 1) / 2) * gap, 860, gap - 30, 280, () =>
        void this.handleAnswer(c, f === item.feel, cards[options.indexOf(item.feel)], confirm), { radius: 44 });
      c.add(txt(this, 0, -40, fe.emoji, 120));
      c.add(txt(this, 0, 90, fe[lang], 38));
      cards.push(c);
      this.layer!.add(c);
      popIn(this, c, 300 + i * 100);
    });

    void this.setPrompt([line(item.text, lang), line(FEEL_QUESTION, lang)]);
  }
}
