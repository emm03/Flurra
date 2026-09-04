import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { heavenlyOfficialRuns } from '../../data/heavenlyOfficialRuns.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');
const dataDirectory = resolve(projectRoot, 'data/maps/heavenly');

const [featureCollection, matchReport, manualReview] = await Promise.all([
  readFile(resolve(dataDirectory, 'osm-features.geojson'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'match-report.json'), 'utf8').then(JSON.parse),
  readFile(resolve(dataDirectory, 'manual-reviewed-matches.json'), 'utf8').then(JSON.parse),
]);

const osmFeaturesByRef = new Map(
  featureCollection.features.map((feature) => [feature.id, feature]),
);
const runsById = new Map(heavenlyOfficialRuns.map((run) => [run.id, run]));
const canyonAssignmentByRunId = new Map(
  manualReview.canyonAssignments.map((assignment) => [assignment.flurraRunId, assignment]),
);
const effectiveClassificationPolicy = manualReview.effectiveClassificationPolicy;
const restrictedCanyonSubareas = new Set(effectiveClassificationPolicy.appliesToSubareas);
const verifiedRunFeatures = [];
const runGeometryIndex = {};

function addVerifiedMatch({
  runId,
  osmMatch,
  verifiedMatchType,
  reviewExplanation = null,
  sourceMapRef = null,
}) {
  const run = runsById.get(runId);
  if (!run) throw new Error(`Missing Flurra run ${runId}`);
  const sourceFeature = osmFeaturesByRef.get(osmMatch.osmRef);
  if (!sourceFeature) throw new Error(`Missing OSM feature ${osmMatch.osmRef}`);

  const canyonAssignment = canyonAssignmentByRunId.get(run.id);
  const isRestrictedCanyon = restrictedCanyonSubareas.has(canyonAssignment?.subarea);
  const effectiveMapDifficulty = isRestrictedCanyon
    ? effectiveClassificationPolicy.effectiveMapDifficulty
    : run.officialDifficulty;
  runGeometryIndex[run.id] ??= [];
  if (runGeometryIndex[run.id].includes(osmMatch.osmRef)) {
    throw new Error(`Duplicate runtime match ${run.id} -> ${osmMatch.osmRef}`);
  }
  runGeometryIndex[run.id].push(osmMatch.osmRef);
  verifiedRunFeatures.push({
    type: 'Feature',
    id: osmMatch.osmRef,
    geometry: sourceFeature.geometry,
    properties: {
      osmRef: osmMatch.osmRef,
      osmOriginalName: sourceFeature.properties.originalName,
      osmPisteDifficulty: sourceFeature.properties.pisteDifficulty,
      osmSourceProvider: sourceFeature.properties.source.provider,
      osmSourceLicense: sourceFeature.properties.source.license,
      flurraRunId: run.id,
      flurraRunName: run.officialName,
      officialDifficulty: run.officialDifficulty,
      effectiveMapDifficulty,
      accessRestriction: isRestrictedCanyon
        ? effectiveClassificationPolicy.accessRestriction
        : null,
      difficultyPresentationBasis: isRestrictedCanyon
        ? 'official-gated-area-restriction'
        : 'source-run-difficulty',
      classificationSourceMapRef: isRestrictedCanyon
        ? effectiveClassificationPolicy.sourceMapRef
        : null,
      canyonSubarea: canyonAssignment?.subarea ?? null,
      canyonAssignmentStatus: canyonAssignment?.status ?? null,
      verifiedMatchType,
      reviewExplanation,
      sourceMapRef,
    },
  });
}

for (const match of matchReport.exactNormalizedMatches) {
  for (const osmMatch of match.osmFeatures) {
    addVerifiedMatch({
      runId: match.flurraRun.id,
      osmMatch,
      verifiedMatchType: 'exact-or-normalized',
    });
  }
}

for (const match of manualReview.approvedMatches) {
  addVerifiedMatch({
    runId: match.flurraRunId,
    osmMatch: { osmRef: match.osmRef },
    verifiedMatchType: match.matchType,
    reviewExplanation: match.reviewExplanation,
    sourceMapRef: match.sourceMapRef,
  });
}

const liftFeatures = featureCollection.features
  .filter((feature) => feature.properties.kind === 'lift')
  .map((feature) => ({
    type: 'Feature',
    id: feature.id,
    geometry: feature.geometry,
    properties: {
      osmRef: feature.id,
      name: feature.properties.originalName,
      aerialway: feature.properties.aerialway,
    },
  }));

const coordinates = [];
function collectCoordinates(geometry) {
  if (!geometry) return;
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach(collectCoordinates);
    return;
  }

  function visit(value) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && value.every((item) => typeof item === 'number')) {
      coordinates.push(value);
      return;
    }
    value.forEach(visit);
  }
  visit(geometry.coordinates);
}

[...verifiedRunFeatures, ...liftFeatures].forEach((feature) => collectCoordinates(feature.geometry));
const longitudes = coordinates.map(([longitude]) => longitude);
const latitudes = coordinates.map(([, latitude]) => latitude);
const bounds = [
  [Math.min(...longitudes), Math.min(...latitudes)],
  [Math.max(...longitudes), Math.max(...latitudes)],
];

const runtimeData = {
  schemaVersion: 1,
  generatedFrom: {
    osmSnapshotTimestamp: featureCollection.metadata.osmBaseTimestamp,
    matchReportGeneratedAt: matchReport.generatedAt,
    manualReviewDate: manualReview.reviewedAt,
    policy: 'Exact/normalized matches and explicitly approved manual-reviewed aliases are rendered. Ambiguous candidates remain excluded.',
  },
  attribution: {
    text: featureCollection.metadata.attribution,
    license: featureCollection.metadata.license,
    url: featureCollection.metadata.licenseUrl,
  },
  bounds,
  verifiedRunCount: Object.keys(runGeometryIndex).length,
  verifiedRunFeatureCount: verifiedRunFeatures.length,
  liftFeatureCount: liftFeatures.length,
  runGeometryIndex,
  verifiedRuns: {
    type: 'FeatureCollection',
    features: verifiedRunFeatures,
  },
  lifts: {
    type: 'FeatureCollection',
    features: liftFeatures,
  },
};

await writeFile(
  resolve(dataDirectory, 'runtime-map-data.json'),
  `${JSON.stringify(runtimeData, null, 2)}\n`,
);

console.log(JSON.stringify({
  verifiedRunCount: runtimeData.verifiedRunCount,
  verifiedRunFeatureCount: runtimeData.verifiedRunFeatureCount,
  liftFeatureCount: runtimeData.liftFeatureCount,
  bounds: runtimeData.bounds,
}, null, 2));
