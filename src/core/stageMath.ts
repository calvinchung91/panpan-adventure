// Each game has 30 stages. Every stage maps onto one of the game's 8 difficulty settings
// (the LEVELS table at the top of each game file), getting a little harder within each setting.

export const STAGES = 30;
const LEVEL_COUNT = 8;

/** Difficulty setting 1..8 used by a stage 1..30 (stages 1–4 → 1, 5–8 → 2, … 27–30 → 8). */
export function levelForStage(stage: number): number {
  return 1 + Math.floor(((stage - 1) * LEVEL_COUNT) / STAGES);
}

/** First stage that uses a difficulty setting (used to carry over progress from the old 8-level system). */
export function stageForLevel(level: number): number {
  return Math.ceil(((level - 1) * STAGES) / LEVEL_COUNT) + 1;
}

/** How far a stage is through its difficulty setting: 0 at the first stage of a setting, close to 1 at its last. */
export function stageProgress(stage: number): number {
  const level = levelForStage(stage);
  const first = stageForLevel(level);
  const next = level < LEVEL_COUNT ? stageForLevel(level + 1) : STAGES + 1;
  return (stage - first) / (next - first);
}
