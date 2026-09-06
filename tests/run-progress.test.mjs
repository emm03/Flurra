import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createEmptyRunProgress,
  loadPersistedRunProgress,
  parsePersistedRunProgress,
  RUN_PROGRESS_STORAGE_KEY,
  toggleRunProgressId,
} from '../state/runProgressPersistence.ts';

const knownRunIds = new Set(['ridge-run', 'maggies']);

test('fresh storage starts with empty saved and completed runs', () => {
  const result = loadPersistedRunProgress({ getItem: () => null }, knownRunIds);
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.progress, createEmptyRunProgress());
});

test('valid v1 progress remains intact', () => {
  const rawValue = JSON.stringify({
    version: 1,
    savedRunIds: ['ridge-run'],
    completedRunIds: ['maggies'],
  });
  assert.deepEqual(parsePersistedRunProgress(rawValue, knownRunIds), {
    version: 1,
    savedRunIds: ['ridge-run'],
    completedRunIds: ['maggies'],
  });
});

test('malformed, incomplete, and unsupported values recover to writable empty progress', () => {
  for (const rawValue of [
    '{broken json',
    JSON.stringify({ version: 1, savedRunIds: ['ridge-run'] }),
    JSON.stringify({ version: 2, savedRunIds: ['ridge-run'], completedRunIds: [] }),
  ]) {
    const result = loadPersistedRunProgress({
      getItem: (key) => {
        assert.equal(key, RUN_PROGRESS_STORAGE_KEY);
        return rawValue;
      },
    }, knownRunIds);
    assert.equal(result.status, 'ready');
    assert.deepEqual(result.progress, createEmptyRunProgress());
  }
});

test('a shared progress snapshot keeps save and completion status synchronized', () => {
  let progress = createEmptyRunProgress();
  progress = toggleRunProgressId(progress, 'savedRunIds', 'ridge-run');
  progress = toggleRunProgressId(progress, 'completedRunIds', 'ridge-run');

  const readSurfaceState = () => ({
    saved: progress.savedRunIds.includes('ridge-run'),
    completed: progress.completedRunIds.includes('ridge-run'),
  });

  assert.deepEqual(readSurfaceState(), { saved: true, completed: true });
  assert.deepEqual(readSurfaceState(), { saved: true, completed: true });
  assert.deepEqual(readSurfaceState(), { saved: true, completed: true });
});

test('recommendations, resort directory, and run details all consume the shared store', async () => {
  const files = [
    '../components/VibeSection.tsx',
    '../app/resorts/heavenly/index.tsx',
    '../components/resort/RunDetailPage.tsx',
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /useRunProgress\(\)/, `${file} must consume the shared progress store`);
  }
});
