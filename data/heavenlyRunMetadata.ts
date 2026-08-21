import { HeavenlyOfficialRun, OfficialRunDifficulty } from './heavenlyOfficialRuns';

export type HeavenlyTerrainTag =
  | 'learning terrain'
  | 'cruiser'
  | 'connector'
  | 'bowl terrain'
  | 'glades'
  | 'natural terrain'
  | 'steep terrain'
  | 'scenic';

export type HeavenlyRunMetadata = {
  flurraConfidenceRating: number;
  confidenceFriendly: boolean;
  scenic: boolean;
  groomed: boolean;
  terrainTags: HeavenlyTerrainTag[];
  shortDescription: string;
};

const confidenceByDifficulty: Record<OfficialRunDifficulty, number> = {
  easier: 92,
  'more-difficult': 84,
  'most-difficult': 72,
  'experts-only': 58,
};

const scenicRuns = new Set([
  'california-trail',
  'ridge-run',
  'skyline-trail',
  'maggies',
  'orion',
  'orions-belt',
]);

const confidenceFriendlyRuns = new Set([
  'big-easy',
  'easy-street',
  'maggies',
  'patsys',
  'poma-trail',
  'california-trail',
  'orion',
  'ridge-run',
  'von-schmidt',
]);

const typicalGroomerRuns = new Set([
  'big-easy',
  'easy-street',
  'maggies',
  'patsys',
  'california-trail',
  'orion',
  'ridge-run',
  'stagecoach',
  'von-schmidt',
]);

const editorialOverrides: Partial<Record<string, string>> = {
  maggies: 'A confidence-friendly California-side lap with a mellow learning-terrain feel.',
  'ridge-run': 'A signature upper-mountain route known for broad Lake Tahoe views.',
  orion: 'A steady Nevada-side cruiser suited to relaxed intermediate laps.',
  'skyline-trail': 'A high mountain connector with a scenic, exposed character.',
  'powderbowl-woods': 'Advanced wooded terrain where coverage and snow texture can vary.',
  gunbarrel: 'Sustained expert terrain with a long, demanding fall line.',
};

function terrainTagsFor(run: HeavenlyOfficialRun): HeavenlyTerrainTag[] {
  const tags: HeavenlyTerrainTag[] = [];
  const name = run.officialName.toLowerCase();

  if (run.officialDifficulty === 'easier') tags.push('learning terrain');
  if (run.officialDifficulty === 'more-difficult') tags.push('cruiser');
  if (run.officialDifficulty === 'most-difficult') tags.push('natural terrain');
  if (run.officialDifficulty === 'experts-only') tags.push('steep terrain');
  if (name.includes('woods') || name.includes('glades')) tags.push('glades');
  if (name.includes('bowl')) tags.push('bowl terrain');
  if (name.includes('trail') || name.includes('return') || name.includes('perimeter')) tags.push('connector');
  if (scenicRuns.has(run.id)) tags.push('scenic');

  return [...new Set(tags)];
}

/**
 * Flurra-owned editorial metadata. These values are not official Heavenly facts.
 * `groomed` means a prototype/typical-groomer classification, never today's status.
 */
export function getHeavenlyRunMetadata(run: HeavenlyOfficialRun): HeavenlyRunMetadata {
  const confidenceFriendly = run.officialDifficulty === 'easier' || confidenceFriendlyRuns.has(run.id);
  const scenic = scenicRuns.has(run.id);
  const groomed = typicalGroomerRuns.has(run.id);
  const difficultyCopy: Record<OfficialRunDifficulty, string> = {
    easier: 'An easier route',
    'more-difficult': 'A more difficult route',
    'most-difficult': 'A most difficult route',
    'experts-only': 'An experts-only route',
  };

  return {
    flurraConfidenceRating: confidenceByDifficulty[run.officialDifficulty]
      + (confidenceFriendly ? 4 : 0)
      + (scenic ? 2 : 0),
    confidenceFriendly,
    scenic,
    groomed,
    terrainTags: terrainTagsFor(run),
    shortDescription: editorialOverrides[run.id]
      ?? `${difficultyCopy[run.officialDifficulty]} in Heavenly's ${run.mountainArea} area.`,
  };
}
