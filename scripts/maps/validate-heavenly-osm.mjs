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

const [featureCollection, matchReport, manualReview, runtimeMapData] = await Promise.all([
  readFile(resolve(dataDirectory, 'osm-features.geojson'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'match-report.json'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'manual-reviewed-matches.json'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'runtime-map-data.json'), 'utf8').then(JSON.parse),
]);

assert.equal(featureCollection.type, 'FeatureCollection');
assert.equal(featureCollection.schemaVersion, 1);
assert.equal(matchReport.schemaVersion, 1);
assert.equal(manualReview.schemaVersion, 1);
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
const runsById = new Map(heavenlyOfficialRuns.map((run) => [run.id, run]));
for (const match of matchReport.exactNormalizedMatches) {
  assert.ok(knownRunIds.has(match.flurraRun.id));
  assert.ok(match.osmFeatures.every((feature) => featureIds.includes(feature.osmRef)));
}
for (const match of matchReport.likelyMatches) {
  assert.equal(match.reviewRequired, true);
  assert.ok(featureIds.includes(match.osmFeature.osmRef));
  assert.ok(match.flurraCandidates.every((run) => knownRunIds.has(run.id)));
}

assert.equal(manualReview.sourceProvenance.osmSnapshot.provider, 'OpenStreetMap');
assert.equal(
  manualReview.sourceProvenance.osmSnapshot.snapshotTimestamp,
  featureCollection.metadata.osmBaseTimestamp,
);
assert.equal(manualReview.sourceProvenance.osmSnapshot.license, 'ODbL 1.0');

const approvedRunIds = manualReview.approvedMatches.map((match) => match.flurraRunId);
const approvedOsmRefs = manualReview.approvedMatches.map((match) => match.osmRef);
assert.equal(new Set(approvedRunIds).size, approvedRunIds.length);
assert.equal(new Set(approvedOsmRefs).size, approvedOsmRefs.length);
for (const match of manualReview.approvedMatches) {
  const run = runsById.get(match.flurraRunId);
  const osmFeature = featureCollection.features.find((feature) => feature.id === match.osmRef);
  assert.ok(run, `Unknown manually reviewed run ${match.flurraRunId}`);
  assert.ok(osmFeature, `Unknown manually reviewed OSM feature ${match.osmRef}`);
  assert.equal(match.flurraOriginalName, run.officialName);
  assert.equal(match.osmOriginalName, osmFeature.properties.originalName);
  assert.equal(match.matchType, 'manual-reviewed-alias');
  assert.ok(match.reviewExplanation.length > 20);
  assert.equal(match.sourceMapRef, 'heavenly-official-winter-trail-map');
}

for (const candidate of manualReview.unresolvedCandidates) {
  assert.ok(knownRunIds.has(candidate.flurraRunId));
  assert.ok(featureIds.includes(candidate.osmRef));
  assert.ok(!approvedRunIds.includes(candidate.flurraRunId));
  assert.ok(!approvedOsmRefs.includes(candidate.osmRef));
  assert.equal(candidate.status, 'unresolved-map-version-conflict');
}

const canyonRunIds = heavenlyOfficialRuns
  .filter((run) => run.mountainArea === 'Mott & Killebrew Canyons')
  .map((run) => run.id);
const canyonAssignmentRunIds = manualReview.canyonAssignments
  .map((assignment) => assignment.flurraRunId);
assert.equal(canyonAssignmentRunIds.length, 25);
assert.equal(new Set(canyonAssignmentRunIds).size, canyonAssignmentRunIds.length);
assert.deepEqual(new Set(canyonAssignmentRunIds), new Set(canyonRunIds));
for (const assignment of manualReview.canyonAssignments) {
  assert.ok(['mott-canyon', 'killebrew-canyon', 'shared-access'].includes(assignment.subarea));
  assert.ok([
    'manual-reviewed-official-map',
    'not-conclusively-inside-canyon',
  ].includes(assignment.status));
  assert.ok(assignment.evidence.length > 20);
}
const effectivePolicy = manualReview.effectiveClassificationPolicy;
const expectedKillebrewRunIds = [
  'boundary-chutes', 'outer-limits', 'pipeline', 'ramarrahs', 'the-fingers',
  'stateline-chute', 'bobs-boulevard', 'sweetwater', 'promised-land',
  'north-40', 'hemlock', 'ernies', 'rim-trail',
];
const expectedMottRunIds = [
  'the-y', 'bills', 'snake-eyes', 'lone-wolf', 'hully-gully', 'pinenuts',
  'southern-comfort', 'on-hold',
];
const expectedSharedAccessRunIds = [
  'perimeter', 'upper-perimeter', 'milky-way-bowl', 'milky-way',
];
const assignmentIdsFor = (subarea) => manualReview.canyonAssignments
  .filter((assignment) => assignment.subarea === subarea)
  .map((assignment) => assignment.flurraRunId);
