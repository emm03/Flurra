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

const STORAGE_KEY = 'flurra:run-progress:v1';

const initialSavedRunIds = ['powderbowl-woods'];
const initialCompletedRunIds = ['maggies', 'orion', 'ridge-run'];
const knownHeavenlyRunIds = new Set(heavenlyOfficialRuns.map((run) => run.id));

type PersistedRunProgress = {
  version: 1;
  savedRunIds: string[];
  completedRunIds: string[];
};

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

function uniqueRunIds(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && knownHeavenlyRunIds.has(item)))];
}

function readStoredProgress(): PersistedRunProgress | null {
  if (typeof window === 'undefined') return null;
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  const parsed = JSON.parse(rawValue) as Partial<PersistedRunProgress>;
  if (parsed.version !== 1) return null;

  return {
    version: 1,
    savedRunIds: uniqueRunIds(parsed.savedRunIds, initialSavedRunIds),
    completedRunIds: uniqueRunIds(parsed.completedRunIds, initialCompletedRunIds),
  };
}

function toggleId(current: string[], runId: string) {
  return current.includes(runId)
    ? current.filter((id) => id !== runId)
    : [...current, runId];
}

export function RunProgressProvider({ children }: PropsWithChildren) {
  const [savedRunIds, setSavedRunIds] = useState(initialSavedRunIds);
  const [completedRunIds, setCompletedRunIds] = useState(initialCompletedRunIds);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('loading');

  useEffect(() => {
    try {
      const stored = readStoredProgress();
      if (stored) {
        setSavedRunIds(stored.savedRunIds);
        setCompletedRunIds(stored.completedRunIds);
      }
      setPersistenceStatus('ready');
    } catch {
      setPersistenceStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    if (persistenceStatus !== 'ready' || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        savedRunIds,
        completedRunIds,
      } satisfies PersistedRunProgress));
    } catch {
      setPersistenceStatus('unavailable');
    }
  }, [completedRunIds, persistenceStatus, savedRunIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncProgress = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const stored = readStoredProgress();
        if (!stored) return;
        setSavedRunIds(stored.savedRunIds);
        setCompletedRunIds(stored.completedRunIds);
      } catch {
        setPersistenceStatus('unavailable');
      }
    };
    window.addEventListener('storage', syncProgress);
    return () => window.removeEventListener('storage', syncProgress);
  }, []);

  const toggleSaved = useCallback((runId: string) => {
    setSavedRunIds((current) => toggleId(current, runId));
  }, []);

  const toggleCompleted = useCallback((runId: string) => {
    setCompletedRunIds((current) => toggleId(current, runId));
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
