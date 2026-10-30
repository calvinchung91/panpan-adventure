# 🐼 Pan Pan's Adventure · 盼盼去冒险

A bilingual (English / 中文) learning game for a 4-year-old, built with **Phaser 3 + TypeScript + Vite**,
installed on an Android phone as a web app (PWA).

## Run it on your PC

```bash
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

In Chrome, press F12 → the phone icon (device toolbar) → pick a phone and rotate it to landscape.

---

## How the game works (gameplay)

### Today's Adventure (the focus trainer)
- Each session is a **path of games** ending in a 🏆. Finishing the whole path gives **+5 ⭐**.
- It starts at **3 games** and grows by one game every 3 finished adventures, up to 6. This slowly stretches how long he can stay on task.
- If he leaves halfway, the path is remembered and "Continue" appears on the home screen.
- Finishing an adventure also opens a 🎁 with a **new sticker** for the **📒 Sticker Book** (40 to collect). Stickers come only from whole adventures, which rewards staying focused to the end.

### Adventure Map (stages)
Tapping "Today's Adventure" opens the **🗺️ map**: 6 worlds with **5 stages** each:
🚜 Farm → 🌳 Forest → 🌊 Sea → ❄️ Snowland → 🌵 Desert → 🚀 Space.
- Each finished adventure completes one stage (a ⭐ on the map). Finishing all 5 stages **unlocks the next world** 🎉.
- The adventure path takes on the current world's look (forest trees, falling snow, stars in space…).
- After all 30 stages he can keep playing adventures in Space.

### Sticker Book (📒 on the home screen)
Drag won stickers from the tray onto the picture; drag one back onto the tray to remove it. Positions are saved.

### All 8 games (8 levels each)
| Game | Teaches | How difficulty grows (levels 1 → 8) |
|---|---|---|
| 🔢 **Maths**: Count & Compare | Counting to 50, more/fewer, + and −, number order | 1: count 3–10 · 2: count to 15, "which has more?" · 3: count to 20, + within 5 · 4: count to 25, + within 10 · 5: count to 30, +/− within 10 · 6: count to 40, + within 15, **missing number** (12 13 ❓ 15) · 7: count to 50, +/− within 20, count by 2s · 8: +/− within 20, count by 2s, 5s, 10s |
| 🔤 **Words**: Word ↔ Picture | Reading English & Chinese (pinyin shown) | 1: hear + see an easy word, 2 pictures · 2: 3 pictures · 3: **read** it (not spoken; 🔊 for help) · 4: see a picture, pick the word · 5: 4 choices · 6: read, 4 pictures · 7: **look-alike** words (same first letter / shared character, e.g. 牛 · 牛奶 · 蜗牛) · 8: look-alike, 5 choices |
| 🔬 **Science** | Animal homes, healthy food, 5 senses, day/night, sink or float, weather, life cycles, **animal sounds**, **seasons** | 1: animal homes, healthy food (2 choices) · 2: + senses, day/night (3 choices) · 3: + sink/float, weather · 4: life cycles · 5: everything, 4 choices · 6: + animal sounds · 7: + seasons · 8: all topics |
| 💛 **Kindness** (Moral) | 30 stories: sharing, helping, sorry, thank you, honesty, safety, saving water & energy, good manners; **feelings** | 1–2: 3 stories per round · 3+: "**How do they feel?**" questions mixed in (😄😢😠😨😲) · 4–6: 4 per round, more feeling choices · 7–8: 5 per round, all 5 feelings |
| 🎈 **Focus**: Tap Only The ___ | Attention, impulse control, listening | 1: 2 balloon colours, slow · 2: 3 colours · 3: 4 colours, faster · 4: sea animals · 5: the rule **changes halfway** · 6: 5 colours, faster · 7: sea animals with a rule change · 8: 6 colours, fastest, rule changes **twice** |
| 🃏 **Memory** | Memory & concentration, vocabulary (each match is spoken) | 1: 2 pairs, see all cards first · 2: 3 pairs · 3: 4 pairs · 4: 5 pairs, no peek · 5: 6 pairs · 6: 7 pairs · 7: 8 pairs · 8: 9 pairs |
| 🧩 **Patterns** | Logic: what comes next | 1: AB (🔴🔵🔴🔵❓) · 2: AAB, ABB · 3: ABC, AABB · 4: what's **missing** in the middle · 5: ABCD · 6: ABAC, ABCB (missing) · 7: ABBA, AABCC · 8: ABCDE, AABBCC, ABACAD (missing) |
| 🔍 **Spot It** | Careful looking & focus | 1: 6 pictures, 1 difference · 2: 9 · 3: 2 differences · 4: 12 pictures · 5: 16 pictures, 3 differences · 6: 20 pictures · 7: 4 differences, one is **subtle** (same picture, smaller) · 8: 25 pictures, 5 differences. After 3 wrong taps, one difference gently pulses |

- In counting tasks he can **tap each object** to count it one by one (it gets a number badge and is spoken). This builds careful, one-at-a-time attention.
- **🔊 on answer cards** (Science, Kindness): tap it to hear the word read aloud. It never counts as choosing that answer. (Not in the Words game, where reading is the point.)
- **Wrong answers are gentle**: soft sound, wiggle, the choice turns grey. After 2 misses the right answer pulses as a hint. No "game over".
- **Stars per round**: 3 ⭐ if every task was right first try, 2 ⭐ for most, 1 ⭐ otherwise (Focus: based on wrong taps).
- **Difficulty adjusts itself**: 3 first-try successes in a row = level up; 2 misses in a row = level down (Focus: 3 stars = up, 1 star = down).
- **Mixed language mode**: tasks alternate English / Chinese, and after a right answer the word is said in both.

### Parent Corner
**Hold the ⚙️ (top-left of home) for 2.5 seconds.** There you can set:
- Language: English / 中文 / Mixed
- Rest reminder: Off / 10 / 15 / 20 / 30 min. A sleepy panda pauses the game and asks to rest the eyes; tap OK to continue.
- **In adventure**: switch individual games on/off for Today's Adventure (free play on the home screen always shows all games).
- Check which voices the phone has (and test them), see progress, levels and stickers, and reset progress (hold 🗑️ 3 s).

---

## How the code is organised (function level)

```
src/
  main.ts              starts Phaser, lists all scenes (screens)
  data/                ← CONTENT: edit these freely
    words.ts             word list, things to count, balloon colours, sea animals
    science.ts           animal homes, healthy food, senses, sink/float, weather, life cycles
    stories.ts           kindness stories
    stickers.ts          the 40 stickers to collect
    worlds.ts            the 6 map worlds (name, look, decorations) and 5 stages per world
    phrases.ts           everything Pan Pan says (praise, try again, …)
    games.ts             list of games shown on home / used by the adventure
  core/                ← shared engine pieces
    save.ts              progress & settings saved on the phone (stars, levels, current path)
    speech.ts            text-to-speech (picks an English voice and a Mandarin zh-CN voice)
    lang.ts              bilingual helpers (which language each task uses)
    adapt.ts             automatic difficulty rules
    sfx.ts               little sound effects (generated, no audio files)
    ui.ts                buttons, cards, backgrounds, confetti, animations
    BaseGame.ts          shared game logic: header, progress dots, right/wrong handling, star screen
  scenes/              ← screens
    BootScene.ts         "Tap to Play" (unlocks sound, goes full screen)
    HomeScene.ts         home screen
    PathScene.ts         Today's Adventure path
    ParentScene.ts       Parent Corner
    MapScene.ts          Adventure Map (worlds & stages)
    StickerScene.ts      Sticker Book
    OverlayScene.ts      rest reminder (always on top)
  games/               ← the mini-games
    CountScene.ts  WordScene.ts  ScienceScene.ts  MoralScene.ts
    TapOnlyScene.ts  MemoryScene.ts  PatternScene.ts  SpotScene.ts
