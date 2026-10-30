// ─── Science content ─────────────────────────────────────────────────────
// Each list feeds one kind of question in the Science game. Add items by copying a line.
import type { Bi } from '../core/lang';

export interface Named {
  emoji: string;
  en: string;
  zh: string;
}

// Where animals live
export const HABITATS = {
  sea: { emoji: '🌊', en: 'Sea', zh: '大海', inEn: 'in the sea', inZh: '大海里' },
  farm: { emoji: '🚜', en: 'Farm', zh: '农场', inEn: 'on the farm', inZh: '农场里' },
  forest: { emoji: '🌳', en: 'Forest', zh: '森林', inEn: 'in the forest', inZh: '森林里' },
  ice: { emoji: '❄️', en: 'Ice & snow', zh: '冰天雪地', inEn: 'where it is icy and cold', inZh: '冰天雪地里' },
  desert: { emoji: '🌵', en: 'Desert', zh: '沙漠', inEn: 'in the desert', inZh: '沙漠里' },
};
export type HabitatId = keyof typeof HABITATS;

export const ANIMAL_HOMES: (Named & { home: HabitatId })[] = [
  { emoji: '🐟', en: 'fish', zh: '小鱼', home: 'sea' },
  { emoji: '🐬', en: 'dolphin', zh: '海豚', home: 'sea' },
  { emoji: '🐙', en: 'octopus', zh: '章鱼', home: 'sea' },
  { emoji: '🦀', en: 'crab', zh: '螃蟹', home: 'sea' },
  { emoji: '🐄', en: 'cow', zh: '奶牛', home: 'farm' },
  { emoji: '🐷', en: 'pig', zh: '小猪', home: 'farm' },
  { emoji: '🐔', en: 'chicken', zh: '小鸡', home: 'farm' },
  { emoji: '🐑', en: 'sheep', zh: '绵羊', home: 'farm' },
  { emoji: '🐒', en: 'monkey', zh: '猴子', home: 'forest' },
  { emoji: '🐻', en: 'bear', zh: '熊', home: 'forest' },
  { emoji: '🦉', en: 'owl', zh: '猫头鹰', home: 'forest' },
  { emoji: '🦊', en: 'fox', zh: '狐狸', home: 'forest' },
  { emoji: '🐧', en: 'penguin', zh: '企鹅', home: 'ice' },
  { emoji: '🐫', en: 'camel', zh: '骆驼', home: 'desert' },
  { emoji: '🦎', en: 'lizard', zh: '蜥蜴', home: 'desert' },
];

// Healthy food vs treats
export const HEALTHY: Named[] = [
  { emoji: '🥦', en: 'broccoli', zh: '西兰花' },
  { emoji: '🍎', en: 'apple', zh: '苹果' },
  { emoji: '🥕', en: 'carrot', zh: '胡萝卜' },
  { emoji: '🍌', en: 'banana', zh: '香蕉' },
  { emoji: '🥛', en: 'milk', zh: '牛奶' },
  { emoji: '🍇', en: 'grapes', zh: '葡萄' },
  { emoji: '🥚', en: 'eggs', zh: '鸡蛋' },
];
export const TREATS: Named[] = [
  { emoji: '🍭', en: 'lollipop', zh: '棒棒糖' },
  { emoji: '🍩', en: 'doughnut', zh: '甜甜圈' },
  { emoji: '🍟', en: 'chips', zh: '薯条' },
  { emoji: '🍬', en: 'sweets', zh: '糖果' },
  { emoji: '🥤', en: 'fizzy drink', zh: '汽水' },
  { emoji: '🍰', en: 'cake', zh: '蛋糕' },
];

