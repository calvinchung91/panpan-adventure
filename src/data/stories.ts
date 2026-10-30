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
  {
    scene: '🧒🍪🍪   👦',
    text: { en: 'You have two cookies. Your friend has none.', zh: '你有两块饼干，朋友一块也没有。' },
    good: { emoji: '🍪', en: 'Give one to my friend', zh: '分一块给朋友' },
    bad: { emoji: '😋', en: 'Eat both myself', zh: '自己全部吃掉' },
    goodOut: { en: 'Sharing makes two friends happy!', zh: '分享让两个人都开心！' },
    badOut: { en: 'Your friend is still hungry. Try again!', zh: '朋友还饿着呢。再想一想！' },
  },
  {
    scene: '🧒🧒   👦',
    text: { en: 'A new boy joins your class. He has no one to play with.', zh: '班里来了一个新同学，他没有人一起玩。' },
    good: { emoji: '👋', en: 'Ask him to play', zh: '邀请他一起玩' },
    bad: { emoji: '🙈', en: 'Play without him', zh: '不跟他玩' },
    goodOut: { en: 'Now he has a new friend: you!', zh: '现在他有了一个新朋友，就是你！' },
    badOut: { en: 'He feels lonely. Try again!', zh: '他觉得很孤单。再想一想！' },
  },
  {
    scene: '📚🤫🧒',
    text: { en: 'You are in the library. People are reading.', zh: '你在图书馆，大家都在看书。' },
    good: { emoji: '🤫', en: 'Talk quietly', zh: '小声说话' },
    bad: { emoji: '📢', en: 'Shout and run', zh: '大声叫，到处跑' },
    goodOut: { en: 'Thank you for being quiet!', zh: '谢谢你保持安静！' },
    badOut: { en: 'Shouting disturbs others. Try again!', zh: '大声叫会吵到别人。再想一想！' },
  },
  {
    scene: '🚦🚗   🧒',
    text: { en: 'You want to cross the road.', zh: '你想过马路。' },
    good: { emoji: '🤝', en: "Hold a grown-up's hand, wait for green", zh: '牵着大人的手，等绿灯' },
    bad: { emoji: '🏃', en: 'Run across by myself', zh: '自己跑过去' },
    goodOut: { en: 'Safe and smart! Well done.', zh: '又安全又聪明！做得好。' },
    badOut: { en: 'That is dangerous! Try again!', zh: '那样很危险！再想一想！' },
  },
  {
    scene: '🧸❓   👧',
    text: { en: 'You find a teddy bear that someone lost.', zh: '你捡到了别人丢的小熊。' },
    good: { emoji: '🙋', en: 'Give it back to its owner', zh: '还给它的主人' },
    bad: { emoji: '🎒', en: 'Keep it secretly', zh: '偷偷留下来' },
    goodOut: { en: 'The owner is so happy. You are honest!', zh: '主人好开心，你真诚实！' },
    badOut: { en: 'Someone is missing their teddy. Try again!', zh: '有人正在找他的小熊呢。再想一想！' },
  },
  {
    scene: '🌙🛏️🧒',
    text: { en: "It's bedtime.", zh: '该睡觉了。' },
    good: { emoji: '🦷', en: 'Brush my teeth', zh: '先刷牙' },
    bad: { emoji: '🍬', en: 'Eat sweets in bed', zh: '在床上吃糖' },
    goodOut: { en: 'Clean teeth are happy teeth!', zh: '牙齿干干净净真健康！' },
    badOut: { en: 'Sweets at night hurt your teeth. Try again!', zh: '晚上吃糖会蛀牙哦。再想一想！' },
  },
  {
    scene: '🚌👴🧒',
    text: { en: 'On the bus, Grandpa has no seat.', zh: '在公交车上，老爷爷没有座位。' },
    good: { emoji: '💺', en: 'Give him my seat', zh: '把座位让给他' },
    bad: { emoji: '🙄', en: 'Pretend not to see', zh: '假装没看见' },
    goodOut: { en: 'How kind! Grandpa says thank you.', zh: '真有礼貌！老爷爷说谢谢你。' },
    badOut: { en: 'Grandpa is tired of standing. Try again!', zh: '老爷爷站着很累。再想一想！' },
  },
  {
    scene: '👶😭',
    text: { en: 'Your baby sister is crying.', zh: '小妹妹在哭。' },
    good: { emoji: '🧸', en: 'Give her a toy and sing', zh: '给她玩具，唱歌给她听' },
    bad: { emoji: '🙉', en: 'Cover my ears and walk away', zh: '捂住耳朵走开' },
    goodOut: { en: 'She stops crying and smiles at you!', zh: '她不哭了，还对你笑呢！' },
    badOut: { en: 'She still needs help. Try again!', zh: '妹妹还需要帮忙。再想一想！' },
  },
  {
    scene: '🎲😤🧒',
    text: { en: 'You lost a game.', zh: '你玩游戏输了。' },
    good: { emoji: '🤝', en: '"Good game! Let\'s play again"', zh: '“玩得真好！再玩一次吧”' },
    bad: { emoji: '😠', en: 'Throw the toys', zh: '乱扔玩具' },
    goodOut: { en: 'Being a good sport is cool!', zh: '输了也不生气，真棒！' },
    badOut: { en: 'Throwing toys is not okay. Try again!', zh: '乱扔玩具是不对的。再想一想！' },
  },
  {
    scene: '🌷🥀🧒',
    text: { en: 'The flowers look dry and droopy.', zh: '花儿看起来干干的，没精神。' },
    good: { emoji: '💧', en: 'Give them some water', zh: '给它们浇水' },
    bad: { emoji: '🦶', en: 'Step on them', zh: '踩它们' },
    goodOut: { en: 'The flowers drink and stand up tall!', zh: '花儿喝饱了水，又挺起来了！' },
    badOut: { en: 'Ouch! Flowers are living things. Try again!', zh: '哎呀！花儿也是有生命的。再想一想！' },
  },
  {
    scene: '🖼️👧😊',
    text: { en: 'Your friend shows you her drawing.', zh: '朋友给你看她画的画。' },
    good: { emoji: '👏', en: '"Wow, it\'s beautiful!"', zh: '“哇，真漂亮！”' },
    bad: { emoji: '😝', en: '"That\'s ugly!"', zh: '“真难看！”' },
    goodOut: { en: 'Kind words make friends happy!', zh: '好听的话让朋友很开心！' },
    badOut: { en: 'Mean words hurt feelings. Try again!', zh: '难听的话会让人伤心。再想一想！' },
  },
  {
    scene: '👩📖🧒🧒',
    text: { en: 'The teacher is telling a story.', zh: '老师正在讲故事。' },
    good: { emoji: '✋', en: 'Raise my hand to talk', zh: '举手再说话' },
    bad: { emoji: '🗣️', en: 'Shout out loud', zh: '大声插嘴' },
    goodOut: { en: "Great listening! Now it's your turn.", zh: '听得真认真！现在轮到你说了。' },
    badOut: { en: "Let's not interrupt. Try again!", zh: '我们不要插嘴哦。再想一想！' },
  },
  {
    scene: '🚰💧💧',
    text: { en: 'You finished washing, but the tap is still running.', zh: '你洗完手了，水龙头还开着。' },
    good: { emoji: '👌', en: 'Turn off the tap', zh: '关上水龙头' },
    bad: { emoji: '🏃', en: 'Leave it running', zh: '让它一直流' },
    goodOut: { en: 'Good job saving water!', zh: '节约用水，真棒！' },
    badOut: { en: 'Water is precious. Try again!', zh: '水很宝贵哦。再想一想！' },
  },
  {
    scene: '💡🛏️🚪',
    text: { en: 'You are leaving your room. The light is still on.', zh: '你要离开房间了，灯还开着。' },
    good: { emoji: '💡', en: 'Switch off the light', zh: '关灯' },
    bad: { emoji: '🚶', en: 'Just leave', zh: '直接走掉' },
    goodOut: { en: 'Saving energy helps our Earth!', zh: '节约用电，保护地球！' },
    badOut: { en: 'The light is wasting energy. Try again!', zh: '灯一直开着很浪费。再想一想！' },
  },
  {
    scene: '🤒🛏️',
    text: { en: "Your friend is sick and can't come to school.", zh: '朋友生病了，不能来上学。' },
    good: { emoji: '💌', en: 'Make a get-well card', zh: '做一张祝福卡片' },
    bad: { emoji: '🤷', en: 'Forget about him', zh: '把他忘了' },
    goodOut: { en: 'Your card makes him smile!', zh: '你的卡片让他笑了！' },
    badOut: { en: 'He would love to hear from you. Try again!', zh: '他很想收到你的问候。再想一想！' },
  },
  {
    scene: '👩📚⬇️',
    text: { en: 'A lady drops her books.', zh: '一位阿姨的书掉在地上了。' },
    good: { emoji: '🙋', en: 'Help pick them up', zh: '帮她捡起来' },
    bad: { emoji: '🚶', en: 'Walk past', zh: '走过去不管' },
    goodOut: { en: 'Thank you, little helper!', zh: '谢谢你，小帮手！' },
    badOut: { en: 'She could use some help. Try again!', zh: '阿姨需要帮忙。再想一想！' },
  },
  {
    scene: '🌳🐦⬇️',
    text: { en: 'A baby bird fell out of its nest.', zh: '一只小鸟从鸟窝里掉下来了。' },
    good: { emoji: '🙋', en: 'Ask a grown-up to help', zh: '请大人来帮忙' },
    bad: { emoji: '👉', en: 'Poke it with a stick', zh: '用棍子戳它' },
    goodOut: { en: 'The bird is safe back home. Well done!', zh: '小鸟安全回家了。做得好！' },
    badOut: { en: 'The bird is scared and hurt. Try again!', zh: '小鸟又害怕又疼。再想一想！' },
  },
];

