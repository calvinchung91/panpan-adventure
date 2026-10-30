// Shared behaviour for every mini-game: header buttons, progress dots, gentle right/wrong
// handling, automatic difficulty, and the star result screen at the end of a round.
import Phaser from 'phaser';
import { adapt, type Streak } from './adapt';
import { line, modeLines, modeText, taskLang, type Lang } from './lang';
import { pickOne } from './rand';
import { addStars, persist, save, type GameId } from './save';
import { sfx } from './sfx';
import { speech, type Line } from './speech';
import { button, C, confetti, mascot, popIn, pulse, tapCard, txt, wait, wiggle, type TapCard } from './ui';
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
  private streak: Streak = { right: 0, wrong: 0 };
  private dots: Phaser.GameObjects.Arc[] = [];

  init(data?: { fromPath?: boolean }): void {
    this.fromPath = !!data?.fromPath;
    this.alive = true;
    this.busy = false;
    this.taskIndex = 0;
    this.firstTries = 0;
    this.streak = { right: 0, wrong: 0 };
    this.dots = [];
    this.layer = undefined;
    this.events.once('shutdown', () => {
      this.alive = false;
      speech.stop();
    });
  }

  protected get level(): number {
    return save.levels[this.gameId];
  }

  /** Home button (left), replay-instruction button (right), progress dots (centre). */
  protected header(showDots = true): void {
    const W = this.scale.width;
    button(this, 95, 85, 140, 120, '🏠', () => this.goHome(), { fill: C.blue, size: 60 }).setDepth(50);
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
    adapt(this.gameId, firstTry, this.streak);
    this.taskIndex++;
  }

  private starsFromTasks(): number {
    const f = this.firstTries / this.tasksTotal;
    return f >= 0.99 ? 3 : f >= 0.6 ? 2 : 1;
  }

  protected goHome(): void {
    speech.stop();
    this.scene.start('Home');
  }

  /** The end-of-round screen: stars fill in one by one, then a big ▶ button. */
  protected finishRound(stars: number): void {
    this.busy = true;
    addStars(stars);
    const { width: W, height: H } = this.scale;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35).setInteractive().setDepth(100);
    const card = tapCard(this, W / 2, H / 2, 980, 760, null, { radius: 60 }).setDepth(101);
    popIn(this, card);
    card.add(mascot(this, 0, -250, 170));
    for (let i = 0; i < 3; i++) {
      const s = txt(this, (i - 1) * 190, -60, '⭐', 150).setAlpha(0.2);
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
    card.add(txt(this, 0, 110, modeText(praise), 58));
    const next = button(this, 0, 270, 340, 150, '▶', () => this.leave(), { fill: C.green, size: 80 });
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
      this.scene.start('Home');
    }
  }
}
