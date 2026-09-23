import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AREA_LANDMARK_RUN_IDS,
  getHeavenlyRunLabelPriority,
  HEAVENLY_LABEL_ZOOM,
  WHOLE_MOUNTAIN_LANDMARK_RUN_IDS,
} from '../components/resort/map/heavenlyMapCartography.ts';

test('whole-mountain labels remain a deliberately small landmark set', () => {
  assert.equal(WHOLE_MOUNTAIN_LANDMARK_RUN_IDS.length, 8);
  assert.equal(new Set(WHOLE_MOUNTAIN_LANDMARK_RUN_IDS).size, WHOLE_MOUNTAIN_LANDMARK_RUN_IDS.length);
  assert.equal(getHeavenlyRunLabelPriority('ridge-run'), 1);
  assert.equal(getHeavenlyRunLabelPriority('boundary-chutes'), 2);
  assert.equal(getHeavenlyRunLabelPriority('powder-line'), 3);
});

test('area landmarks do not duplicate whole-mountain landmarks', () => {
  const wholeMountainIds = new Set(WHOLE_MOUNTAIN_LANDMARK_RUN_IDS);
  assert.ok(AREA_LANDMARK_RUN_IDS.every((runId) => !wholeMountainIds.has(runId)));
});

test('label zoom tiers progress from mountain identity to individual runs', () => {
  assert.ok(HEAVENLY_LABEL_ZOOM.wholeMountainRunMin < HEAVENLY_LABEL_ZOOM.areaRunMin);
  assert.ok(HEAVENLY_LABEL_ZOOM.areaRunMin < HEAVENLY_LABEL_ZOOM.trailRunMin);
  assert.equal(HEAVENLY_LABEL_ZOOM.trailRunMin, HEAVENLY_LABEL_ZOOM.difficultSymbolMin);
  assert.ok(HEAVENLY_LABEL_ZOOM.majorLiftMin < HEAVENLY_LABEL_ZOOM.secondaryLiftMin);
});
