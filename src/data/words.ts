// ─── Word list for the Word ↔ Picture game ───────────────────────────────
// To add a word, copy a line and change it. Difficulty is worked out automatically:
//   English: 3 letters or fewer = easy, 4–5 = medium, longer = hard
//   Chinese: 1 character = easy, 2 = medium, 3+ = hard
// emoji = the picture, en = English, zh = Simplified Chinese, py = pinyin with tone marks.
import type { Lang } from '../core/lang';

export interface Word {
  emoji: string;
  en: string;
  zh: string;
  py: string;
}

export const WORDS: Word[] = [
  // food
  { emoji: '🍎', en: 'apple', zh: '苹果', py: 'píng guǒ' },
  { emoji: '🍌', en: 'banana', zh: '香蕉', py: 'xiāng jiāo' },
  { emoji: '🍇', en: 'grapes', zh: '葡萄', py: 'pú tao' },
  { emoji: '🍓', en: 'strawberry', zh: '草莓', py: 'cǎo méi' },
  { emoji: '🍉', en: 'watermelon', zh: '西瓜', py: 'xī guā' },
  { emoji: '🥕', en: 'carrot', zh: '胡萝卜', py: 'hú luó bo' },
  { emoji: '🍞', en: 'bread', zh: '面包', py: 'miàn bāo' },
  { emoji: '🥚', en: 'egg', zh: '鸡蛋', py: 'jī dàn' },
  { emoji: '🥛', en: 'milk', zh: '牛奶', py: 'niú nǎi' },
  { emoji: '🍚', en: 'rice', zh: '米饭', py: 'mǐ fàn' },
  // animals
  { emoji: '🐱', en: 'cat', zh: '猫', py: 'māo' },
  { emoji: '🐶', en: 'dog', zh: '狗', py: 'gǒu' },
  { emoji: '🐟', en: 'fish', zh: '鱼', py: 'yú' },
  { emoji: '🐦', en: 'bird', zh: '鸟', py: 'niǎo' },
  { emoji: '🐄', en: 'cow', zh: '牛', py: 'niú' },
  { emoji: '🐷', en: 'pig', zh: '猪', py: 'zhū' },
  { emoji: '🐔', en: 'chicken', zh: '鸡', py: 'jī' },
  { emoji: '🐑', en: 'sheep', zh: '羊', py: 'yáng' },
  { emoji: '🐴', en: 'horse', zh: '马', py: 'mǎ' },
  { emoji: '🐘', en: 'elephant', zh: '大象', py: 'dà xiàng' },
  { emoji: '🐼', en: 'panda', zh: '熊猫', py: 'xióng māo' },
  { emoji: '🐒', en: 'monkey', zh: '猴子', py: 'hóu zi' },
  { emoji: '🐰', en: 'rabbit', zh: '兔子', py: 'tù zi' },
  { emoji: '🐯', en: 'tiger', zh: '老虎', py: 'lǎo hǔ' },
  { emoji: '🦁', en: 'lion', zh: '狮子', py: 'shī zi' },
  { emoji: '🦆', en: 'duck', zh: '鸭子', py: 'yā zi' },
  { emoji: '🐸', en: 'frog', zh: '青蛙', py: 'qīng wā' },
  { emoji: '🦋', en: 'butterfly', zh: '蝴蝶', py: 'hú dié' },
  // things & transport
  { emoji: '🚗', en: 'car', zh: '汽车', py: 'qì chē' },
  { emoji: '🚌', en: 'bus', zh: '公交车', py: 'gōng jiāo chē' },
  { emoji: '✈️', en: 'plane', zh: '飞机', py: 'fēi jī' },
  { emoji: '🚂', en: 'train', zh: '火车', py: 'huǒ chē' },
  { emoji: '🚲', en: 'bicycle', zh: '自行车', py: 'zì xíng chē' },
  { emoji: '⚽', en: 'ball', zh: '球', py: 'qiú' },
  { emoji: '📚', en: 'book', zh: '书', py: 'shū' },
  { emoji: '🏠', en: 'house', zh: '房子', py: 'fáng zi' },
  // nature
  { emoji: '🌳', en: 'tree', zh: '树', py: 'shù' },
  { emoji: '🌸', en: 'flower', zh: '花', py: 'huā' },
  { emoji: '☀️', en: 'sun', zh: '太阳', py: 'tài yáng' },
  { emoji: '🌙', en: 'moon', zh: '月亮', py: 'yuè liang' },
  { emoji: '⭐', en: 'star', zh: '星星', py: 'xīng xing' },
  { emoji: '☁️', en: 'cloud', zh: '云', py: 'yún' },
  { emoji: '🌧️', en: 'rain', zh: '雨', py: 'yǔ' },
  { emoji: '💧', en: 'water', zh: '水', py: 'shuǐ' },
  { emoji: '🔥', en: 'fire', zh: '火', py: 'huǒ' },
  { emoji: '⛰️', en: 'mountain', zh: '山', py: 'shān' },
  { emoji: '🌈', en: 'rainbow', zh: '彩虹', py: 'cǎi hóng' },
  // body
  { emoji: '👀', en: 'eyes', zh: '眼睛', py: 'yǎn jing' },
  { emoji: '👂', en: 'ear', zh: '耳朵', py: 'ěr duo' },
  { emoji: '👃', en: 'nose', zh: '鼻子', py: 'bí zi' },
  { emoji: '👄', en: 'mouth', zh: '嘴巴', py: 'zuǐ ba' },
  { emoji: '✋', en: 'hand', zh: '手', py: 'shǒu' },
  { emoji: '🦶', en: 'foot', zh: '脚', py: 'jiǎo' },
  // more animals
  { emoji: '🐻', en: 'bear', zh: '熊', py: 'xióng' },
  { emoji: '🐝', en: 'bee', zh: '蜜蜂', py: 'mì fēng' },
  { emoji: '🐍', en: 'snake', zh: '蛇', py: 'shé' },
  { emoji: '🐌', en: 'snail', zh: '蜗牛', py: 'wō niú' },
  { emoji: '🦈', en: 'shark', zh: '鲨鱼', py: 'shā yú' },
  { emoji: '🐳', en: 'whale', zh: '鲸鱼', py: 'jīng yú' },
  { emoji: '🦒', en: 'giraffe', zh: '长颈鹿', py: 'cháng jǐng lù' },
  { emoji: '🦓', en: 'zebra', zh: '斑马', py: 'bān mǎ' },
  { emoji: '🐊', en: 'crocodile', zh: '鳄鱼', py: 'è yú' },
  { emoji: '🐧', en: 'penguin', zh: '企鹅', py: 'qǐ é' },
  // more food
  { emoji: '🍐', en: 'pear', zh: '梨', py: 'lí' },
  { emoji: '🍑', en: 'peach', zh: '桃子', py: 'táo zi' },
  { emoji: '🍋', en: 'lemon', zh: '柠檬', py: 'níng méng' },
  { emoji: '🍊', en: 'orange', zh: '橙子', py: 'chéng zi' },
  { emoji: '🎂', en: 'cake', zh: '蛋糕', py: 'dàn gāo' },
  { emoji: '🌽', en: 'corn', zh: '玉米', py: 'yù mǐ' },
  // more things
  { emoji: '🚢', en: 'ship', zh: '轮船', py: 'lún chuán' },
  { emoji: '🚀', en: 'rocket', zh: '火箭', py: 'huǒ jiàn' },
  { emoji: '🚒', en: 'fire engine', zh: '消防车', py: 'xiāo fáng chē' },
  { emoji: '👒', en: 'hat', zh: '帽子', py: 'mào zi' },
  { emoji: '👟', en: 'shoe', zh: '鞋子', py: 'xié zi' },
  { emoji: '🧦', en: 'socks', zh: '袜子', py: 'wà zi' },
  { emoji: '🔑', en: 'key', zh: '钥匙', py: 'yào shi' },
  { emoji: '🛏️', en: 'bed', zh: '床', py: 'chuáng' },
  { emoji: '🚪', en: 'door', zh: '门', py: 'mén' },
  { emoji: '⏰', en: 'clock', zh: '闹钟', py: 'nào zhōng' },
  { emoji: '✏️', en: 'pencil', zh: '铅笔', py: 'qiān bǐ' },
  { emoji: '☂️', en: 'umbrella', zh: '雨伞', py: 'yǔ sǎn' },
];

