import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  heavenlyMapFeatures,
  heavenlyOfficialRuns,
} from '../../data/heavenlyOfficialRuns.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');
const outputDirectory = resolve(projectRoot, 'data/maps/heavenly');
const overpassEndpoint = 'https://overpass-api.de/api/interpreter';
const resortRelation = { type: 'relation', id: 12152028 };
const resortBounds = {
  south: 38.9130342,
  west: -119.9437925,
  north: 38.9678267,
  east: -119.8802563,
};
const bounds = [
  resortBounds.south,
  resortBounds.west,
  resortBounds.north,
  resortBounds.east,
].join(',');

const overpassQuery = `[out:json][timeout:180];
rel(${resortRelation.id});
map_to_area->.resort;
(
  nwr(area.resort)["piste:type"];
  way(area.resort)["aerialway"]["aerialway"!~"^(station|pylon)$"];
  relation["piste:type"](${bounds});
  relation["aerialway"](${bounds});
);
out tags geom;`;

const sourceAttribution = {
  provider: 'OpenStreetMap',
  attribution: '© OpenStreetMap contributors',
  license: 'ODbL 1.0',
  licenseUrl: 'https://www.openstreetmap.org/copyright',
};

const likelyRunCandidates = new Map([
  ['boundry chutes', {
    flurraRunIds: ['boundary-chutes'],
    reason: 'OSM appears to contain a spelling error in Boundary.',
  }],
  ["ramarah's", {
    flurraRunIds: ['ramarrahs'],
    reason: "OSM uses one r in Ramarah's; the supplied official map uses Ramarrah's.",
  }],
  ['bobs boulevard', {
    flurraRunIds: ['bobs-boulevard'],
    reason: "OSM omits the possessive apostrophe from Bob's.",
  }],
  ['stateline', {
    flurraRunIds: ['stateline-chute'],
    reason: 'OSM uses the shortened name Stateline.',
  }],
  ['promised land', {
    flurraRunIds: ['promised-land'],
    reason: 'OSM uses Promised Land while the supplied official map label is Promise Land.',
  }],
  ['widow maker', {
    flurraRunIds: ['lone-wolf'],
    reason: 'Widow Maker is retained in Flurra as a map-version-conflict name for Lone Wolf.',
  }],
  ['sky canyon', {
    flurraRunIds: ['sky', 'canyon'],
    reason: 'OSM has one composite label where the supplied official map has separate Sky and Canyon records.',
  }],
  ['upper powder bowl', {
    flurraRunIds: ['upper-powderbowl'],
    reason: 'OSM inserts a space and classifies this geometry as a snow park rather than downhill.',
  }],
  ['advanced round-a-bout', {
    flurraRunIds: ['round-a-bout'],
    reason: 'OSM appears to name an advanced segment of the broader Round-A-Bout run.',
  }],
  ['advanced california trail', {
    flurraRunIds: ['california-trail'],
    reason: 'OSM appears to name an advanced segment of the broader California Trail run.',
  }],
  ['upper bonanza', {
    flurraRunIds: ['bonanza'],
    reason: 'OSM appears to name an upper segment of Bonanza.',
  }],
]);

const likelyMapFeatureCandidates = new Map([
  ['mott canyon trail', {
    mapFeatureIds: ['mott-canyon'],
    reason: 'OSM maps a downhill way named Mott Canyon Trail; Flurra classifies Mott Canyon as a parent terrain area.',
  }],
]);

const expectedOsmDifficulty = {
  easier: 'easy',
  'more-difficult': 'intermediate',
  'most-difficult': 'advanced',
  'experts-only': 'expert',
};

function normalizeName(value) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[‘’ʼ]/g, "'")
    .trim()
    .replace(/\s+/g, ' ');
}

function osmReference(element) {
  return `${element.type}/${element.id}`;
}

function coordinatesForGeometry(geometry = []) {
  return geometry.map(({ lon, lat }) => [lon, lat]);
}

function geometryForElement(element) {
  if (element.type === 'node' && Number.isFinite(element.lon) && Number.isFinite(element.lat)) {
    return { type: 'Point', coordinates: [element.lon, element.lat] };
  }

  if (element.type === 'way' && element.geometry?.length) {
    const coordinates = coordinatesForGeometry(element.geometry);
    const first = coordinates[0];
    const last = coordinates.at(-1);
    const isClosed = coordinates.length >= 4
      && first[0] === last[0]
      && first[1] === last[1];

    if (isClosed && element.tags?.area === 'yes') {
      return { type: 'Polygon', coordinates: [coordinates] };
    }

    return { type: 'LineString', coordinates };
  }

  if (element.type === 'relation') {
    const memberLines = (element.members ?? [])
      .filter((member) => member.geometry?.length)
      .map((member) => ({
        type: 'LineString',
        coordinates: coordinatesForGeometry(member.geometry),
      }));

    if (memberLines.length) {
      return { type: 'GeometryCollection', geometries: memberLines };
    }
  }

  return null;
}

