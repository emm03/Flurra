import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterHeavenlyRuns,
  heavenlyDifficultyFilters,
  heavenlyFeatureFilters,
} from '../data/heavenlyRunExplorer.ts';
import {
  getResortPitchCompensation,
  getSelectedRunOffset,
  getSelectedRunPadding,
  getWholeMountainPadding,
} from '../data/heavenlyMapCamera.ts';

const baseRun = {
  id: 'ridge-run',
  name: 'Ridge Run',
  description: 'Scenic groomed cruiser',
  officialDifficulty: 'More Difficult',
  mountainArea: 'California',
  conditionTags: ['sample groomed'],
  difficulty: 'Blue',
  features: ['scenic', 'groomed'],
};

const runs = [
  baseRun,
  {
    ...baseRun,
    id: 'maggies',
    name: "Maggie's",
    description: 'Confidence-friendly route',
    officialDifficulty: 'Easier',
    mountainArea: 'Boulder & Groove',
    difficulty: 'Green',
    features: ['confidence-friendly', 'recent-reports'],
  },
];

test('run explorer keeps difficulty and feature filters in intentional groups', () => {
  assert.deepEqual(heavenlyDifficultyFilters.map(({ label }) => label), ['Green', 'Blue', 'Black']);
  assert.deepEqual(heavenlyFeatureFilters.map(({ label }) => label), ['Confidence', 'Scenic', 'Groomed', 'Reports']);
});

test('run explorer search and filters combine deterministically', () => {
  assert.deepEqual(filterHeavenlyRuns(runs, 'california', []).map(({ id }) => id), ['ridge-run']);
  assert.deepEqual(filterHeavenlyRuns(runs, '', ['Green']).map(({ id }) => id), ['maggies']);
  assert.deepEqual(filterHeavenlyRuns(runs, '', ['scenic', 'groomed']).map(({ id }) => id), ['ridge-run']);
  assert.deepEqual(filterHeavenlyRuns(runs, 'maggie', ['Green', 'recent-reports']).map(({ id }) => id), ['maggies']);
});

test('mobile camera padding keeps geometry above the selected-run sheet', () => {
  assert.deepEqual(getWholeMountainPadding({ width: 390, height: 620 }, true, 28, 126), {
    top: 35,
    right: 35,
    bottom: 144,
    left: 35,
  });
  assert.equal(getSelectedRunPadding({ width: 390, height: 620 }, 176).bottom, 200);
});

test('desktop camera padding and pitch compensation retain mountain emphasis', () => {
  const padding = getWholeMountainPadding({ width: 980, height: 640 }, true, 28);
  assert.equal(padding.left, 59);
  assert.equal(padding.top, 51);
  assert.ok(getResortPitchCompensation({ width: 980, height: 640 }, 49) > 0);
  assert.equal(getResortPitchCompensation({ width: 390, height: 620 }, 49), 0);
  assert.deepEqual(getSelectedRunOffset({ width: 980, height: 640 }, true), [0, -58]);
  assert.deepEqual(getSelectedRunOffset({ width: 390, height: 620 }, true), [0, 0]);
});