export function difficulty(w: Word, lang: Lang): number {
  if (lang === 'en') return w.en.length <= 3 ? 1 : w.en.length <= 5 ? 2 : 3;
  const n = [...w.zh].length;
  return n === 1 ? 1 : n === 2 ? 2 : 3;
}

// ─── Things to count in the Maths game ───────────────────────────────────
// en = plural name, mw = the Chinese measure word (条鱼, 只小鸡 …)
export interface Countable {
  emoji: string;
  en: string;
  zh: string;
  mw: string;
}

export const COUNTABLES: Countable[] = [
  { emoji: '🍎', en: 'apples', zh: '苹果', mw: '个' },
  { emoji: '🍌', en: 'bananas', zh: '香蕉', mw: '根' },
  { emoji: '🍓', en: 'strawberries', zh: '草莓', mw: '颗' },
  { emoji: '🐟', en: 'fish', zh: '鱼', mw: '条' },
  { emoji: '🐥', en: 'chicks', zh: '小鸡', mw: '只' },
  { emoji: '⭐', en: 'stars', zh: '星星', mw: '颗' },
  { emoji: '🚗', en: 'cars', zh: '汽车', mw: '辆' },
  { emoji: '⚽', en: 'balls', zh: '球', mw: '个' },
  { emoji: '🌸', en: 'flowers', zh: '花', mw: '朵' },
  { emoji: '🐞', en: 'ladybugs', zh: '瓢虫', mw: '只' },
  { emoji: '🍰', en: 'cakes', zh: '蛋糕', mw: '块' },
  { emoji: '🍪', en: 'cookies', zh: '饼干', mw: '块' },
];

// ─── Focus game ("Tap only the …") ───────────────────────────────────────
export const BALLOON_COLORS = [
  { color: 0xff5a5a, en: 'red', zh: '红色' },
  { color: 0x4a90ff, en: 'blue', zh: '蓝色' },
  { color: 0xffd23f, en: 'yellow', zh: '黄色' },
  { color: 0x4cd36b, en: 'green', zh: '绿色' },
  { color: 0xa66bff, en: 'purple', zh: '紫色' },
  { color: 0xff9f40, en: 'orange', zh: '橙色' },
];

export const SEA_ANIMALS = [
  { emoji: '🐟', en: 'fish', zh: '小鱼' },
  { emoji: '🐢', en: 'turtles', zh: '乌龟' },
  { emoji: '🦀', en: 'crabs', zh: '螃蟹' },
  { emoji: '🐙', en: 'octopuses', zh: '章鱼' },
  { emoji: '🐬', en: 'dolphins', zh: '海豚' },
];