function featureKind(element) {
  if (element.tags?.['piste:type'] === 'downhill') return 'downhill';
  if (
    element.tags?.aerialway
    && !['station', 'pylon'].includes(element.tags.aerialway)
    && ['way', 'relation'].includes(element.type)
  ) return 'lift';
  if (element.tags?.['piste:type'] && element.tags?.name) return 'named-ski-terrain';
  return null;
}

function toGeoJsonFeature(element, osmBaseTimestamp) {
  const kind = featureKind(element);
  const ref = osmReference(element);

  return {
    type: 'Feature',
    id: ref,
    geometry: geometryForElement(element),
    properties: {
      kind,
      osmFeatureType: element.type,
      osmFeatureId: element.id,
      originalName: element.tags?.name ?? null,
      pisteDifficulty: element.tags?.['piste:difficulty'] ?? null,
      pisteType: element.tags?.['piste:type'] ?? null,
      aerialway: element.tags?.aerialway ?? null,
      tags: element.tags ?? {},
      relationMembers: element.type === 'relation'
        ? (element.members ?? []).map(({ type, ref: memberRef, role }) => ({
          type,
          ref: memberRef,
          role: role ?? '',
        }))
        : null,
      source: {
        ...sourceAttribution,
        featureUrl: `https://www.openstreetmap.org/${ref}`,
        snapshotTimestamp: osmBaseTimestamp,
      },
    },
  };
}

function compactOsmFeature(feature) {
  return {
    osmRef: feature.id,
    osmFeatureType: feature.properties.osmFeatureType,
    osmFeatureId: feature.properties.osmFeatureId,
    originalName: feature.properties.originalName,
    pisteDifficulty: feature.properties.pisteDifficulty,
    pisteType: feature.properties.pisteType,
    aerialway: feature.properties.aerialway,
    kind: feature.properties.kind,
  };
}

function compactFlurraRun(run) {
  return {
    id: run.id,
    officialName: run.officialName,
    officialDifficulty: run.officialDifficulty,
    mountainArea: run.mountainArea,
  };
}