assert.deepEqual(new Set(assignmentIdsFor('killebrew-canyon')), new Set(expectedKillebrewRunIds));
assert.deepEqual(new Set(assignmentIdsFor('mott-canyon')), new Set(expectedMottRunIds));
assert.deepEqual(new Set(assignmentIdsFor('shared-access')), new Set(expectedSharedAccessRunIds));
assert.deepEqual(
  new Set(effectivePolicy.appliesToSubareas),
  new Set(['mott-canyon', 'killebrew-canyon']),
);
assert.equal(effectivePolicy.effectiveMapDifficulty, 'experts-only');
assert.equal(effectivePolicy.accessRestriction, 'experts-only-gated-terrain');
assert.equal(effectivePolicy.difficultySymbol, '◆◆');
assert.equal(effectivePolicy.sourceMapRef, 'heavenly-official-winter-trail-map');
assert.ok(effectivePolicy.reviewExplanation.length > 80);

const exactMatchedOsmRefs = new Set(
  matchReport.exactNormalizedMatches.flatMap((match) => (
    match.osmFeatures.map((feature) => feature.osmRef)
  )),
);
const manuallyMatchedOsmRefs = new Set(approvedOsmRefs);
const expectedRuntimeOsmRefs = new Set([
  ...exactMatchedOsmRefs,
  ...manuallyMatchedOsmRefs,
]);
const expectedRuntimeRunIds = new Set([
  ...matchReport.exactNormalizedMatches.map((match) => match.flurraRun.id),
  ...approvedRunIds,
]);
const runtimeRunIds = Object.keys(runtimeMapData.runGeometryIndex);
const runtimeRunFeatureRefs = runtimeMapData.verifiedRuns.features
  .map((feature) => feature.id);
assert.equal(runtimeMapData.verifiedRunCount, expectedRuntimeRunIds.size);
assert.equal(runtimeRunIds.length, runtimeMapData.verifiedRunCount);
assert.equal(runtimeMapData.verifiedRunFeatureCount, expectedRuntimeOsmRefs.size);
assert.equal(runtimeRunFeatureRefs.length, runtimeMapData.verifiedRunFeatureCount);
assert.deepEqual(new Set(runtimeRunFeatureRefs), expectedRuntimeOsmRefs);
assert.equal(runtimeMapData.liftFeatureCount, lifts.length);
assert.equal(runtimeMapData.lifts.features.length, lifts.length);
assert.ok(runtimeMapData.verifiedRuns.features.every((feature) => (
  ['exact-or-normalized', 'manual-reviewed-alias']
    .includes(feature.properties.verifiedMatchType)
)));
assert.ok(runtimeRunIds.every((runId) => knownRunIds.has(runId)));
for (const feature of runtimeMapData.verifiedRuns.features) {
  const assignment = manualReview.canyonAssignments.find((candidate) => (
    candidate.flurraRunId === feature.properties.flurraRunId
  ));
  const restricted = effectivePolicy.appliesToSubareas.includes(assignment?.subarea);
  assert.equal(
    feature.properties.effectiveMapDifficulty,
    restricted ? 'experts-only' : feature.properties.officialDifficulty,
  );
  assert.equal(
    feature.properties.accessRestriction,
    restricted ? 'experts-only-gated-terrain' : null,
  );
  assert.equal(
    feature.properties.difficultyPresentationBasis,
    restricted ? 'official-gated-area-restriction' : 'source-run-difficulty',
  );
  assert.equal(
    feature.properties.classificationSourceMapRef,
    restricted ? 'heavenly-official-winter-trail-map' : null,
  );
}
for (const match of manualReview.approvedMatches) {
  const runtimeFeature = runtimeMapData.verifiedRuns.features
    .find((feature) => feature.id === match.osmRef);
  assert.ok(runtimeFeature);
  assert.equal(runtimeFeature.properties.flurraRunId, match.flurraRunId);
  assert.equal(runtimeFeature.properties.flurraRunName, match.flurraOriginalName);
  assert.equal(runtimeFeature.properties.osmOriginalName, match.osmOriginalName);
  assert.equal(runtimeFeature.properties.verifiedMatchType, 'manual-reviewed-alias');
  assert.equal(runtimeFeature.properties.reviewExplanation, match.reviewExplanation);
  assert.equal(runtimeFeature.properties.sourceMapRef, match.sourceMapRef);
  assert.equal(runtimeFeature.properties.osmSourceProvider, 'OpenStreetMap');
  assert.equal(runtimeFeature.properties.osmSourceLicense, 'ODbL 1.0');
}
for (const candidate of manualReview.unresolvedCandidates) {
  assert.ok(!runtimeRunIds.includes(candidate.flurraRunId));
  assert.ok(!runtimeRunFeatureRefs.includes(candidate.osmRef));
}

console.log(JSON.stringify({
  valid: true,
  importedFeatures: featureCollection.features.length,
  downhillFeatures: downhill.length,
  namedDownhillFeatures: namedDownhill.length,
  lifts: lifts.length,
  namedTerrainFeatures: namedTerrain.length,
  exactMatchedFlurraRuns: matchReport.summary.exactOrNormalizedMatchedFlurraRuns,
  manualReviewedAliases: manualReview.approvedMatches.length,
  unresolvedManualCandidates: manualReview.unresolvedCandidates.length,
  likelyOrAmbiguousOsmFeatures: matchReport.summary.likelyOrAmbiguousOsmFeatures,
  runtimeVerifiedRuns: runtimeMapData.verifiedRunCount,
  runtimeVerifiedFeatures: runtimeMapData.verifiedRunFeatureCount,
}, null, 2));