// Five senses. hint = a picture of something you'd use that sense for.
export const SENSES = [
  { part: { emoji: '👀', en: 'eyes', zh: '眼睛' }, verb: 'see', zhVerb: '看', hint: '🌈' },
  { part: { emoji: '👂', en: 'ears', zh: '耳朵' }, verb: 'hear', zhVerb: '听', hint: '🎵' },
  { part: { emoji: '👃', en: 'nose', zh: '鼻子' }, verb: 'smell', zhVerb: '闻', hint: '🌸' },
  { part: { emoji: '👅', en: 'tongue', zh: '舌头' }, verb: 'taste', zhVerb: '尝', hint: '🍦' },
  { part: { emoji: '✋', en: 'hands', zh: '手' }, verb: 'touch', zhVerb: '摸', hint: '🧸' },
];

// Day and night
export const NIGHT: (Named & { say: Bi })[] = [
  { emoji: '🌙', en: 'moon', zh: '月亮', say: { en: 'The moon comes out at night!', zh: '月亮晚上出来！' } },
  { emoji: '⭐', en: 'stars', zh: '星星', say: { en: 'Stars twinkle at night!', zh: '星星晚上一闪一闪！' } },
  { emoji: '🦉', en: 'owl', zh: '猫头鹰', say: { en: 'Owls wake up at night!', zh: '猫头鹰晚上醒来！' } },
];
export const DAY: (Named & { say: Bi })[] = [
  { emoji: '☀️', en: 'sun', zh: '太阳', say: { en: 'The sun shines in the daytime!', zh: '白天太阳出来啦！' } },
  { emoji: '🌈', en: 'rainbow', zh: '彩虹', say: { en: 'We see rainbows in the daytime!', zh: '白天能看到彩虹！' } },
  { emoji: '🐓', en: 'rooster', zh: '公鸡', say: { en: 'The rooster crows in the morning!', zh: '公鸡早上喔喔叫！' } },
];

// Sink or float
export const SINK_FLOAT: (Named & { floats: boolean })[] = [
  { emoji: '🦆', en: 'rubber duck', zh: '小鸭子', floats: true },
  { emoji: '🍃', en: 'leaf', zh: '叶子', floats: true },
  { emoji: '⚽', en: 'ball', zh: '球', floats: true },
  { emoji: '🎈', en: 'balloon', zh: '气球', floats: true },
  { emoji: '🍎', en: 'apple', zh: '苹果', floats: true },
  { emoji: '🔑', en: 'key', zh: '钥匙', floats: false },
  { emoji: '⚓', en: 'anchor', zh: '锚', floats: false },
  { emoji: '🥄', en: 'spoon', zh: '勺子', floats: false },
  { emoji: '🔨', en: 'hammer', zh: '锤子', floats: false },
];

// Weather and what we need. a = English with "a/an" for sentences.
export const WEATHER = [
  {
    emoji: '☀️', en: 'sunny and hot', zh: '晴天，很热', when: '天热的时候',
    items: [
      { emoji: '🩳', en: 'shorts', a: 'shorts', zh: '短裤' },
      { emoji: '🕶️', en: 'sunglasses', a: 'sunglasses', zh: '太阳镜' },
      { emoji: '👒', en: 'sun hat', a: 'a sun hat', zh: '遮阳帽' },
    ],
  },
  {
    emoji: '🌧️', en: 'rainy', zh: '下雨了', when: '下雨的时候',
    items: [
      { emoji: '☂️', en: 'umbrella', a: 'an umbrella', zh: '雨伞' },
      { emoji: '🥾', en: 'boots', a: 'boots', zh: '雨靴' },
    ],
  },
  {
    emoji: '❄️', en: 'snowy and cold', zh: '下雪了，很冷', when: '天冷的时候',
    items: [
      { emoji: '🧥', en: 'coat', a: 'a coat', zh: '外套' },
      { emoji: '🧣', en: 'scarf', a: 'a scarf', zh: '围巾' },
      { emoji: '🧤', en: 'gloves', a: 'gloves', zh: '手套' },
    ],
  },
];

