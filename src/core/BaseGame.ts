// Shared behaviour for every mini-game: header buttons, progress dots, gentle right/wrong
// handling, the stage being played (which sets the difficulty), and the star result screen.
import Phaser from 'phaser';
import { line, modeLines, modeText, oneLine, taskLang, type Lang } from './lang';
import { pickOne } from './rand';
import { addStars, nextStage, persist, recordStage, save, type GameId } from './save';
import { sfx } from './sfx';
import { speech, type Line } from './speech';
import { levelForStage, stageProgress, STAGES } from './stageMath';
import { music } from './music';
import type { TrackId } from '../data/music';
import { button, C, confetti, mascot, popIn, pulse, shade, tapCard, txt, wait, wiggle, type TapCard } from './ui';
import { GAMES } from '../data/games';
import { P, PRAISE, TRY_AGAIN } from '../data/phrases';

export abstract class BaseGame extends Phaser.Scene {
  abstract readonly gameId: GameId;
  protected fromPath = false;
  protected alive = true;
  protected busy = false;
  protected attempts = 0;
  protected lang: Lang = 'en';
  protected taskIndex = 0;
  protected tasksTotal = 5;
  protected firstTries = 0;
  protected prompt: Line[] = [];
  protected layer?: Phaser.GameObjects.Container;
  protected stage = 1;
  private selected: { card: TapCard; tick: Phaser.GameObjects.Container } | null = null;
  /** Background tune for this game: calm music-box for thinking games (TapOnly/Moral use 'calm'). */
  protected musicTrack: TrackId = 'gentle';
  private dots: Phaser.GameObjects.Arc[] = [];

  init(data?: { fromPath?: boolean; stage?: number }): void {
    this.fromPath = !!data?.fromPath;
    this.stage = data?.stage ?? nextStage(this.gameId); // the adventure plays his next stage
    this.alive = true;
    this.busy = false;
    this.taskIndex = 0;
    this.firstTries = 0;
    this.dots = [];
    this.layer = undefined;
    this.events.once('shutdown', () => {
      this.alive = false;
      speech.stop();
    });
  }

  /** Difficulty setting 1..8 (row of the game's LEVELS table) for the stage being played. */
  protected get level(): number {
    return levelForStage(this.stage);
  }

  /** 0..1: how far this stage is into its difficulty setting, for small step-ups between stages. */
  protected get stageStep(): number {
    return stageProgress(this.stage);
  }

  /** Back button (left: home in an adventure, else the stage map), stage number, replay button (right), progress dots. */
  protected header(showDots = true): void {
    const W = this.scale.width;
    music.play(this.musicTrack);
    button(this, 95, 85, 140, 120, this.fromPath ? '🏠' : '◀', () => this.goBack(), { fill: C.blue, size: 60 }).setDepth(50);
    txt(this, 190, 85, `${GAMES[this.gameId].icon} ${this.stage}`, 50).setOrigin(0, 0.5).setStroke('#ffffff', 8).setDepth(50);
    button(this, W - 95, 85, 140, 120, '🔊', () => this.replay(), { fill: C.purple, size: 56 }).setDepth(50);
    if (!showDots) return;
    for (let i = 0; i < this.tasksTotal; i++) {
      const x = W / 2 + (i - (this.tasksTotal - 1) / 2) * 64;
      this.dots.push(this.add.circle(x, 70, 22, 0xffffff, 0.7).setStrokeStyle(5, 0x5b6b88, 0.35));
    }
  }

  /** Starts the next task, or ends the round when all tasks are done. */
  protected startTask(): void {
    if (!this.alive) return;
    if (this.taskIndex >= this.tasksTotal) {
      this.finishRound(this.starsFromTasks());
      return;
    }
    this.busy = false;
    this.attempts = 0;
    this.lang = taskLang(this.taskIndex);
    this.newLayer();
    this.buildTask();
  }

  /** Each task game draws one task here, inside this.layer. */
  protected buildTask(): void {}

  protected newLayer(): Phaser.GameObjects.Container {
    if (this.selected) this.tweens.killTweensOf(this.selected.tick);
    this.selected = null;
    if (this.layer) {
      this.tweens.killTweensOf(this.layer.getAll());
      this.layer.destroy();
    }
    this.layer = this.add.container(0, 0);
    return this.layer;
  }

  protected say(lines: Line[]): Promise<void> {
    return speech.say(lines);
  }

  /** Speaks and remembers the instruction so the 🔊 button can repeat it. */
  protected setPrompt(lines: Line[]): Promise<void> {
    this.prompt = lines;
    return this.say(lines);
  }

  protected replay(): void {
    if (this.prompt.length) void this.say(this.prompt);
  }

