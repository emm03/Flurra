export const HEAVENLY_LABEL_ZOOM = {
  wholeMountainRunMin: 11.55,
  wholeMountainRunMax: 13.55,
  areaRunMin: 13.2,
  areaRunMax: 14.55,
  trailRunMin: 14.15,
  difficultSymbolMin: 14.15,
  majorLiftMin: 11.65,
  secondaryLiftMin: 13.75,
} as const;

export const WHOLE_MOUNTAIN_LANDMARK_RUN_IDS = [
  'ridge-run',
  'skyline-trail',
  'california-trail',
  'maggies',
  'galaxy',
  'boulder-bowl',
  'gunbarrel',
  'east-bowl',
] as const;

export const AREA_LANDMARK_RUN_IDS = [
  'stagecoach',
  'orion',
  'big-dipper',
  'easy-street',
  'world-cup',
  'boundary-chutes',
  'outer-limits',
  'snake-eyes',
  'hully-gully',
] as const;

const wholeMountainLandmarks = new Set<string>(WHOLE_MOUNTAIN_LANDMARK_RUN_IDS);
const areaLandmarks = new Set<string>(AREA_LANDMARK_RUN_IDS);

export type HeavenlyRunLabelPriority = 1 | 2 | 3;

export function getHeavenlyRunLabelPriority(runId: string): HeavenlyRunLabelPriority {
  if (wholeMountainLandmarks.has(runId)) return 1;
  if (areaLandmarks.has(runId)) return 2;
  return 3;
}
