import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  heavenlyMapFeatures,
  heavenlyOfficialRuns,
} from '../../data/heavenlyOfficialRuns.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');
const dataDirectory = resolve(projectRoot, 'data/maps/heavenly');

const [featureCollection, matchReport, runtimeMapData] = await Promise.all([
  readFile(resolve(dataDirectory, 'osm-features.geojson'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'match-report.json'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'runtime-map-data.json'), 'utf8').then(JSON.parse),
]);

assert.equal(featureCollection.type, 'FeatureCollection');
assert.equal(featureCollection.schemaVersion, 1);
assert.equal(matchReport.schemaVersion, 1);
assert.equal(runtimeMapData.schemaVersion, 1);
assert.equal(heavenlyOfficialRuns.length, 116);
assert.ok(heavenlyOfficialRuns.every((run) => run.geometryRef === null));
assert.ok(heavenlyMapFeatures.every((feature) => feature.geometryRef === null));
assert.ok(heavenlyOfficialRuns.every((run) => !('osmId' in run) && !('osmRef' in run)));

const featureIds = featureCollection.features.map((feature) => feature.id);
assert.equal(new Set(featureIds).size, featureIds.length, 'OSM feature IDs must be unique');

for (const feature of featureCollection.features) {
  assert.match(feature.id, /^(node|way|relation)\/\d+$/);
  assert.ok(feature.geometry, `${feature.id} must have geometry`);
  assert.ok(['downhill', 'lift', 'named-ski-terrain'].includes(feature.properties.kind));
  assert.ok(['node', 'way', 'relation'].includes(feature.properties.osmFeatureType));
  assert.equal(typeof feature.properties.osmFeatureId, 'number');
  assert.equal(typeof feature.properties.tags, 'object');
  assert.equal(feature.properties.source.provider, 'OpenStreetMap');
  assert.equal(feature.properties.source.license, 'ODbL 1.0');
  assert.equal(
    feature.properties.source.featureUrl,
    `https://www.openstreetmap.org/${feature.id}`,
  );
}

const downhill = featureCollection.features
  .filter((feature) => feature.properties.kind === 'downhill');
const namedDownhill = downhill
  .filter((feature) => feature.properties.originalName);
const lifts = featureCollection.features
  .filter((feature) => feature.properties.kind === 'lift');
const namedTerrain = featureCollection.features
  .filter((feature) => feature.properties.kind === 'named-ski-terrain');

assert.equal(matchReport.summary.downhillOsmFeatures, downhill.length);
assert.equal(matchReport.summary.namedDownhillOsmFeatures, namedDownhill.length);
assert.equal(matchReport.summary.lifts, lifts.length);
assert.equal(matchReport.summary.namedNonDownhillSkiTerrainFeatures, namedTerrain.length);
assert.equal(matchReport.summary.flurraProvisionalRunRecords, heavenlyOfficialRuns.length);
assert.equal(
  matchReport.summary.exactOrNormalizedMatchedFlurraRuns,
  matchReport.exactNormalizedMatches.length,
);
assert.equal(
  matchReport.summary.likelyOrAmbiguousOsmFeatures,
  matchReport.likelyMatches.length,
);
assert.equal(
  matchReport.summary.flurraRunsWithoutOsmGeometry,
  matchReport.flurraRunsWithoutOsmGeometry.length,
);
assert.equal(
  matchReport.summary.downhillOsmFeaturesWithoutFlurraMatch,
  matchReport.osmDownhillWithoutFlurraMatch.length,
);
assert.equal(
  matchReport.summary.osmSkiFeaturesWithoutFlurraRunMatch,
  matchReport.osmSkiFeaturesWithoutFlurraRunMatch.length,
);

const knownRunIds = new Set(heavenlyOfficialRuns.map((run) => run.id));
for (const match of matchReport.exactNormalizedMatches) {
  assert.ok(knownRunIds.has(match.flurraRun.id));
  assert.ok(match.osmFeatures.every((feature) => featureIds.includes(feature.osmRef)));
}
for (const match of matchReport.likelyMatches) {
  assert.equal(match.reviewRequired, true);
  assert.ok(featureIds.includes(match.osmFeature.osmRef));
  assert.ok(match.flurraCandidates.every((run) => knownRunIds.has(run.id)));
}

const exactMatchedOsmRefs = new Set(
  matchReport.exactNormalizedMatches.flatMap((match) => (
    match.osmFeatures.map((feature) => feature.osmRef)
  )),
);
const runtimeRunIds = Object.keys(runtimeMapData.runGeometryIndex);
const runtimeRunFeatureRefs = runtimeMapData.verifiedRuns.features
  .map((feature) => feature.id);
assert.equal(runtimeMapData.verifiedRunCount, matchReport.exactNormalizedMatches.length);
assert.equal(runtimeRunIds.length, runtimeMapData.verifiedRunCount);
assert.equal(runtimeMapData.verifiedRunFeatureCount, exactMatchedOsmRefs.size);
assert.equal(runtimeRunFeatureRefs.length, runtimeMapData.verifiedRunFeatureCount);
assert.deepEqual(new Set(runtimeRunFeatureRefs), exactMatchedOsmRefs);
assert.equal(runtimeMapData.liftFeatureCount, lifts.length);
assert.equal(runtimeMapData.lifts.features.length, lifts.length);
assert.ok(runtimeMapData.verifiedRuns.features.every((feature) => (
  feature.properties.verifiedMatchType === 'exact-or-normalized'
)));
assert.ok(runtimeRunIds.every((runId) => knownRunIds.has(runId)));

console.log(JSON.stringify({
  valid: true,
  importedFeatures: featureCollection.features.length,
  downhillFeatures: downhill.length,
  namedDownhillFeatures: namedDownhill.length,
  lifts: lifts.length,
  namedTerrainFeatures: namedTerrain.length,
  exactMatchedFlurraRuns: matchReport.summary.exactOrNormalizedMatchedFlurraRuns,
  likelyOrAmbiguousOsmFeatures: matchReport.summary.likelyOrAmbiguousOsmFeatures,
  runtimeVerifiedRuns: runtimeMapData.verifiedRunCount,
  runtimeVerifiedFeatures: runtimeMapData.verifiedRunFeatureCount,
}, null, 2));
