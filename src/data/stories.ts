// ─── Kindness (moral) stories ────────────────────────────────────────────
// scene = emoji picture of the story; good/bad = the two choices;
// goodOut = what happens after the kind choice; badOut = gentle nudge after the unkind one.
import type { Bi } from '../core/lang';

export interface Story {
  scene: string;
  text: Bi;
  good: { emoji: string } & Bi;
  bad: { emoji: string } & Bi;
  goodOut: Bi;
  badOut: Bi;
}

export const STORY_QUESTION: Bi = { en: 'What should you do?', zh: '你应该怎么做？' };

export const STORIES: Story[] = [
  {
    scene: '🧒🚗   👧🥺',
    text: { en: 'You are playing with your toy car. Your friend wants to play too.', zh: '你在玩玩具车。你的好朋友也想玩。' },
    good: { emoji: '🤝', en: 'Share the toy', zh: '和朋友一起玩' },
    bad: { emoji: '🙅', en: 'Keep it all for me', zh: '自己一个人玩' },
    goodOut: { en: 'Sharing is caring! Now you both have fun.', zh: '分享真快乐！你们都玩得很开心。' },
    badOut: { en: 'Oh no, your friend feels sad. Try again!', zh: '哎呀，朋友很难过。再想一想！' },
  },
  {
    scene: '👦💥😭',
    text: { en: 'Your friend falls down and starts to cry.', zh: '你的朋友摔倒了，哭了起来。' },
    good: { emoji: '🤗', en: 'Help him up', zh: '扶他起来' },
    bad: { emoji: '😆', en: 'Laugh at him', zh: '笑他' },
    goodOut: { en: 'You are so kind! Your friend feels better.', zh: '你真善良！朋友觉得好多了。' },
    badOut: { en: 'Laughing makes your friend sadder. Try again!', zh: '笑他会让朋友更难过。再想一想！' },
  },
  {
    scene: '🏃💥🧒',
    text: { en: 'You are running and bump into someone by accident.', zh: '你跑步的时候，不小心撞到了别人。' },
    good: { emoji: '🙏', en: 'Say sorry', zh: '说对不起' },
    bad: { emoji: '💨', en: 'Run away', zh: '跑开' },
    goodOut: { en: 'Saying sorry is the right thing to do!', zh: '说对不起是对的！' },
    badOut: { en: 'Hmm, they might be hurt. Try again!', zh: '嗯，他可能受伤了。再想一想！' },
  },
  {
    scene: '👵🎁🧒',
    text: { en: 'Grandma gives you a present.', zh: '奶奶送给你一个礼物。' },
    good: { emoji: '😊', en: 'Say thank you', zh: '说谢谢' },
    bad: { emoji: '😶', en: 'Just take it', zh: '拿了就走' },
    goodOut: { en: 'Saying thank you makes Grandma happy!', zh: '说谢谢，奶奶很开心！' },
    badOut: { en: 'Grandma would love to hear a nice word. Try again!', zh: '奶奶想听你说一句好听的话。再想一想！' },
  },
  {
    scene: '🧸🧩🚂🪀',
    text: { en: 'You finished playing. Toys are everywhere.', zh: '你玩完了，玩具到处都是。' },
    good: { emoji: '🧺', en: 'Put the toys away', zh: '把玩具收好' },
    bad: { emoji: '🚶', en: 'Leave them on the floor', zh: '丢在地上不管' },
    goodOut: { en: 'Great! A tidy room is a happy room.', zh: '真棒！房间整整齐齐真舒服。' },
    badOut: { en: 'Someone might trip over them! Try again!', zh: '有人可能会被绊倒哦！再想一想！' },
  },
  {
    scene: '🍦   🧒🧒👦',
    text: { en: 'Everyone is waiting in line for ice cream.', zh: '大家在排队买冰淇淋。' },
    good: { emoji: '⏳', en: 'Wait for my turn', zh: '排队等候' },
    bad: { emoji: '🏃', en: 'Push to the front', zh: '挤到前面去' },
    goodOut: { en: 'Good waiting! Your turn will come soon.', zh: '等得真好！很快就轮到你了。' },
    badOut: { en: 'Pushing is not fair to others. Try again!', zh: '插队对别人不公平。再想一想！' },
  },
  {
    scene: '🧒💥🥛',
    text: { en: 'Oops! You knocked over a cup and it broke.', zh: '哎呀！你不小心把杯子打碎了。' },
    good: { emoji: '🗣️', en: 'Tell Mummy the truth', zh: '告诉妈妈实话' },
    bad: { emoji: '🙈', en: 'Hide it', zh: '藏起来' },
    goodOut: { en: 'Telling the truth is very brave!', zh: '说实话真勇敢！' },
    badOut: { en: 'Hiding it is not honest. Try again!', zh: '藏起来是不诚实的。再想一想！' },
  },
  {
    scene: '👩🛍️🛍️🛍️',
    text: { en: 'Mummy is carrying lots of heavy bags.', zh: '妈妈提着很多很重的袋子。' },
    good: { emoji: '💪', en: 'Help carry a bag', zh: '帮妈妈提袋子' },
    bad: { emoji: '📺', en: 'Keep watching TV', zh: '继续看电视' },
    goodOut: { en: 'What a great helper! Mummy says thank you.', zh: '你真是个好帮手！妈妈说谢谢你。' },
    badOut: { en: 'Mummy needs some help. Try again!', zh: '妈妈需要帮忙哦。再想一想！' },
  },
  {
    scene: '🐱   🧒',
    text: { en: 'You are playing with a little cat.', zh: '你在和小猫玩。' },
    good: { emoji: '🤲', en: 'Pet it gently', zh: '轻轻地摸它' },
    bad: { emoji: '✊', en: 'Pull its tail', zh: '拉它的尾巴' },
    goodOut: { en: 'The cat purrs. It likes you!', zh: '小猫喵喵叫，它很喜欢你！' },
    badOut: { en: 'Ouch! That hurts the cat. Try again!', zh: '哎哟！小猫会疼的。再想一想！' },
  },
  {
    scene: '🍪🧒🦠',
    text: { en: "It's snack time, but your hands are dirty.", zh: '要吃点心了，可是你的手脏脏的。' },
    good: { emoji: '🧼', en: 'Wash my hands first', zh: '先洗手' },
    bad: { emoji: '😋', en: 'Eat right away', zh: '马上就吃' },
    goodOut: { en: 'Clean hands keep germs away!', zh: '洗干净手，细菌跑光光！' },
    badOut: { en: 'Germs could make you sick. Try again!', zh: '细菌会让你生病哦。再想一想！' },
  },
  {
    scene: '🍌🌳🗑️',
    text: { en: 'You finished your banana in the park.', zh: '你在公园吃完了香蕉。' },
    good: { emoji: '🗑️', en: 'Put the peel in the bin', zh: '把香蕉皮丢进垃圾桶' },
    bad: { emoji: '🌳', en: 'Throw it on the grass', zh: '丢在草地上' },
    goodOut: { en: 'Thank you for keeping the park clean!', zh: '谢谢你保持公园干净！' },
    badOut: { en: 'The park will get dirty. Try again!', zh: '公园会变脏的。再想一想！' },
  },
  {
    scene: '👧😢 🎈',
    text: { en: 'Your friend lost her balloon and is crying.', zh: '朋友的气球飞走了，她在哭。' },
    good: { emoji: '🤗', en: 'Give her a hug', zh: '抱抱她，安慰她' },
    bad: { emoji: '🙄', en: 'Ignore her', zh: '不理她' },
    goodOut: { en: 'A hug makes your friend feel better!', zh: '一个拥抱让朋友好多了！' },
    badOut: { en: 'Your friend still feels sad. Try again!', zh: '朋友还是很难过。再想一想！' },
  },
  {
    scene: '🖍️👦   🧒',
    text: { en: "You want to use your friend's crayon.", zh: '你想用朋友的蜡笔。' },
    good: { emoji: '🙋', en: 'Ask: "May I use it?"', zh: '问：“我可以用吗？”' },
    bad: { emoji: '✋', en: 'Just grab it', zh: '直接抢过来' },
    goodOut: { en: 'Asking nicely is good manners!', zh: '有礼貌地问，真棒！' },
    badOut: { en: 'Grabbing is not nice. Try again!', zh: '抢东西是不对的。再想一想！' },
  },
];
