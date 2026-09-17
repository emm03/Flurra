import type { DifficultyKey, ResortRun, RunFeature } from './heavenlyResort';

export type HeavenlyRunFilterId = DifficultyKey | RunFeature;

export const heavenlyDifficultyFilters: { id: DifficultyKey; label: string }[] = [
  { id: 'Green', label: 'Green' },
  { id: 'Blue', label: 'Blue' },
  { id: 'Black', label: 'Black' },
];

export const heavenlyFeatureFilters: { id: RunFeature; label: string }[] = [
  { id: 'confidence-friendly', label: 'Confidence' },
  { id: 'scenic', label: 'Scenic' },
  { id: 'groomed', label: 'Groomed' },
  { id: 'recent-reports', label: 'Reports' },
];

const difficultyIds = new Set<DifficultyKey>(heavenlyDifficultyFilters.map(({ id }) => id));

export function filterHeavenlyRuns(
  runs: ResortRun[],
  query: string,
  activeFilters: HeavenlyRunFilterId[],
) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedDifficulties = activeFilters.filter((filter): filter is DifficultyKey => (
    difficultyIds.has(filter as DifficultyKey)
  ));
  const selectedFeatures = activeFilters.filter((filter): filter is RunFeature => (
    !difficultyIds.has(filter as DifficultyKey)
  ));

  return runs.filter((run) => {
    const searchable = [
      run.name,
      run.description,
      run.officialDifficulty,
      run.mountainArea,
      ...run.conditionTags,
    ].join(' ').toLowerCase();

    return (!normalizedQuery || searchable.includes(normalizedQuery))
      && (!selectedDifficulties.length || selectedDifficulties.includes(run.difficulty))
      && selectedFeatures.every((feature) => run.features.includes(feature));
  });
}