function buildMatchReport(features, sourceMetadata) {
  const downhillFeatures = features.filter((feature) => feature.properties.kind === 'downhill');
  const namedDownhillFeatures = downhillFeatures.filter((feature) => feature.properties.originalName);
  const namedTerrainFeatures = features.filter((feature) => feature.properties.kind === 'named-ski-terrain');
  const liftFeatures = features.filter((feature) => feature.properties.kind === 'lift');
  const namedRunIndex = new Map();

  for (const feature of namedDownhillFeatures) {
    const key = normalizeName(feature.properties.originalName);
    if (!namedRunIndex.has(key)) namedRunIndex.set(key, []);
    namedRunIndex.get(key).push(feature);
  }

  const exactNormalizedMatches = [];
  const exactOsmRefs = new Set();
  const exactFlurraRunIds = new Set();

  for (const run of heavenlyOfficialRuns) {
    const osmFeatures = namedRunIndex.get(normalizeName(run.officialName)) ?? [];
    if (!osmFeatures.length) continue;

    exactFlurraRunIds.add(run.id);
    osmFeatures.forEach((feature) => exactOsmRefs.add(feature.id));
    exactNormalizedMatches.push({
      flurraRun: compactFlurraRun(run),
      osmFeatures: osmFeatures.map(compactOsmFeature),
      matchType: 'exact-or-normalized',
    });
  }

  const allNamedSkiFeatures = [...namedDownhillFeatures, ...namedTerrainFeatures];
  const likelyMatches = [];
  const likelyOsmRefs = new Set();
  const likelyFlurraRunIds = new Set();

  for (const feature of allNamedSkiFeatures) {
    if (exactOsmRefs.has(feature.id)) continue;
    const rule = likelyRunCandidates.get(normalizeName(feature.properties.originalName));
    if (!rule) continue;

    const candidateRuns = rule.flurraRunIds
      .map((id) => heavenlyOfficialRuns.find((run) => run.id === id))
      .filter(Boolean);
    if (!candidateRuns.length) continue;

    likelyOsmRefs.add(feature.id);
    candidateRuns.forEach((run) => likelyFlurraRunIds.add(run.id));
    likelyMatches.push({
      osmFeature: compactOsmFeature(feature),
      flurraCandidates: candidateRuns.map(compactFlurraRun),
      classification: candidateRuns.length > 1 ? 'ambiguous' : 'likely',
      reviewRequired: true,
      reason: rule.reason,
    });
  }

  const mapFeatureLinks = [];
  for (const feature of allNamedSkiFeatures) {
    const key = normalizeName(feature.properties.originalName);
    const exactMapFeatures = heavenlyMapFeatures.filter((item) => normalizeName(item.name) === key);
    const candidateRule = likelyMapFeatureCandidates.get(key);
    const candidateMapFeatures = candidateRule
      ? candidateRule.mapFeatureIds
        .map((id) => heavenlyMapFeatures.find((item) => item.id === id))
        .filter(Boolean)
      : [];
    const matches = exactMapFeatures.length ? exactMapFeatures : candidateMapFeatures;
    if (!matches.length) continue;

    mapFeatureLinks.push({
      osmFeature: compactOsmFeature(feature),
      flurraMapFeatures: matches.map(({ id, name, featureKind, mountainArea }) => ({
        id,
        name,
        featureKind,
        mountainArea,
      })),
      matchType: exactMapFeatures.length ? 'exact-or-normalized' : 'likely',
      reviewRequired: !exactMapFeatures.length,
      reason: exactMapFeatures.length
        ? 'OSM name matches a separately stored Flurra map feature.'
        : candidateRule.reason,
    });
  }

  const osmDownhillWithoutFlurraMatch = downhillFeatures
    .filter((feature) => !exactOsmRefs.has(feature.id) && !likelyOsmRefs.has(feature.id))
    .map(compactOsmFeature);

  const osmSkiFeaturesWithoutFlurraRunMatch = [
    ...downhillFeatures,
    ...namedTerrainFeatures,
  ]
    .filter((feature) => !exactOsmRefs.has(feature.id) && !likelyOsmRefs.has(feature.id))
    .map(compactOsmFeature);

  const flurraRunsWithoutOsmGeometry = heavenlyOfficialRuns
    .filter((run) => !exactFlurraRunIds.has(run.id) && !likelyFlurraRunIds.has(run.id))
    .map(compactFlurraRun);

  const candidateFeaturesByRun = new Map();
  for (const match of exactNormalizedMatches) {
    candidateFeaturesByRun.set(match.flurraRun.id, [...match.osmFeatures]);
  }
  for (const match of likelyMatches) {
    for (const run of match.flurraCandidates) {
      const existing = candidateFeaturesByRun.get(run.id) ?? [];
      existing.push(match.osmFeature);
      candidateFeaturesByRun.set(run.id, existing);
    }
  }

  const oneFlurraRunToMultipleOsmFeatures = [...candidateFeaturesByRun.entries()]
    .filter(([, osmFeatures]) => new Set(osmFeatures.map((feature) => feature.osmRef)).size > 1)
    .map(([runId, osmFeatures]) => ({
      flurraRun: compactFlurraRun(heavenlyOfficialRuns.find((run) => run.id === runId)),
      osmFeatures: [...new Map(osmFeatures.map((feature) => [feature.osmRef, feature])).values()],
      reviewRequired: true,
    }));

  const osmRelationsRepresentingCompleteRuns = downhillFeatures
    .filter((feature) => feature.properties.osmFeatureType === 'relation')
    .map(compactOsmFeature);

  const difficultyComparisons = [];
  for (const match of exactNormalizedMatches) {
    for (const osmFeature of match.osmFeatures) {
      difficultyComparisons.push({
        flurraRun: match.flurraRun,
        osmFeature,
        expectedOsmDifficulty: expectedOsmDifficulty[match.flurraRun.officialDifficulty],
        comparison: osmFeature.pisteDifficulty === null
          ? 'missing-osm-difficulty'
          : osmFeature.pisteDifficulty === expectedOsmDifficulty[match.flurraRun.officialDifficulty]
            ? 'consistent'
            : 'different',
        matchType: match.matchType,
      });
    }
  }
  for (const match of likelyMatches) {
    for (const run of match.flurraCandidates) {
      difficultyComparisons.push({
        flurraRun: run,
        osmFeature: match.osmFeature,
        expectedOsmDifficulty: expectedOsmDifficulty[run.officialDifficulty],
        comparison: match.osmFeature.pisteDifficulty === null
          ? 'missing-osm-difficulty'
          : match.osmFeature.pisteDifficulty === expectedOsmDifficulty[run.officialDifficulty]
            ? 'consistent'
            : 'different',
        matchType: match.classification,
      });
    }
  }
  const difficultyDifferences = difficultyComparisons
    .filter((item) => item.comparison === 'different');
  const missingOsmDifficultiesForMatchedFeatures = difficultyComparisons
    .filter((item) => item.comparison === 'missing-osm-difficulty');

  const exactMatchedOsmFeatureCount = exactNormalizedMatches
    .reduce((total, match) => total + match.osmFeatures.length, 0);
  const namedUnmatchedDownhillCount = osmDownhillWithoutFlurraMatch
    .filter((feature) => feature.originalName).length;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceSnapshot: sourceMetadata,
    comparisonRules: {
      exactNormalization: [
        'Unicode normalization (NFKC)',
        'case folding',
        'curly/straight apostrophe normalization',
        'leading/trailing whitespace removal',
        'internal whitespace collapse',
      ],
      likelyMatches: 'Explicit review rules only; no general fuzzy matching is applied.',
      mappingModel: 'Candidate many-to-many links are stored in this report; no OSM ID is written onto a Flurra run.',
    },
    summary: {
      flurraProvisionalRunRecords: heavenlyOfficialRuns.length,
      downhillOsmFeatures: downhillFeatures.length,
      namedDownhillOsmFeatures: namedDownhillFeatures.length,
      uniqueNamedDownhillLabels: namedRunIndex.size,
      exactOrNormalizedMatchedFlurraRuns: exactNormalizedMatches.length,
      exactOrNormalizedMatchedOsmFeatures: exactMatchedOsmFeatureCount,
      likelyOrAmbiguousOsmFeatures: likelyMatches.length,
      likelyOrAmbiguousCandidateLinks: likelyMatches.reduce(
        (total, match) => total + match.flurraCandidates.length,
        0,
      ),
      flurraRunsWithoutOsmGeometry: flurraRunsWithoutOsmGeometry.length,
      downhillOsmFeaturesWithoutFlurraMatch: osmDownhillWithoutFlurraMatch.length,
      osmSkiFeaturesWithoutFlurraRunMatch: osmSkiFeaturesWithoutFlurraRunMatch.length,
      namedDownhillOsmFeaturesWithoutFlurraMatch: namedUnmatchedDownhillCount,
      unnamedDownhillOsmFeaturesWithoutFlurraMatch:
        osmDownhillWithoutFlurraMatch.length - namedUnmatchedDownhillCount,
      oneFlurraRunToMultipleOsmFeatureCases: oneFlurraRunToMultipleOsmFeatures.length,
      downhillRelations: osmRelationsRepresentingCompleteRuns.length,
      matchedFeatureDifficultyDifferences: difficultyDifferences.length,
      matchedFeaturesMissingOsmDifficulty: missingOsmDifficultiesForMatchedFeatures.length,
      lifts: liftFeatures.length,
      namedLifts: liftFeatures.filter((feature) => feature.properties.originalName).length,
      namedNonDownhillSkiTerrainFeatures: namedTerrainFeatures.length,
    },
    exactNormalizedMatches,
    likelyMatches,
    mapFeatureLinks,
    osmDownhillWithoutFlurraMatch,
    osmSkiFeaturesWithoutFlurraRunMatch,
    flurraRunsWithoutOsmGeometry,
    oneFlurraRunToMultipleOsmFeatures,
    osmRelationsRepresentingCompleteRuns,
    difficultyDifferences,
    missingOsmDifficultiesForMatchedFeatures,
    lifts: liftFeatures.map(compactOsmFeature),
  };
}

