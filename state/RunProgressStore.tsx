import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { heavenlyOfficialRuns } from '@/data/heavenlyOfficialRuns';
import {
  createEmptyRunProgress,
  loadPersistedRunProgress,
  type PersistedRunProgress,
  RUN_PROGRESS_STORAGE_KEY,
  toggleRunProgressId,
} from './runProgressPersistence';

const knownHeavenlyRunIds = new Set(heavenlyOfficialRuns.map((run) => run.id));

type PersistenceStatus = 'loading' | 'ready' | 'unavailable';

type RunProgressStore = {
  savedRunIds: string[];
  completedRunIds: string[];
  persistenceStatus: PersistenceStatus;
  isSaved: (runId: string) => boolean;
  isCompleted: (runId: string) => boolean;
  toggleSaved: (runId: string) => void;
  toggleCompleted: (runId: string) => void;
};

const RunProgressContext = createContext<RunProgressStore | null>(null);

export function RunProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<PersistedRunProgress>(createEmptyRunProgress);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('loading');
  const { savedRunIds, completedRunIds } = progress;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = loadPersistedRunProgress(window.localStorage, knownHeavenlyRunIds);
    setProgress(stored.progress);
    setPersistenceStatus(stored.status);
  }, []);

  useEffect(() => {
    if (persistenceStatus !== 'ready' || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(RUN_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      setPersistenceStatus('unavailable');
    }
  }, [persistenceStatus, progress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncProgress = (event: StorageEvent) => {
      if (event.key !== RUN_PROGRESS_STORAGE_KEY) return;
      const stored = loadPersistedRunProgress(window.localStorage, knownHeavenlyRunIds);
      setProgress(stored.progress);
      setPersistenceStatus(stored.status);
    };
    window.addEventListener('storage', syncProgress);
    return () => window.removeEventListener('storage', syncProgress);
  }, []);

  const toggleSaved = useCallback((runId: string) => {
    if (!knownHeavenlyRunIds.has(runId)) return;
    setProgress((current) => toggleRunProgressId(current, 'savedRunIds', runId));
  }, []);

  const toggleCompleted = useCallback((runId: string) => {
    if (!knownHeavenlyRunIds.has(runId)) return;
    setProgress((current) => toggleRunProgressId(current, 'completedRunIds', runId));
  }, []);

  const savedSet = useMemo(() => new Set(savedRunIds), [savedRunIds]);
  const completedSet = useMemo(() => new Set(completedRunIds), [completedRunIds]);

  const value = useMemo<RunProgressStore>(() => ({
    savedRunIds,
    completedRunIds,
    persistenceStatus,
    isSaved: (runId) => savedSet.has(runId),
    isCompleted: (runId) => completedSet.has(runId),
    toggleSaved,
    toggleCompleted,
  }), [completedRunIds, completedSet, persistenceStatus, savedRunIds, savedSet, toggleCompleted, toggleSaved]);

  return <RunProgressContext.Provider value={value}>{children}</RunProgressContext.Provider>;
}

export function useRunProgress() {
  const store = useContext(RunProgressContext);
  if (!store) throw new Error('useRunProgress must be used within RunProgressProvider');
  return store;
}
