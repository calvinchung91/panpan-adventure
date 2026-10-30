// Things Pan Pan says. Edit freely; add more praise lines for variety.
import { zhCount, type Bi } from '../core/lang';

export const PRAISE: Bi[] = [
  { en: 'Great job!', zh: '太棒了！' },
  { en: 'Well done!', zh: '做得好！' },
  { en: 'You did it!', zh: '你做到了！' },
  { en: 'Awesome!', zh: '真厉害！' },
  { en: 'Super!', zh: '好极了！' },
];

export const TRY_AGAIN: Bi[] = [
  { en: 'Try again!', zh: '再试一次！' },
  { en: 'Almost! Look carefully.', zh: '差一点！仔细看看。' },
  { en: 'Hmm, try another one.', zh: '嗯，换一个试试。' },
];

export const HELLO: Bi[] = [
  { en: "Hi! I'm Pan Pan!", zh: '你好！我是盼盼！' },
  { en: "Let's learn and play!", zh: '我们一起学习，一起玩！' },
  { en: 'You are my best friend!', zh: '你是我的好朋友！' },
];

export const P = {
  title: { en: "Pan Pan's Adventure", zh: '盼盼去冒险' },
  tapToPlay: { en: 'Tap to Play', zh: '点一下开始' },
  welcome: { en: "Hi! I'm Pan Pan. Let's play!", zh: '你好！我是盼盼。我们一起玩吧！' },
  todaysAdventure: { en: "Today's Adventure", zh: '今天的冒险' },
  continueAdventure: { en: 'Continue', zh: '继续冒险' },
  go: { en: 'Go!', zh: '出发！' },
  adventureStart: (n: number): Bi => ({
    en: `Let's go on today's adventure! There are ${n} games.`,
    zh: `我们开始今天的冒险吧！一共有${zhCount(n)}个游戏。`,
  }),
  letsContinue: { en: "Let's continue our adventure!", zh: '我们继续冒险吧！' },
  moreToGo: (n: number): Bi =>
    n === 1
      ? { en: 'Great! Just one more to go!', zh: '真棒！还有最后一个！' }
      : { en: `Great! ${n} more to go!`, zh: `真棒！还有${zhCount(n)}个！` },
  adventureDone: { en: 'You finished the whole adventure! Super focus!', zh: '你完成了全部冒险！你真专心！' },
  longer: { en: 'Next time, the adventure will be a little longer!', zh: '下次的冒险会更长一点哦！' },
  rest: { en: "Let's rest our eyes for a little while!", zh: '我们让眼睛休息一下吧！' },
  newSticker: { en: 'You got a new sticker!', zh: '你得到了一张新贴纸！' },
  nextStage: { en: 'You unlocked the next stage!', zh: '你解锁了下一关！' },
  stage: (n: number): Bi => ({ en: `Stage ${n}`, zh: `第${n}关` }),
  pickStage: (name: Bi): Bi => ({ en: `${name.en}! Choose a stage.`, zh: `${name.zh}！选一关吧。` }),
  stageLocked: { en: 'Finish the stage before it first!', zh: '先完成前面那一关哦！' },
  ok: { en: 'OK', zh: '好的' },
  start: { en: 'Start', zh: '开始' },
  stars: (n: number): Bi => ({
    en: n === 1 ? 'You got 1 star!' : `You got ${n} stars!`,
    zh: `你得到了${zhCount(n)}颗星星！`,
  }),
};
