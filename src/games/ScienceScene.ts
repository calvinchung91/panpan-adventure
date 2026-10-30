// 🔬 Science
// Picture questions about the world: where animals live, healthy food, the five senses,
// day and night, sink or float, weather and clothes, and life cycles.
import { BaseGame } from '../core/BaseGame';
import { line, type Bi } from '../core/lang';
import { pickOne, randInt, shuffle } from '../core/rand';
import { popIn, tapCard, txt, type TapCard } from '../core/ui';
import {
  ANIMAL_HOMES, DAY, HABITATS, HEALTHY, LIFE_CYCLES, NIGHT, SENSES, SINK_FLOAT, TREATS, WEATHER, type Named,
} from '../data/science';

type QType = 'habitat' | 'healthy' | 'unhealthy' | 'senses' | 'daynight' | 'sinkfloat' | 'weather' | 'life';

const LEVELS: Record<number, { types: QType[]; choices: number }> = {
  1: { types: ['habitat', 'healthy'], choices: 2 },
  2: { types: ['habitat', 'healthy', 'senses', 'daynight'], choices: 3 },
  3: { types: ['habitat', 'senses', 'sinkfloat', 'weather', 'healthy'], choices: 3 },
  4: { types: ['sinkfloat', 'weather', 'life', 'senses', 'unhealthy'], choices: 3 },
  5: { types: ['habitat', 'senses', 'daynight', 'sinkfloat', 'weather', 'life', 'unhealthy'], choices: 4 },
};

interface Choice {
  emoji: string;
  label: Bi;
}

interface Question {
  prompt: Bi;
  picture: string;
  choices: Choice[];
  answer: number;
  explain: Bi;
}

const named = (n: Named): Choice => ({ emoji: n.emoji, label: { en: n.en, zh: n.zh } });

/** Puts the correct choice among n-1 wrong ones (shuffled unless keepOrder). */
function quiz(prompt: Bi, picture: string, correct: Choice, wrongs: Choice[], n: number, explain: Bi, keepOrder = false): Question {
  const choices = keepOrder ? [correct, ...wrongs] : shuffle([correct, ...shuffle(wrongs).slice(0, n - 1)]);
  return { prompt, picture, choices, answer: choices.indexOf(correct), explain };
}

function makeQuestion(type: QType, n: number): Question {
  switch (type) {
    case 'habitat': {
      const a = pickOne(ANIMAL_HOMES);
      const h = HABITATS[a.home];
      const others = Object.entries(HABITATS).filter(([id]) => id !== a.home).map(([, o]) => named(o));
      return quiz(
        { en: `Where does the ${a.en} live?`, zh: `${a.zh}住在哪里？` },
        a.emoji, named(h), others, n,
        { en: `The ${a.en} lives ${h.inEn}!`, zh: `${a.zh}住在${h.inZh}！` },
      );
    }
    case 'healthy': {
      const h = pickOne(HEALTHY);
      return quiz(
        { en: 'Which food is healthy?', zh: '哪个食物是健康的？' },
        '🍽️', named(h), TREATS.map(named), n,
        { en: `${h.en[0].toUpperCase()}${h.en.slice(1)} helps you grow big and strong!`, zh: `${h.zh}让我们长得又高又壮！` },
      );
    }
    case 'unhealthy': {
      const t = pickOne(TREATS);
      return quiz(
        { en: 'Which one should we NOT eat too much?', zh: '哪个不能吃太多？' },
        '🍽️', named(t), HEALTHY.map(named), n,
        { en: `Too much ${t.en} is bad for our teeth.`, zh: `${t.zh}吃太多对牙齿不好。` },
      );
    }
    case 'senses': {
      const s = pickOne(SENSES);
      return quiz(
        { en: `What do we use to ${s.verb}?`, zh: `我们用什么${s.zhVerb}？` },
        s.hint, named(s.part), SENSES.filter((o) => o !== s).map((o) => named(o.part)), n,
        { en: `We ${s.verb} with our ${s.part.en}!`, zh: `我们用${s.part.zh}${s.zhVerb}！` },
      );
    }
    case 'daynight': {
      const night = Math.random() < 0.5;
      const item = pickOne(night ? NIGHT : DAY);
      return quiz(
        night ? { en: 'What do we see at night?', zh: '晚上能看到什么？' } : { en: 'What do we see in the daytime?', zh: '白天能看到什么？' },
        night ? '🌃' : '🏞️', named(item), (night ? DAY : NIGHT).map(named), n, item.say,
      );
    }
    case 'sinkfloat': {
      const it = pickOne(SINK_FLOAT);
      const float: Choice = { emoji: '⬆️', label: { en: 'Float', zh: '浮起来' } };
      const sink: Choice = { emoji: '⬇️', label: { en: 'Sink', zh: '沉下去' } };
      const q = quiz(
        { en: `Will the ${it.en} float or sink?`, zh: `${it.zh}会浮起来还是沉下去？` },
        `${it.emoji}\n🌊🌊🌊`, it.floats ? float : sink, [it.floats ? sink : float], 2,
        it.floats
          ? { en: `The ${it.en} is light, so it floats!`, zh: `${it.zh}很轻，所以会浮起来！` }
          : { en: `The ${it.en} is heavy, so it sinks!`, zh: `${it.zh}很重，所以会沉下去！` },
        true,
      );
      // always show Float on the left, Sink on the right
      if (q.choices[0] === sink) q.choices.reverse();
      q.answer = q.choices.indexOf(it.floats ? float : sink);
      return q;
    }
    case 'weather': {
      const w = pickOne(WEATHER);
      const item = pickOne(w.items);
      const others = WEATHER.filter((o) => o !== w).flatMap((o) => o.items);
      return quiz(
        { en: `It is ${w.en}. What do we need?`, zh: `${w.zh}，我们需要什么？` },
        w.emoji, named(item), others.map(named), n,
        { en: `We need ${item.a} when it is ${w.en}!`, zh: `${w.when}，我们需要${item.zh}！` },
      );
    }
    case 'life': {
      const cycle = pickOne(LIFE_CYCLES);
      const p = randInt(1, cycle.length - 1);
      const ans = cycle[p];
      const prev = cycle[p - 1];
      const wrongs = [...cycle.slice(0, p), ...LIFE_CYCLES.filter((c) => c !== cycle).map((c) => pickOne(c))];
      return quiz(
        { en: 'What comes next?', zh: '接下来是什么？' },
        [...cycle.slice(0, p).map((c) => c.emoji), '❓'].join(' ➜ '), named(ans), wrongs.map(named), n,
        { en: `The ${prev.en} grows into a ${ans.en}!`, zh: `${prev.zh}长大变成了${ans.zh}！` },
      );
    }
  }
}

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
    const gap = 330;
    q.choices.forEach((ch, i) => {
      const x = W / 2 + (i - (q.choices.length - 1) / 2) * gap;
      const c = tapCard(this, x, 810, 290, 300, () => void this.handleAnswer(c, i === q.answer, cards[q.answer], [line(q.explain, lang)]), {
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