async function main() {
  const body = new URLSearchParams({ data: overpassQuery });
  const response = await fetch(overpassEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': 'Flurra OSM data spike (github.com/emm03/Flurra)',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status} ${response.statusText}`);
  }

  const overpassData = await response.json();
  const osmBaseTimestamp = overpassData.osm3s?.timestamp_osm_base ?? null;
  const importedElements = overpassData.elements.filter((element) => featureKind(element));
  const features = importedElements
    .map((element) => toGeoJsonFeature(element, osmBaseTimestamp))
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  const sourceMetadata = {
    ...sourceAttribution,
    overpassEndpoint,
    osmBaseTimestamp,
    retrievedAt: new Date().toISOString(),
    resortBoundary: {
      ...resortRelation,
      osmUrl: `https://www.openstreetmap.org/${resortRelation.type}/${resortRelation.id}`,
      bounds: resortBounds,
    },
    overpassQuery,
  };
  const featureCollection = {
    type: 'FeatureCollection',
    schemaVersion: 1,
    metadata: sourceMetadata,
    features,
  };
  const matchReport = buildMatchReport(features, sourceMetadata);

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      resolve(outputDirectory, 'osm-features.geojson'),
      `${JSON.stringify(featureCollection, null, 2)}\n`,
    ),
    writeFile(
      resolve(outputDirectory, 'match-report.json'),
      `${JSON.stringify(matchReport, null, 2)}\n`,
    ),
  ]);

  console.log(JSON.stringify(matchReport.summary, null, 2));
}

await main();