// Life cycles, in growing order
export const LIFE_CYCLES: Named[][] = [
  [
    { emoji: '🥚', en: 'egg', zh: '鸡蛋' },
    { emoji: '🐣', en: 'chick', zh: '小鸡' },
    { emoji: '🐔', en: 'hen', zh: '母鸡' },
  ],
  [
    { emoji: '🌱', en: 'sprout', zh: '小芽' },
    { emoji: '🌿', en: 'young plant', zh: '小苗' },
    { emoji: '🌻', en: 'sunflower', zh: '向日葵' },
  ],
  [
    { emoji: '🐛', en: 'caterpillar', zh: '毛毛虫' },
    { emoji: '🦋', en: 'butterfly', zh: '蝴蝶' },
  ],
  [
    { emoji: '👶', en: 'baby', zh: '宝宝' },
    { emoji: '🧒', en: 'child', zh: '小朋友' },
    { emoji: '🧑', en: 'grown-up', zh: '大人' },
    { emoji: '🧓', en: 'grandparent', zh: '老人' },
  ],
];

// Animal sounds
export const ANIMAL_SOUNDS: (Named & { soundEn: string; soundZh: string })[] = [
  { emoji: '🐄', en: 'cow', zh: '奶牛', soundEn: 'Moo', soundZh: '哞哞' },
  { emoji: '🐶', en: 'dog', zh: '小狗', soundEn: 'Woof woof', soundZh: '汪汪' },
  { emoji: '🐱', en: 'cat', zh: '小猫', soundEn: 'Meow', soundZh: '喵喵' },
  { emoji: '🦆', en: 'duck', zh: '鸭子', soundEn: 'Quack quack', soundZh: '嘎嘎' },
  { emoji: '🐑', en: 'sheep', zh: '绵羊', soundEn: 'Baa', soundZh: '咩咩' },
  { emoji: '🐷', en: 'pig', zh: '小猪', soundEn: 'Oink oink', soundZh: '哼哼' },
  { emoji: '🐓', en: 'rooster', zh: '公鸡', soundEn: 'Cock-a-doodle-doo', soundZh: '喔喔喔' },
  { emoji: '🐸', en: 'frog', zh: '青蛙', soundEn: 'Ribbit', soundZh: '呱呱' },
  { emoji: '🦁', en: 'lion', zh: '狮子', soundEn: 'Roar', soundZh: '嗷呜' },
];

// Seasons
export const SEASONS = {
  spring: { emoji: '🌷', en: 'Spring', zh: '春天' },
  summer: { emoji: '🌞', en: 'Summer', zh: '夏天' },
  autumn: { emoji: '🍁', en: 'Autumn', zh: '秋天' },
  winter: { emoji: '❄️', en: 'Winter', zh: '冬天' },
};
export type SeasonId = keyof typeof SEASONS;

export const SEASON_THINGS: { emoji: string; q: Bi; season: SeasonId }[] = [
  { emoji: '⛄', q: { en: 'When do we build a snowman?', zh: '什么时候可以堆雪人？' }, season: 'winter' },
  { emoji: '🌸', q: { en: 'When do flowers start to bloom?', zh: '花儿什么时候开始开？' }, season: 'spring' },
  { emoji: '🍂', q: { en: 'When do leaves turn brown and fall?', zh: '树叶什么时候变黄掉下来？' }, season: 'autumn' },
  { emoji: '🏖️', q: { en: 'When do we swim at the beach?', zh: '什么时候去海边游泳？' }, season: 'summer' },
  { emoji: '🍉', q: { en: 'When do we eat lots of watermelon?', zh: '什么时候吃很多西瓜？' }, season: 'summer' },
  { emoji: '🧣', q: { en: 'When do we wear a warm scarf?', zh: '什么时候要戴暖和的围巾？' }, season: 'winter' },
  { emoji: '🐣', q: { en: 'When are lots of baby animals born?', zh: '很多小动物在什么时候出生？' }, season: 'spring' },
  { emoji: '🎃', q: { en: 'When do we pick pumpkins?', zh: '什么时候收南瓜？' }, season: 'autumn' },
];