// ─── Feelings: "How do they feel?" (Kindness game, level 3 and up) ───────
export const FEELINGS = {
  happy: { emoji: '😄', en: 'happy', zh: '开心' },
  sad: { emoji: '😢', en: 'sad', zh: '难过' },
  angry: { emoji: '😠', en: 'angry', zh: '生气' },
  scared: { emoji: '😨', en: 'scared', zh: '害怕' },
  surprised: { emoji: '😲', en: 'surprised', zh: '惊讶' },
};
export type FeelingId = keyof typeof FEELINGS;

export const FEELING_SCENES: { scene: string; text: Bi; feel: FeelingId }[] = [
  { scene: '👧🎂🎁', text: { en: 'It is her birthday and she gets a big present.', zh: '今天是她的生日，她收到了一个大礼物。' }, feel: 'happy' },
  { scene: '👦🍦⬇️', text: { en: 'His ice cream falls on the floor.', zh: '他的冰淇淋掉在地上了。' }, feel: 'sad' },
  { scene: '🧒🧱💥', text: { en: 'Someone knocks down his block tower on purpose.', zh: '有人故意推倒了他搭的积木。' }, feel: 'angry' },
  { scene: '👧⛈️🌙', text: { en: 'There is loud thunder in the night.', zh: '晚上打了很响的雷。' }, feel: 'scared' },
  { scene: '🎉👦🎈', text: { en: 'He opens the door and everyone shouts "Surprise!"', zh: '他一开门，大家一起喊：“惊喜！”' }, feel: 'surprised' },
  { scene: '🐶🧒❤️', text: { en: 'He gets a new puppy.', zh: '他有了一只新的小狗。' }, feel: 'happy' },
  { scene: '👧🎈💨', text: { en: 'Her balloon flies away into the sky.', zh: '她的气球飞到天上去了。' }, feel: 'sad' },
  { scene: '🧒🕷️', text: { en: 'A big spider crawls near him.', zh: '一只大蜘蛛爬到他旁边。' }, feel: 'scared' },
  { scene: '👦🧃🙅', text: { en: 'His friend grabs his juice without asking.', zh: '朋友没问就抢走了他的果汁。' }, feel: 'angry' },
  { scene: '👧🎩🐰', text: { en: 'A magician pulls a rabbit out of a hat!', zh: '魔术师从帽子里变出了一只兔子！' }, feel: 'surprised' },
  { scene: '👦⚽🥅', text: { en: 'He kicks the ball and scores a goal!', zh: '他一脚踢进了一个球！' }, feel: 'happy' },
  { scene: '👧🌧️🎡', text: { en: 'It rains, so her trip to the park is cancelled.', zh: '下雨了，她不能去公园玩了。' }, feel: 'sad' },
];