```

### Adding content yourself
- **New word**: open `src/data/words.ts`, copy a line in `WORDS`, change emoji / English / Chinese / pinyin. Difficulty is automatic (word length / number of characters).
  ```ts
  { emoji: '🦒', en: 'giraffe', zh: '长颈鹿', py: 'cháng jǐng lù' },
  ```
- **New thing to count**: add to `COUNTABLES` with its Chinese measure word (`mw`), e.g. `{ emoji: '🦆', en: 'ducks', zh: '鸭子', mw: '只' }`.
- **New kindness story**: copy a block in `src/data/stories.ts` (picture, story, kind choice, unkind choice, and what happens after each). Feelings questions are in `FEELING_SCENES` in the same file.
- **Stages per world**: `STAGES_PER_WORLD` in `src/data/worlds.ts`.
- **New science question**: add an animal to `ANIMAL_HOMES`, a food to `HEALTHY`/`TREATS`, an item to `SINK_FLOAT`, etc. in `src/data/science.ts`.
- **More praise lines**: add to `PRAISE` in `src/data/phrases.ts`.
- **Change how fast the adventure grows**: `pathLength()` in `src/core/save.ts`.
- **Change what each level contains**: the `LEVELS` table at the top of each game file.

Emoji are used as pictures, so a new word only needs an emoji, no image files.

### Voice pack (human-like voices)
Every sentence can be pre-recorded with a Microsoft Azure neural voice and played as audio.
Anything not recorded uses the phone's own voice, so the game always works.

- Setup (once): a free Azure **Speech** resource (Free F0), and a file `.env.local` in the project folder:
  ```
  AZURE_SPEECH_KEY=your-key-1
  AZURE_SPEECH_REGION=southeastasia
  AZURE_VOICE_EN=en-US-AnaNeural        (optional, preview voices in Azure's Voice Gallery)
  AZURE_VOICE_ZH=zh-CN-XiaoyouNeural    (optional)
  AZURE_RATE=-5%                        (optional speaking speed)
  ```
  `.env.local` is private and never uploaded to GitHub.
- **After adding words, stories or questions:** run this, then commit and push. Only new sentences are recorded:
  ```bash
  npm run voices
  ```
- `npm run voices -- --dry` just counts the sentences. Changing a voice re-records everything.
- Recordings go to `public/voice/`; the phone keeps each one after it plays once, so it works offline later.
- The sentences come from `src/voice/allLines.ts` (sentences with numbers/names, built from `src/data/sentences.ts`)
  plus every fixed `{ en: '…', zh: '…' }` in the code. Parent Corner shows whether the voice pack is installed.

### Chinese voice on Android (when no voice pack)
Without a voice pack, speech uses the phone's Google Text-to-speech. If Chinese is silent:
Android **Settings → Text-to-speech output → Google → ⚙ → Install voice data → Chinese (China)**.
Parent Corner shows which voices were found.

---

## Putting it on the phone (GitHub Pages)
The workflow in `.github/workflows/deploy.yml` builds and publishes the game automatically on every push to `main`.
Then on the phone: open the link in **Chrome → ⋮ menu → Add to Home screen / Install app**.
