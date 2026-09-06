export const RUN_PROGRESS_STORAGE_KEY = 'flurra:run-progress:v1';

export type PersistedRunProgress = {
  version: 1;
  savedRunIds: string[];
  completedRunIds: string[];
};

export type RunProgressPersistenceStatus = 'ready' | 'unavailable';

type StorageReader = Pick<Storage, 'getItem'>;

export const createEmptyRunProgress = (): PersistedRunProgress => ({
  version: 1,
  savedRunIds: [],
  completedRunIds: [],
});

function sanitizeRunIds(value: unknown, knownRunIds: ReadonlySet<string>) {
  if (!Array.isArray(value)) return null;
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && knownRunIds.has(item)))];
}

export function parsePersistedRunProgress(
  rawValue: string | null,
  knownRunIds: ReadonlySet<string>,
): PersistedRunProgress {
  if (!rawValue) return createEmptyRunProgress();

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedRunProgress> | null;
    if (!parsed || parsed.version !== 1) return createEmptyRunProgress();

    const savedRunIds = sanitizeRunIds(parsed.savedRunIds, knownRunIds);
    const completedRunIds = sanitizeRunIds(parsed.completedRunIds, knownRunIds);
    if (!savedRunIds || !completedRunIds) return createEmptyRunProgress();

    return { version: 1, savedRunIds, completedRunIds };
  } catch {
    return createEmptyRunProgress();
  }
}

export function loadPersistedRunProgress(
  storage: StorageReader,
  knownRunIds: ReadonlySet<string>,
): { progress: PersistedRunProgress; status: RunProgressPersistenceStatus } {
  try {
    return {
      progress: parsePersistedRunProgress(storage.getItem(RUN_PROGRESS_STORAGE_KEY), knownRunIds),
      status: 'ready',
    };
  } catch {
    return { progress: createEmptyRunProgress(), status: 'unavailable' };
  }
}

export function toggleRunProgressId(
  progress: PersistedRunProgress,
  field: 'savedRunIds' | 'completedRunIds',
  runId: string,
): PersistedRunProgress {
  const current = progress[field];
  return {
    ...progress,
    [field]: current.includes(runId)
      ? current.filter((id) => id !== runId)
      : [...current, runId],
  };
}
