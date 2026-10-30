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

### The three games
| Game | Teaches | How difficulty grows (levels 1 → 5) |
|---|---|---|
| 🔢 **Maths**: Count & Compare | Counting to 30, more/fewer, + and − | 1: count 3–10 · 2: count to 15, "which has more?" · 3: count to 20, more/fewer, + within 5 · 4: count to 25, + within 10, − within 6 · 5: count to 30, +/− within 10 |
| 🔤 **Words**: Word ↔ Picture | Reading English & Chinese (pinyin shown) | 1: hear + see an easy word, 2 pictures · 2: 3 pictures · 3: **read** it (not spoken; 🔊 for help) · 4: see a picture, pick the word · 5: same with 4 choices and longer words |
| 🎈 **Focus**: Tap Only The ___ | Attention, impulse control, listening | 1: 2 balloon colours, slow · 2: 3 colours · 3: 4 colours, faster · 4: sea animals swimming by · 5: the rule **changes halfway** |

- In counting tasks he can **tap each object** to count it one by one (it gets a number badge and is spoken). This builds careful, one-at-a-time attention.
- **Wrong answers are gentle**: soft sound, wiggle, the choice turns grey. After 2 misses the right answer pulses as a hint. No "game over".
- **Stars per round**: 3 ⭐ if every task was right first try, 2 ⭐ for most, 1 ⭐ otherwise (Focus: based on wrong taps).
- **Difficulty adjusts itself**: 3 first-try successes in a row = level up; 2 misses in a row = level down (Focus: 3 stars = up, 1 star = down).
- **Mixed language mode**: tasks alternate English / Chinese, and after a right answer the word is said in both.

### Parent Corner
**Hold the ⚙️ (top-left of home) for 2.5 seconds.** There you can set:
- Language: English / 中文 / Mixed
- Rest reminder: Off / 10 / 15 / 20 / 30 min. A sleepy panda pauses the game and asks to rest the eyes; tap OK to continue.
- Check which voices the phone has (and test them), see progress and levels, and reset progress (hold 🗑️ 3 s).

---

## How the code is organised (function level)

```
src/
  main.ts              starts Phaser, lists all scenes (screens)
  data/                ← CONTENT: edit these freely
    words.ts             word list, things to count, balloon colours, sea animals
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
    OverlayScene.ts      rest reminder (always on top)
  games/               ← the mini-games
    CountScene.ts  WordScene.ts  TapOnlyScene.ts
```

### Adding content yourself
- **New word**: open `src/data/words.ts`, copy a line in `WORDS`, change emoji / English / Chinese / pinyin. Difficulty is automatic (word length / number of characters).
  ```ts
  { emoji: '🦒', en: 'giraffe', zh: '长颈鹿', py: 'cháng jǐng lù' },
  ```
- **New thing to count**: add to `COUNTABLES` with its Chinese measure word (`mw`), e.g. `{ emoji: '🦆', en: 'ducks', zh: '鸭子', mw: '只' }`.
- **More praise lines**: add to `PRAISE` in `src/data/phrases.ts`.
- **Change how fast the adventure grows**: `pathLength()` in `src/core/save.ts`.
- **Change what each level contains**: the `LEVELS` table at the top of each game file.

Emoji are used as pictures, so a new word only needs an emoji, no image files.

### Chinese voice on Android
Speech uses the phone's Google Text-to-speech. If Chinese is silent:
Android **Settings → Text-to-speech output → Google → ⚙ → Install voice data → Chinese (China)**.
Parent Corner shows which voices were found.

---

## Putting it on the phone (GitHub Pages)
The workflow in `.github/workflows/deploy.yml` builds and publishes the game automatically on every push to `main`.
Then on the phone: open the link in **Chrome → ⋮ menu → Add to Home screen / Install app**.