  /**
   * Tap-to-choose (Words, Science, Kindness): tapping an answer reads it aloud and highlights it,
   * and a green ✔ appears on it. Only tapping ✔ submits the answer. Tapping another answer moves the choice.
   */
  protected chooseAnswer(card: TapCard, w: number, h: number, read: Line[], submit: () => void): void {
    if (this.busy) return;
    void this.say(read);
    if (this.selected?.card === card) return; // tapped again: just read it again
    this.clearSelection();
    card.paint(0xfff1b8);
    this.tweens.add({ targets: card, scale: 1.05, duration: 120 });
    const tick = this.add.container(w / 2 - 48, -h / 2 + 48);
    tick.add(this.add.circle(0, 4, 46, shade(C.green, 30)));
    tick.add(this.add.circle(0, 0, 46, C.green).setStrokeStyle(5, 0xffffff));
    tick.add(txt(this, 0, 0, '✔', 50, '#ffffff'));
    tick.setSize(100, 100).setInteractive({ useHandCursor: true });
    tick.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation(); // the tap belongs to ✔, not to the card underneath
      sfx.tap();
      submit();
    });
    card.add(tick);
    popIn(this, tick);
    this.time.delayedCall(400, () => tick.active && pulse(this, tick, 1.15));
    this.selected = { card, tick };
  }

  private clearSelection(): void {
    if (!this.selected) return;
    const { card, tick } = this.selected;
    this.selected = null;
    this.tweens.killTweensOf(tick);
    tick.destroy();
    if (card.active) {
      card.paint(C.white);
      this.tweens.add({ targets: card, scale: 1, duration: 120 });
    }
  }

  protected speakFor(lines: Line[], maxMs: number): Promise<void> {
    return Promise.race([this.say(lines), wait(this, maxMs)]);
  }

  /**
   * Call when the child taps an answer.
   * Wrong: soft sound, wiggle, greys out that choice; after 2 misses the right answer pulses as a hint.
   * Right: celebrate, say the confirmation, then move on.
   */
  protected async handleAnswer(card: TapCard, ok: boolean, correct: TapCard, confirm: Line[], wrongLines?: Line[]): Promise<void> {
    if (this.busy) return;
    this.clearSelection();
    if (!ok) {
      this.attempts++;
      sfx.wrong();
      wiggle(this, card);
      card.paint(C.grey);
      card.disableInteractive();
      void this.say(wrongLines ?? [line(pickOne(TRY_AGAIN), this.lang)]);
      if (this.attempts === 2) pulse(this, correct);
      return;
    }
    this.busy = true;
    card.paint(C.green);
    sfx.correct();
    confetti(this, card.x, card.y, 40);
    await this.completeTask(this.attempts === 0, confirm);
  }

  /** Marks the current task done (praise + confirmation), then moves to the next one. */
  protected async completeTask(firstTry: boolean, confirm: Line[]): Promise<void> {
    this.busy = true;
    this.recordTask(firstTry);
    await this.speakFor([line(pickOne(PRAISE), this.lang), ...confirm], 7000);
    await wait(this, 350);
    this.startTask();
  }

  private recordTask(firstTry: boolean): void {
    if (firstTry) this.firstTries++;
    const dot = this.dots[this.taskIndex];
    if (dot) {
      dot.setFillStyle(firstTry ? C.green : C.yellow, 1);
      popIn(this, dot);
    }
    this.taskIndex++;
  }

  private starsFromTasks(): number {
    const f = this.firstTries / this.tasksTotal;
    return f >= 0.99 ? 3 : f >= 0.6 ? 2 : 1;
  }

  protected goBack(): void {
    speech.stop();
    if (this.fromPath) this.scene.start('Home');
    else this.scene.start('Stage', { game: this.gameId });
  }

  /** The end-of-round screen: stars fill in one by one, then a big ▶ button. */
  protected finishRound(stars: number): void {
    this.busy = true;
    addStars(stars);
    recordStage(this.gameId, this.stage, stars);
    const { width: W, height: H } = this.scale;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35).setInteractive().setDepth(100);
    const card = tapCard(this, W / 2, H / 2, 980, 760, null, { radius: 60 }).setDepth(101);
    popIn(this, card);
    card.add(mascot(this, 0, -280, 130));
    card.add(txt(this, 0, -180, `${GAMES[this.gameId].icon}  ${oneLine(P.stage(this.stage))}`, 44, '#8e4ff0'));
    for (let i = 0; i < 3; i++) {
      const s = txt(this, (i - 1) * 190, -55, '⭐', 140).setAlpha(0.2);
      card.add(s);
      if (i < stars) {
        this.time.delayedCall(500 + i * 450, () => {
          s.setAlpha(1);
          popIn(this, s);
          sfx.star();
        });
      }
    }
    const praise = pickOne(PRAISE);
    card.add(txt(this, 0, 90, modeText(praise), 54));
    if (this.stage === STAGES) card.add(txt(this, 0, 170, '🏆 30 / 30', 40, '#3a9a5b'));
    const next = button(this, 0, 280, 340, 140, '▶', () => this.leave(), { fill: C.green, size: 76 });
    card.add(next);
    this.time.delayedCall(1800, () => pulse(this, next, 1.08));
    confetti(this, W / 2, H * 0.45, 120);
    void this.say([...modeLines(praise), ...modeLines(P.stars(stars))]);
  }

  private leave(): void {
    speech.stop();
    const path = save.currentPath;
    if (this.fromPath && path) {
      path.index++;
      persist();
      this.scene.start('Path', { advanced: true });
    } else {
      this.scene.start('Stage', { game: this.gameId });
    }
  }
}
