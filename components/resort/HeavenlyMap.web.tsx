import mlcontour from 'maplibre-contour';
import * as maplibregl from 'maplibre-gl';
import {
  type FilterSpecification,
  LngLatBounds,
  Map as MapLibreMap,
  type MapLayerMouseEvent,
  NavigationControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { heavenlyMapData } from '@/data/heavenlyMap';
import { heavenlyOfficialRuns } from '@/data/heavenlyOfficialRuns';
import { colors, fonts } from '@/theme';
import {
  createHeavenlyWinterStyle,
  heavenlyLocalFallbackStyle,
  OSM_GEOMETRY_ATTRIBUTION,
} from './map/heavenlyMapStyle';

type HeavenlyMapProps = {
  compact: boolean;
  selectedRunId: string | null;
  onSelectRun: (runId: string | null) => void;
  onTerrainAvailabilityChange?: (available: boolean) => void;
};

type HeavenlyMapMode = 'resort' | 'topographic';

type TerrainProviderStatus = 'loading' | 'available' | 'unavailable';

type CameraOperation = 'fit' | 'reset' | 'selected-run-focus';

type ProviderFailureMode = 'terrain' | 'vector' | null;

const runLayerIds = [
  'verified-run-hitbox',
  'verified-green',
  'verified-blue',
  'verified-black',
  'verified-expert',
  'selected-run',
];

const RESORT_VIEW_CAMERA = {
  bearing: 155,
  pitch: 48,
  exaggeration: 1.15,
};

const LANDMARK_RUN_IDS = new Set([
  'ridge-run',
  'skyline-trail',
  'california-trail',
  'maggies',
  'orion',
  'big-dipper',
  'stagecoach',
  'galaxy',
  'gunbarrel',
  'world-cup',
  'east-bowl',
  'boulder-bowl',
  'easy-street',
  'boundary-chutes',
  'outer-limits',
  'snake-eyes',
  'hully-gully',
]);

const CANYON_SUBAREA_LABELS: Record<string, string> = {
  'mott-canyon': 'MOTT CANYON',
  'killebrew-canyon': 'KILLEBREW CANYON',
};

const MAJOR_LIFT_NAMES = [
  'Heavenly Gondola',
  'Sky Express',
  'Canyon Express',
  'Dipper Express',
  'Comet Express',
  'Stagecoach Express',
  'Gunbarrel Express',
];

const VERIFIED_BASE_NAMES = [
  'Heavenly Village',
  'California Lodge',
  'Stagecoach Lodge',
  'Boulder Lodge',
  'Tamarack Lodge',
  'East Peak Lodge',
  'Lakeview Lodge',
];

const DIFFICULTY_SYMBOLS: Record<string, string> = {
  easier: '●',
  'more-difficult': '■',
  'most-difficult': '◆',
  'experts-only': '◆◆',
};

const AREA_LABEL_OFFSETS: Record<string, [number, number]> = {
  'Mott & Killebrew Canyons': [-3.4, -1.4],
  'Galaxy / Stagecoach': [-2.4, 2.2],
  'Boulder / North Bowl': [-1.9, 2.8],
  'East Peak / Dipper': [-2.6, 1.2],
  'Sky / Canyon': [0.1, -1.4],
  California: [2.3, 0.1],
  'Top of Gondola': [2.2, 2.1],
};

const AREA_LABEL_PRIORITIES: Record<string, number> = {
  'Sky / Canyon': 1,
  California: 2,
  'East Peak / Dipper': 3,
  'Galaxy / Stagecoach': 4,
  'Boulder / North Bowl': 5,
  'Mott & Killebrew Canyons': 6,
  'Top of Gondola': 7,
};

const selectedDifficultyColor = [
  'match',
  ['get', 'effectiveMapDifficulty'],
  'easier', '#14834f',
  'more-difficult', '#086fa9',
  'most-difficult', '#152b26',
  'experts-only', '#050a08',
  colors.deep,
] as any;

let sharedDemSource: InstanceType<typeof mlcontour.DemSource> | null = null;

function getDemSource() {
  if (!sharedDemSource) {
    sharedDemSource = new mlcontour.DemSource({
      url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      encoding: 'terrarium',
      maxzoom: 15,
      worker: true,
      cacheSize: 80,
      timeoutMs: 10000,
    });
    sharedDemSource.setupMaplibre(maplibregl);
  }
  return sharedDemSource;
}

type Coordinate = [number, number];
type LineCoordinates = Coordinate[];

const runCatalogById = new Map(heavenlyOfficialRuns.map((run) => [run.id, run]));

function collectLineParts(geometry: any): LineCoordinates[] {
  if (!geometry) return [];
  if (geometry.type === 'LineString') return [geometry.coordinates as LineCoordinates];
  if (geometry.type === 'MultiLineString') return geometry.coordinates as LineCoordinates[];
  if (geometry.type === 'GeometryCollection') {
    return (geometry.geometries ?? []).flatMap((child: any) => collectLineParts(child));
  }
  return [];
}

function lineLength(coordinates: LineCoordinates) {
  let length = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const [previousLongitude, previousLatitude] = coordinates[index - 1];
    const [longitude, latitude] = coordinates[index];
    const latitudeScale = Math.cos((latitude * Math.PI) / 180);
    length += Math.hypot(
      (longitude - previousLongitude) * latitudeScale,
      latitude - previousLatitude,
    );
  }
  return length;
}

function lineMidpoint(coordinates: LineCoordinates): Coordinate {
  const totalLength = lineLength(coordinates);
  if (!totalLength) return coordinates[Math.floor(coordinates.length / 2)] ?? [0, 0];
  let travelled = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const previous = coordinates[index - 1];
    const current = coordinates[index];
    const segmentLength = lineLength([previous, current]);
    if (travelled + segmentLength >= totalLength / 2) {
      const progress = (totalLength / 2 - travelled) / segmentLength;
      return [
        previous[0] + (current[0] - previous[0]) * progress,
        previous[1] + (current[1] - previous[1]) * progress,
      ];
    }
    travelled += segmentLength;
  }
  return coordinates[coordinates.length - 1];
}

function createRunSources() {
  const enrichedFeatures: any[] = heavenlyMapData.verifiedRuns.features.map((feature) => {
    const runId = String(feature.properties.flurraRunId);
    const run = runCatalogById.get(runId);
    return {
      ...feature,
      properties: {
        ...feature.properties,
        mountainArea: run?.mountainArea ?? null,
        difficultySymbol: DIFFICULTY_SYMBOLS[String(feature.properties.effectiveMapDifficulty)] ?? '',
        labelPriority: LANDMARK_RUN_IDS.has(runId) ? 1 : 2,
      },
    };
  });

  const labelFeatureByRun = new Map<string, any>();
  for (const feature of enrichedFeatures) {
    const runId = String(feature.properties.flurraRunId);
    for (const coordinates of collectLineParts(feature.geometry)) {
      const current = labelFeatureByRun.get(runId);
      const length = lineLength(coordinates);
      if (!current || length > current.properties.displayLength) {
        labelFeatureByRun.set(runId, {
          type: 'Feature',
          id: `label/${runId}`,
          geometry: { type: 'LineString', coordinates },
          properties: { ...feature.properties, displayLength: length },
        });
      }
    }
  }

  const areaCoordinates = new Map<string, Coordinate[]>();
  const canyonCoordinates = new Map<string, Coordinate[]>();
  for (const feature of enrichedFeatures) {
    const mountainArea = String(feature.properties.mountainArea ?? '');
    if (mountainArea && mountainArea !== 'Mott & Killebrew Canyons') {
      const coordinates = areaCoordinates.get(mountainArea) ?? [];
      for (const line of collectLineParts(feature.geometry)) coordinates.push(...line);
      areaCoordinates.set(mountainArea, coordinates);
    }
    const canyonSubarea = String(feature.properties.canyonSubarea ?? '');
    if (CANYON_SUBAREA_LABELS[canyonSubarea]) {
      const coordinates = canyonCoordinates.get(canyonSubarea) ?? [];
      for (const line of collectLineParts(feature.geometry)) coordinates.push(...line);
      canyonCoordinates.set(canyonSubarea, coordinates);
    }
  }

  const areaFeatures = [...areaCoordinates.entries()].map(([mountainArea, coordinates]) => {
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);
    return {
      type: 'Feature' as const,
      id: `area/${mountainArea}`,
      geometry: {
        type: 'Point' as const,
        coordinates: [
          (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
          (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        ],
      },
      properties: {
        mountainArea,
        labelOffset: AREA_LABEL_OFFSETS[mountainArea] ?? [0, 0],
        labelPriority: AREA_LABEL_PRIORITIES[mountainArea] ?? 99,
      },
    };
  });

  const landmarkFeatures = [...labelFeatureByRun.values()]
    .filter((feature) => feature.properties.labelPriority === 1)
    .map((feature) => ({
      type: 'Feature' as const,
      id: `landmark/${feature.properties.flurraRunId}`,
      geometry: {
        type: 'Point' as const,
        coordinates: lineMidpoint(feature.geometry.coordinates),
      },
      properties: feature.properties,
    }));
  const pointFeatures = [...labelFeatureByRun.values()].map((feature) => ({
    type: 'Feature' as const,
    id: `point/${feature.properties.flurraRunId}`,
    geometry: {
      type: 'Point' as const,
      coordinates: lineMidpoint(feature.geometry.coordinates),
    },
    properties: feature.properties,
  }));

  const canyonFeatures = [...canyonCoordinates.entries()].map(([subarea, coordinates]) => {
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);
    const minLongitude = Math.min(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLongitude = Math.max(...longitudes);
    const maxLatitude = Math.max(...latitudes);
    const longitudeSpan = maxLongitude - minLongitude;
    const latitudeSpan = maxLatitude - minLatitude;
    // Anchors are reproducibly derived from each verified run cluster's extent.
    // The small opposing biases keep both names associated with their own
    // canyon without claiming or fabricating a boundary polygon.
    const isKillebrew = subarea === 'killebrew-canyon';
    const labelCoordinate = isKillebrew
      ? [minLongitude + longitudeSpan * 0.25, minLatitude + latitudeSpan * 0.38]
      : [minLongitude + longitudeSpan * 0.75, minLatitude + latitudeSpan * 0.62];
    return {
      type: 'Feature' as const,
      id: `canyon/${subarea}`,
      geometry: {
        type: 'Point' as const,
        coordinates: labelCoordinate,
      },
      properties: {
        subarea,
        canyonName: CANYON_SUBAREA_LABELS[subarea],
        minLongitude,
        minLatitude,
        maxLongitude,
        maxLatitude,
        labelOffsetWhole: isKillebrew ? [0.3, 0.2] : [0.3, -0.2],
        labelOffsetClose: [0.15, 0],
        textAnchor: 'left',
        areaRestriction: 'EXPERTS ONLY · GATED TERRAIN',
        assignmentMethod: 'manual-reviewed official-map labels; anchor derived from an interior-biased point within verified OSM run extents',
      },
    };
  });

  return {
    runs: { type: 'FeatureCollection' as const, features: enrichedFeatures },
    labels: { type: 'FeatureCollection' as const, features: [...labelFeatureByRun.values()] },
    landmarks: { type: 'FeatureCollection' as const, features: landmarkFeatures },
    points: { type: 'FeatureCollection' as const, features: pointFeatures },
    areas: { type: 'FeatureCollection' as const, features: areaFeatures },
    canyons: { type: 'FeatureCollection' as const, features: canyonFeatures },
  };
}

const runSources = createRunSources();

function coordinateKey([longitude, latitude]: Coordinate) {
  return `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
}

function createRunAdjacencyIndex() {
  const runsByCoordinate = new Map<string, Set<string>>();
  for (const feature of runSources.runs.features) {
    const runId = String(feature.properties.flurraRunId);
    for (const line of collectLineParts(feature.geometry)) {
      for (const coordinate of line) {
        const key = coordinateKey(coordinate);
        const runs = runsByCoordinate.get(key) ?? new Set<string>();
        runs.add(runId);
        runsByCoordinate.set(key, runs);
      }
    }
  }

  const adjacency = new Map<string, Set<string>>();
  for (const runs of runsByCoordinate.values()) {
    if (runs.size < 2) continue;
    for (const runId of runs) {
      const adjacent = adjacency.get(runId) ?? new Set<string>();
      for (const otherRunId of runs) if (otherRunId !== runId) adjacent.add(otherRunId);
      adjacency.set(runId, adjacent);
    }
  }
  return adjacency;
}

const runAdjacencyIndex = createRunAdjacencyIndex();

function allRunGeometryBounds() {
  const coordinates: [number, number][] = [];

  function collect(value: unknown) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && value.every((item) => typeof item === 'number')) {
      coordinates.push(value as [number, number]);
      return;
    }
    value.forEach(collect);
  }

  for (const feature of runSources.runs.features) {
    if (feature.geometry.type === 'GeometryCollection') {
      feature.geometry.geometries?.forEach((geometry: any) => collect(geometry.coordinates));
    } else {
      collect(feature.geometry.coordinates);
    }
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return new LngLatBounds(
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  );
}

function numericSearchParam(name: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const rawValue = new URLSearchParams(window.location.search).get(name);
  if (rawValue === null || rawValue.trim() === '') return fallback;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumericSearchParam(name: string) {
  if (typeof window === 'undefined') return null;
  const rawValue = new URLSearchParams(window.location.search).get(name);
  if (rawValue === null || rawValue.trim() === '') return null;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function resortCamera() {
  return {
    bearing: numericSearchParam('bearing', RESORT_VIEW_CAMERA.bearing),
    pitch: numericSearchParam('pitch', RESORT_VIEW_CAMERA.pitch),
    exaggeration: numericSearchParam('exaggeration', RESORT_VIEW_CAMERA.exaggeration),
  };
}

function initialMapMode(): HeavenlyMapMode {
  if (typeof window === 'undefined') return 'resort';
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'topographic' || params.get('terrain') === 'fallback') {
    return 'topographic';
  }
  return 'resort';
}

function expandedCameraBounds(bounds: LngLatBounds) {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const longitudePadding = Math.max((northEast.lng - southWest.lng) * 0.65, 0.025);
  const latitudePadding = Math.max((northEast.lat - southWest.lat) * 0.65, 0.025);
  return new LngLatBounds(
    [southWest.lng - longitudePadding, southWest.lat - latitudePadding],
    [northEast.lng + longitudePadding, northEast.lat + latitudePadding],
  );
}

function wholeMountainPadding(map: MapLibreMap, resortView: boolean, basePadding: number) {
  const canvas = map.getCanvas();
  const compact = canvas.clientWidth < 600;
  if (compact) {
    const safePadding = 48;
    return { top: safePadding, right: safePadding, bottom: safePadding, left: safePadding };
  }
  // Pitched, elevated terrain projects beyond its flat geographic bounds, so
  // Resort View gets a modest vertical safety allowance beyond the 10% casing
  // and label margin used for the north-up view.
  const horizontalSafeZone = Math.round(Math.max(basePadding, canvas.clientWidth * (resortView ? 0.1 : 0.09)));
  const verticalSafeZone = Math.round(Math.max(basePadding, canvas.clientHeight * (resortView ? 0.14 : 0.09)));
  return {
    top: verticalSafeZone,
    right: horizontalSafeZone,
    bottom: verticalSafeZone,
    left: horizontalSafeZone,
  };
}

function selectedRunPadding(map: MapLibreMap) {
  const canvas = map.getCanvas();
  const compact = canvas.clientWidth < 600;
  const safePadding = compact
    ? 48
    : Math.round(Math.min(104, Math.max(72, Math.min(canvas.clientWidth, canvas.clientHeight) * 0.11)));
  return {
    top: safePadding,
    right: safePadding,
    bottom: safePadding,
    left: safePadding,
  };
}

function focusRunBounds(
  map: MapLibreMap,
  bounds: LngLatBounds,
  mode: HeavenlyMapMode,
  terrainAvailable: boolean,
  duration: number,
) {
  const resortView = mode === 'resort' && terrainAvailable && Boolean(map.getSource('terrain-dem'));
  const camera = resortCamera();
  map.stop();
  if (resortView) {
    // Calculate against the final bearing and pitch so the selected geometry
    // stays inside the balanced screen-space safe zone after terrain tilts.
    // cameraForBounds avoids mutating terrain state while the fit is computed.
    const focusCamera = map.cameraForBounds(bounds, {
      padding: selectedRunPadding(map),
      bearing: camera.bearing,
      pitch: camera.pitch,
      offset: [0, 0],
      maxZoom: 12.45,
    });
    if (focusCamera) {
      map.easeTo({
        center: focusCamera.center,
        zoom: Math.min(focusCamera.zoom ?? map.getZoom(), 12.45),
        bearing: camera.bearing,
        pitch: camera.pitch,
        duration,
      });
      return;
    }
  }
  map.fitBounds(bounds, {
    padding: selectedRunPadding(map),
    duration,
    maxZoom: 14.45,
    bearing: 0,
    pitch: 0,
  });
}

function setLayerVisibility(map: MapLibreMap, layerId: string, visible: boolean) {
  if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

function applyTerrainTreatment(map: MapLibreMap, mode: HeavenlyMapMode) {
  const resortView = mode === 'resort';

  if (map.getLayer('winter-open-land')) {
    map.setPaintProperty('winter-open-land', 'fill-color', resortView ? '#edf4f0' : '#dbe3d7');
    map.setPaintProperty('winter-open-land', 'fill-outline-color', resortView ? '#edf4f0' : '#dbe3d7');
    map.setPaintProperty('winter-open-land', 'fill-opacity', resortView ? 0.08 : 0.2);
  }
  if (map.getLayer('winter-forest')) {
    map.setPaintProperty('winter-forest', 'fill-color', resortView ? '#315f4f' : '#bfd0c6');
    map.setPaintProperty('winter-forest', 'fill-outline-color', resortView ? '#315f4f' : '#bfd0c6');
    map.setPaintProperty('winter-forest', 'fill-opacity', resortView
      ? ['interpolate', ['linear'], ['zoom'], 10, 0.07, 12, 0.11, 14, 0.18, 16, 0.3]
      : ['interpolate', ['linear'], ['zoom'], 10, 0.42, 14, 0.5]);
  }
  if (map.getLayer('winter-water')) {
    map.setPaintProperty('winter-water', 'fill-color', resortView ? '#7ba7b7' : '#a9cfda');
    map.setPaintProperty('winter-water', 'fill-opacity', resortView ? 0.56 : 0.82);
  }
  if (map.getLayer('terrain-hillshade')) {
    map.setPaintProperty('terrain-hillshade', 'hillshade-shadow-color', resortView ? '#294f5d' : '#42645f');
    map.setPaintProperty('terrain-hillshade', 'hillshade-highlight-color', resortView ? '#fffff8' : '#fffdf5');
    map.setPaintProperty('terrain-hillshade', 'hillshade-accent-color', resortView ? '#67828b' : '#6f8d87');
    map.setPaintProperty('terrain-hillshade', 'hillshade-exaggeration', resortView ? 0.68 : 0.44);
  }
  if (map.getLayer('major-contours')) {
    map.setPaintProperty('major-contours', 'line-opacity', resortView
      ? ['interpolate', ['linear'], ['zoom'], 11, 0.025, 14, 0.09, 16, 0.16]
      : 0.34);
  }
  if (map.getLayer('winter-waterways')) {
    map.setPaintProperty('winter-waterways', 'line-opacity', resortView ? 0.2 : 0.48);
  }
}

function applyRunAndLiftTreatment(map: MapLibreMap, mode: HeavenlyMapMode) {
  const resortView = mode === 'resort';
  const runWidth = resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.05, 13, 2.8, 15, 4.35]
    : 3.5;
  const expertWidth = resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.1, 13, 2.9, 15, 4.45]
    : 5.2;

  map.setPaintProperty('verified-run-casing', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 4.4, 13, 5.6, 15, 8.1]
    : 6);
  for (const layerId of ['verified-green', 'verified-blue', 'verified-black']) {
    map.setPaintProperty(layerId, 'line-width', runWidth);
  }
  map.setPaintProperty('verified-expert', 'line-width', expertWidth);
  setLayerVisibility(map, 'verified-expert-markers', !resortView);

  for (const layerId of [
    'major-run-labels',
    'area-run-labels',
    'selected-run-label',
    'black-difficulty-markers',
    'expert-difficulty-markers',
    'mountain-area-labels',
    'expert-canyon-labels',
    'canyon-run-labels',
    'major-lift-labels',
    'all-lift-labels',
    'verified-peak-labels',
    'verified-base-labels',
  ]) setLayerVisibility(map, layerId, resortView);

  setLayerVisibility(map, 'heavenly-lifts-topographic', !resortView);
  for (const layerId of ['heavenly-lift-casing', 'heavenly-lifts', 'heavenly-gondola-casing', 'heavenly-gondola']) {
    setLayerVisibility(map, layerId, resortView);
  }

  map.setPaintProperty('selected-run-halo', 'line-opacity', resortView ? 1 : 0);
  map.setPaintProperty('selected-run-casing', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 7.1, 13, 9.2, 15, 12.5]
    : 10);
  map.setPaintProperty('selected-run', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.45, 13, 3.35, 15, 5.15]
    : 6.5);
  map.setPaintProperty('selected-run', 'line-color', resortView ? selectedDifficultyColor : colors.lime);
}

function terrainIsApplied(map: MapLibreMap) {
  return map.getTerrain()?.source === 'terrain-dem';
}

function cameraMatchesMode(map: MapLibreMap, mode: HeavenlyMapMode) {
  const camera = resortCamera();
  const expectedBearing = mode === 'resort' ? camera.bearing : 0;
  const expectedPitch = mode === 'resort' ? camera.pitch : 0;
  const bearingDelta = Math.abs((((map.getBearing() - expectedBearing) + 540) % 360) - 180);
  return bearingDelta < 0.25 && Math.abs(map.getPitch() - expectedPitch) < 0.25;
}

function applyMapPresentation(
  map: MapLibreMap,
  mode: HeavenlyMapMode,
  terrainAvailable: boolean,
) {
  const resortView = mode === 'resort'
    && terrainAvailable
    && Boolean(map.getSource('terrain-dem'));

  if (mode === 'resort' && !resortView) return false;

  const camera = resortCamera();
  map.stop();
  map.setTerrain(resortView ? { source: 'terrain-dem', exaggeration: camera.exaggeration } : null);
  applyTerrainTreatment(map, resortView ? 'resort' : 'topographic');
  applyRunAndLiftTreatment(map, resortView ? 'resort' : 'topographic');
  return resortView ? terrainIsApplied(map) : !map.getTerrain();
}

function fitWholeMountainCamera(
  map: MapLibreMap,
  mode: HeavenlyMapMode,
  bounds: LngLatBounds,
  basePadding: number,
  animate: boolean,
) {
  const resortView = mode === 'resort';
  const camera = resortCamera();
  const terrain = resortView ? { source: 'terrain-dem', exaggeration: camera.exaggeration } : null;

  map.stop();
  // Calculate every whole-mountain camera against the same flat transform. The
  // terrain is restored synchronously before MapLibre can paint another frame,
  // so Fit remains a camera operation rather than a view-mode operation.
  if (resortView) map.setTerrain(null);
  const overrideLongitude = optionalNumericSearchParam('longitude');
  const overrideLatitude = optionalNumericSearchParam('latitude');
  const overrideZoom = optionalNumericSearchParam('zoom');
  if (resortView && overrideLongitude !== null && overrideLatitude !== null && overrideZoom !== null) {
    map.setTerrain(terrain);
    map.jumpTo({
      center: [overrideLongitude, overrideLatitude],
      zoom: overrideZoom,
      bearing: camera.bearing,
      pitch: camera.pitch,
    });
    return true;
  }
  // Normalize the transform before calculating the whole-mountain fit.
  // MapLibre's bounds camera can otherwise produce a different result when Fit
  // is invoked from an already pitched terrain camera than it does at startup.
  map.jumpTo({ bearing: 0, pitch: 0 });
  const targetCamera = map.cameraForBounds(bounds, {
    padding: wholeMountainPadding(map, resortView, basePadding),
    maxZoom: resortView ? 13.1 : 13.3,
    bearing: resortView ? camera.bearing : 0,
    pitch: resortView ? camera.pitch : 0,
    offset: [0, 0],
  });
  if (resortView) map.setTerrain(terrain);
  if (!targetCamera) return false;
  const cameraOptions = {
    center: targetCamera.center,
    zoom: Math.min(targetCamera.zoom ?? map.getZoom(), resortView ? 13.1 : 13.3),
    bearing: resortView ? camera.bearing : 0,
    pitch: resortView ? camera.pitch : 0,
    duration: animate ? 480 : 0,
  };
  if (animate) map.easeTo(cameraOptions);
  else map.jumpTo(cameraOptions);
  return true;
}

function addMajorContours(map: MapLibreMap, demSource: ReturnType<typeof getDemSource>) {
  map.addSource('major-contours', {
    type: 'vector',
    tiles: [demSource.contourProtocolUrl({
      multiplier: 3.28084,
      thresholds: {
        11: [200, 1000],
        12: [100, 500],
        14: [50, 200],
        15: [20, 100],
      },
      contourLayer: 'contours',
      elevationKey: 'ele',
      levelKey: 'level',
      extent: 4096,
      buffer: 1,
    })],
    maxzoom: 15,
  });
  map.addLayer({
    id: 'major-contours',
    type: 'line',
    source: 'major-contours',
    'source-layer': 'contours',
    filter: ['>', ['get', 'level'], 0],
    paint: {
      'line-color': '#5f7b75',
      'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.55, 15, 1.05],
      'line-opacity': 0.34,
    },
  });
}

function geometryBoundsForRunIds(runIds: Iterable<string>) {
  const runIdSet = new Set(runIds);
  const coordinates: [number, number][] = [];

  function collect(value: unknown) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && value.every((item) => typeof item === 'number')) {
      coordinates.push(value as [number, number]);
      return;
    }
    value.forEach(collect);
  }

  for (const feature of runSources.runs.features) {
    if (!runIdSet.has(String(feature.properties.flurraRunId))) continue;
    if (feature.geometry.type === 'GeometryCollection') {
      feature.geometry.geometries?.forEach((geometry: any) => collect(geometry.coordinates));
    } else {
      collect(feature.geometry.coordinates);
    }
  }

  if (!coordinates.length) return null;
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return new LngLatBounds(
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  );
}

export function HeavenlyMap({ compact, selectedRunId, onSelectRun, onTerrainAvailabilityChange }: HeavenlyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const selectRunRef = useRef(onSelectRun);
  const terrainAvailabilityCallbackRef = useRef(onTerrainAvailabilityChange);
  const initialBoundsRef = useRef<LngLatBounds | null>(null);
  const initialPaddingRef = useRef(48);
  const initialRequestedMapModeRef = useRef<HeavenlyMapMode>(initialMapMode());
  const requestedMapModeRef = useRef<HeavenlyMapMode>(initialRequestedMapModeRef.current);
  const effectiveMapModeRef = useRef<HeavenlyMapMode | null>(null);
  const terrainProviderStatusRef = useRef<TerrainProviderStatus>('loading');
  const cameraOperationRef = useRef<CameraOperation | null>(null);
  const cameraSequenceRef = useRef(0);
  const pendingCameraFrameRef = useRef<number | null>(null);
  const selectedRunIdRef = useRef(selectedRunId);
  const [failed, setFailed] = useState(false);
  const [layersReady, setLayersReady] = useState(false);
  const [requestedMapMode, setRequestedMapMode] = useState<HeavenlyMapMode>(initialRequestedMapModeRef.current);
  const [effectiveMapMode, setEffectiveMapMode] = useState<HeavenlyMapMode | null>(null);
  const [terrainProviderStatus, setTerrainProviderStatus] = useState<TerrainProviderStatus>('loading');
  const ready = layersReady && effectiveMapMode !== null;
  const terrainLimited = terrainProviderStatus === 'unavailable';

  selectedRunIdRef.current = selectedRunId;

  useEffect(() => {
    selectRunRef.current = onSelectRun;
  }, [onSelectRun]);

  useEffect(() => {
    terrainAvailabilityCallbackRef.current = onTerrainAvailabilityChange;
  }, [onTerrainAvailabilityChange]);

  useEffect(() => {
    requestedMapModeRef.current = requestedMapMode;
  }, [requestedMapMode]);

  useEffect(() => {
    effectiveMapModeRef.current = effectiveMapMode;
  }, [effectiveMapMode]);

  useEffect(() => {
    terrainProviderStatusRef.current = terrainProviderStatus;
  }, [terrainProviderStatus]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const forceTerrainFallback = params.get('terrain') === 'fallback';
    const simulatedProviderFailure = (
      params.get('providerFailure') === 'terrain' || params.get('providerFailure') === 'vector'
        ? params.get('providerFailure')
        : null
    ) as ProviderFailureMode;
    const initialBounds = allRunGeometryBounds();
    const initialPadding = containerRef.current.clientWidth < 600 ? 34 : 48;
    initialBoundsRef.current = initialBounds;
    initialPaddingRef.current = initialPadding;
    const demSource = forceTerrainFallback ? null : getDemSource();
    let fallbackActivated = forceTerrainFallback;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    let providerFailureTimer: ReturnType<typeof setTimeout> | undefined;
    let fallbackLayerTimer: ReturnType<typeof setInterval> | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let interactionsBound = false;
    let destroyed = false;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: demSource
          ? createHeavenlyWinterStyle(demSource.sharedDemProtocolUrl)
          : heavenlyLocalFallbackStyle,
        bounds: initialBounds,
        fitBoundsOptions: { padding: initialPadding, maxZoom: 13.3 },
        maxBounds: expandedCameraBounds(initialBounds),
        minZoom: 9.6,
        maxZoom: 17,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        cooperativeGestures: true,
        renderWorldCopies: false,
      });
    } catch {
      setFailed(true);
      return;
    }

    mapRef.current = map;
    const initialProviderStatus: TerrainProviderStatus = forceTerrainFallback ? 'unavailable' : 'loading';
    terrainProviderStatusRef.current = initialProviderStatus;
    setTerrainProviderStatus(initialProviderStatus);
    terrainAvailabilityCallbackRef.current?.(false);
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const activateLocalFallback = () => {
      if (fallbackActivated || destroyed) return;
      fallbackActivated = true;
      map.stop();
      try {
        map.setTerrain(null);
      } catch {
        // The style may already be transitioning; the fallback style below
        // removes every provider-backed terrain reference atomically.
      }
      cameraSequenceRef.current += 1;
      if (pendingCameraFrameRef.current !== null) {
        cancelAnimationFrame(pendingCameraFrameRef.current);
        pendingCameraFrameRef.current = null;
      }
      cameraOperationRef.current = null;
      terrainProviderStatusRef.current = 'unavailable';
      requestedMapModeRef.current = 'topographic';
      effectiveMapModeRef.current = null;
      setTerrainProviderStatus('unavailable');
      setRequestedMapMode('topographic');
      setEffectiveMapMode(null);
      setLayersReady(false);
      terrainAvailabilityCallbackRef.current?.(false);
      if (startupTimer) clearTimeout(startupTimer);
      map.setStyle(heavenlyLocalFallbackStyle);
      scheduleLocalLayerBootstrap();
    };
    if (!forceTerrainFallback) startupTimer = setTimeout(activateLocalFallback, 8000);

    const handleRunClick = (event: MapLayerMouseEvent) => {
      const runId = event.features?.[0]?.properties?.flurraRunId;
      if (typeof runId === 'string') selectRunRef.current(runId);
    };
    const handleMapClick = (event: MapLayerMouseEvent) => {
      const runHits = map.queryRenderedFeatures(event.point, { layers: ['verified-run-hitbox'] });
      if (!runHits.length) selectRunRef.current(null);
    };
    const showPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
    const hidePointer = () => { map.getCanvas().style.cursor = ''; };

    const addLocalLayers = () => {
      if (map.getSource('verified-runs')) {
        if (map.getLayer('verified-run-hitbox')) {
          map.resize();
          setLayersReady(true);
        }
        return;
      }
      const hasVectorContext = Boolean(map.getSource('openmaptiles'));
      const hasTerrainContext = Boolean(map.getSource('terrain-dem'));
      if (demSource && !fallbackActivated && hasTerrainContext) addMajorContours(map, demSource);
      map.addSource('verified-runs', {
        type: 'geojson',
        data: runSources.runs as any,
        attribution: OSM_GEOMETRY_ATTRIBUTION,
      });
      map.addSource('run-labels', {
        type: 'geojson',
        data: runSources.labels as any,
      });
      map.addSource('landmark-run-labels', {
        type: 'geojson',
        data: runSources.landmarks as any,
      });
      map.addSource('run-point-labels', {
        type: 'geojson',
        data: runSources.points as any,
      });
      map.addSource('mountain-areas', {
        type: 'geojson',
        data: runSources.areas as any,
      });
      map.addSource('expert-canyon-areas', {
        type: 'geojson',
        data: runSources.canyons as any,
      });
      map.addSource('heavenly-lifts', {
        type: 'geojson',
        data: heavenlyMapData.lifts as any,
        lineMetrics: true,
        attribution: OSM_GEOMETRY_ATTRIBUTION,
      });

      map.addLayer({
        id: 'verified-run-casing',
        type: 'line',
        source: 'verified-runs',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.paper,
          'line-width': 6,
          'line-opacity': 0.9,
        },
      });
      map.addLayer({
        id: 'verified-green',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'easier'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#14834f', 'line-width': 3.5, 'line-opacity': 0.97 },
      });
      map.addLayer({
        id: 'verified-blue',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'more-difficult'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#086fa9', 'line-width': 3.5, 'line-opacity': 0.97 },
      });
      map.addLayer({
        id: 'verified-black',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'most-difficult'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#152b26', 'line-width': 3.7, 'line-opacity': 0.96 },
      });
      map.addLayer({
        id: 'verified-expert',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'experts-only'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#050a08', 'line-width': 4.1, 'line-opacity': 0.96 },
      });
      map.addLayer({
        id: 'verified-expert-markers',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'experts-only'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.orange,
          'line-width': 2,
          'line-dasharray': [1, 1.4],
          'line-opacity': 0.95,
        },
      });
      map.addLayer({
        id: 'heavenly-lifts-topographic',
        type: 'line',
        source: 'heavenly-lifts',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.orange,
          'line-width': 2.2,
          'line-dasharray': [2.3, 1.5],
          'line-opacity': 0.92,
        },
      });
      map.addLayer({
        id: 'heavenly-lift-casing',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['!=', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#fbf7ee',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 3.4, 15, 5.4],
          'line-opacity': 0.88,
        },
      });
      map.addLayer({
        id: 'heavenly-lifts',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['!=', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.orange,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.5, 15, 2.7],
          'line-opacity': 0.86,
        },
      });
      map.addLayer({
        id: 'heavenly-gondola-casing',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['==', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#fbf7ee',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 3.1, 15, 4.7],
          'line-opacity': 0.82,
        },
      });
      map.addLayer({
        id: 'heavenly-gondola',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['==', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-gradient': [
            'interpolate', ['linear'], ['line-progress'],
            0, 'rgba(231,123,78,0.30)',
            0.28, 'rgba(231,123,78,0.48)',
            1, 'rgba(231,123,78,0.92)',
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 15, 1.2],
          'line-gap-width': ['interpolate', ['linear'], ['zoom'], 11, 1.15, 15, 1.7],
          'line-opacity': 1,
        },
      });
      map.addLayer({
        id: 'selected-run-halo',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.lime,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 10.2, 15, 16],
          'line-opacity': 1,
        },
      });
      map.addLayer({
        id: 'selected-run-casing',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#fbf8ef',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 7.3, 15, 12.5],
          'line-opacity': 1,
        },
      });
      map.addLayer({
        id: 'selected-run',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': selectedDifficultyColor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.7, 15, 5.3],
          'line-opacity': 1,
        },
      });
      map.addLayer({
        id: 'mountain-area-labels',
        type: 'symbol',
        source: 'mountain-areas',
        minzoom: 11.2,
        maxzoom: 13.05,
        filter: ['!=', ['get', 'mountainArea'], 'Mott & Killebrew Canyons'],
        layout: {
          'text-field': ['get', 'mountainArea'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10.5, 13.3, 15],
          'text-letter-spacing': 0.12,
          'text-transform': 'uppercase',
          'text-offset': ['get', 'labelOffset'],
          'symbol-sort-key': ['get', 'labelPriority'],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#244f44',
          'text-halo-color': 'rgba(249,250,242,0.94)',
          'text-halo-width': 1.8,
          'text-halo-blur': 0.6,
        },
      } as any);
      map.addLayer({
        id: 'expert-canyon-labels',
        type: 'symbol',
        source: 'expert-canyon-areas',
        minzoom: 11.15,
        layout: {
          'text-field': [
            'format',
            '◆◆  ', { 'font-scale': 0.82 },
            ['get', 'canyonName'], { 'font-scale': 1.08 },
            '\n', {},
            ['get', 'areaRestriction'], { 'font-scale': 0.7 },
          ],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11.15, 8.5, 13.2, 12, 15, 13.5],
          'text-letter-spacing': 0.08,
          'text-offset': [
            'interpolate', ['linear'], ['zoom'],
            11.15, ['get', 'labelOffsetWhole'],
            13.5, ['get', 'labelOffsetClose'],
          ],
          'text-anchor': ['get', 'textAnchor'],
          'symbol-sort-key': 1,
          'text-allow-overlap': true,
          'text-ignore-placement': false,
          'text-padding': 8,
        },
        paint: {
          'text-color': '#8a332d',
          'text-halo-color': 'rgba(252,248,238,0.98)',
          'text-halo-width': 2.2,
          'text-halo-blur': 0.45,
        },
      } as any);
      if (hasVectorContext) {
        map.addLayer({
          id: 'verified-peak-labels',
          type: 'symbol',
          source: 'openmaptiles',
          'source-layer': 'mountain_peak',
          minzoom: 10.8,
          filter: ['all', ['has', 'name'], ['<=', ['coalesce', ['get', 'rank'], 99], 2]],
          layout: {
            'text-field': ['format', ['get', 'name'], {}, '\n', {}, ['to-string', ['get', 'ele']], { 'font-scale': 0.78 }, ' m', { 'font-scale': 0.78 }],
            'text-font': ['Noto Sans Bold'],
            'text-size': 10.5,
            'text-anchor': 'bottom',
            'text-offset': [0, -0.5],
            'text-allow-overlap': false,
            'text-padding': 16,
          },
          paint: {
            'text-color': '#294e52',
            'text-halo-color': 'rgba(249,250,242,0.96)',
            'text-halo-width': 1.7,
          },
        } as any);
        map.addLayer({
          id: 'verified-base-labels',
          type: 'symbol',
          source: 'openmaptiles',
          'source-layer': 'poi',
          minzoom: 11.8,
          filter: ['in', ['get', 'name'], ['literal', VERIFIED_BASE_NAMES]],
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Bold'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 15, 13],
            'text-letter-spacing': 0.08,
            'text-transform': 'uppercase',
            'text-allow-overlap': false,
            'text-padding': 12,
          },
          paint: {
            'text-color': colors.orange,
            'text-halo-color': 'rgba(252,248,238,0.97)',
            'text-halo-width': 2,
          },
        } as any);
      }
      map.addLayer({
        id: 'major-lift-labels',
        type: 'symbol',
        source: 'heavenly-lifts',
        minzoom: 11.5,
        maxzoom: 14.4,
        filter: ['in', ['get', 'name'], ['literal', MAJOR_LIFT_NAMES]],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 330,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11.5, 9, 14, 11],
          'text-letter-spacing': 0.08,
          'text-keep-upright': true,
          'text-allow-overlap': false,
          'text-padding': 12,
        },
        paint: {
          'text-color': '#b85238',
          'text-halo-color': 'rgba(252,248,238,0.96)',
          'text-halo-width': 1.8,
        },
      } as any);
      map.addLayer({
        id: 'all-lift-labels',
        type: 'symbol',
        source: 'heavenly-lifts',
        minzoom: 13.35,
        filter: ['all', ['has', 'name'], ['!', ['in', ['get', 'name'], ['literal', MAJOR_LIFT_NAMES]]]],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 300,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13.35, 9, 16, 12],
          'text-keep-upright': true,
          'text-allow-overlap': false,
          'text-padding': 9,
        },
        paint: {
          'text-color': '#b85238',
          'text-halo-color': 'rgba(252,248,238,0.96)',
          'text-halo-width': 1.6,
        },
      } as any);
      map.addLayer({
        id: 'major-run-labels',
        type: 'symbol',
        source: 'landmark-run-labels',
        minzoom: 11.45,
        maxzoom: 13.65,
        filter: ['==', ['get', 'labelPriority'], 1],
        layout: {
          'text-field': ['concat', ['get', 'difficultySymbol'], '  ', ['get', 'flurraRunName']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11.45, 8.2, 13.6, 10.4],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.7,
          'text-allow-overlap': false,
          'text-ignore-placement': true,
          'text-padding': 6,
        },
        paint: {
          'text-color': '#153d34',
          'text-halo-color': 'rgba(252,250,242,0.98)',
          'text-halo-width': 2,
          'text-halo-blur': 0.4,
        },
      } as any);
      map.addLayer({
        id: 'canyon-run-labels',
        type: 'symbol',
        source: 'run-labels',
        minzoom: 13.05,
        filter: ['in', ['get', 'canyonSubarea'], ['literal', ['mott-canyon', 'killebrew-canyon']]],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 300,
          'text-field': ['concat', ['get', 'difficultySymbol'], '  ', ['get', 'flurraRunName']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13.05, 9, 16, 12.2],
          'text-keep-upright': true,
          'text-allow-overlap': false,
          'text-padding': 9,
        },
        paint: {
          'text-color': '#153d34',
          'text-halo-color': 'rgba(252,250,242,0.99)',
          'text-halo-width': 2.1,
          'text-halo-blur': 0.35,
        },
      } as any);
      map.addLayer({
        id: 'area-run-labels',
        type: 'symbol',
        source: 'run-labels',
        minzoom: 13.05,
        filter: [
          'all',
          ['!=', ['get', 'canyonSubarea'], 'mott-canyon'],
          ['!=', ['get', 'canyonSubarea'], 'killebrew-canyon'],
        ],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 300,
          'text-field': ['concat', ['get', 'difficultySymbol'], '  ', ['get', 'flurraRunName']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13.05, 9.5, 16, 12.5],
          'text-keep-upright': true,
          'text-allow-overlap': false,
          'text-padding': 8,
        },
        paint: {
          'text-color': '#153d34',
          'text-halo-color': 'rgba(252,250,242,0.98)',
          'text-halo-width': 1.9,
          'text-halo-blur': 0.35,
        },
      } as any);
      map.addLayer({
        id: 'black-difficulty-markers',
        type: 'symbol',
        source: 'run-labels',
        minzoom: 13.55,
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'most-difficult'],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 520,
          'text-field': '◆',
          'text-font': ['Noto Sans Bold'],
          'text-size': 8,
          'text-keep-upright': true,
          'text-allow-overlap': false,
        },
        paint: { 'text-color': '#07100d', 'text-halo-color': '#fbf8ef', 'text-halo-width': 1 },
      } as any);
      map.addLayer({
        id: 'expert-difficulty-markers',
        type: 'symbol',
        source: 'run-labels',
        minzoom: 13.1,
        filter: ['==', ['get', 'effectiveMapDifficulty'], 'experts-only'],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 420,
          'text-field': '◆◆',
          'text-font': ['Noto Sans Bold'],
          'text-size': 8,
          'text-keep-upright': true,
          'text-allow-overlap': false,
        },
        paint: { 'text-color': '#050a08', 'text-halo-color': '#fbf8ef', 'text-halo-width': 1.2 },
      } as any);
      map.addLayer({
        id: 'selected-run-label',
        type: 'symbol',
        source: 'run-point-labels',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        layout: {
          'text-field': ['concat', ['get', 'difficultySymbol'], '  ', ['get', 'flurraRunName']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 11, 16, 14],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.85,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#123c32',
          'text-halo-color': '#fbf8ef',
          'text-halo-width': 2.5,
          'text-halo-blur': 0.4,
        },
      } as any);
      map.addLayer({
        id: 'verified-run-hitbox',
        type: 'line',
        source: 'verified-runs',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 20,
          'line-opacity': 0.01,
        },
      });

      if (!interactionsBound) {
        for (const layerId of runLayerIds) {
          map.on('click', layerId, handleRunClick);
          map.on('mouseenter', layerId, showPointer);
          map.on('mouseleave', layerId, hidePointer);
        }
        map.on('click', handleMapClick);
        interactionsBound = true;
      }

      map.resize();
      setLayersReady(true);

      if (!fallbackActivated) {
        if (simulatedProviderFailure && !providerFailureTimer) {
          providerFailureTimer = setTimeout(activateLocalFallback, 450);
        }
      }
    };

    const scheduleLocalLayerBootstrap = () => {
      if (fallbackLayerTimer) clearInterval(fallbackLayerTimer);
      fallbackLayerTimer = setInterval(() => {
        if (destroyed) return;
        try {
          addLocalLayers();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (!/style.*not.*load/i.test(message)) throw error;
          return;
        }
        if (map.getLayer('verified-run-hitbox') && fallbackLayerTimer) {
          clearInterval(fallbackLayerTimer);
          fallbackLayerTimer = undefined;
        }
      }, 100);
    };

    const handleIdle = () => {
      if (!fallbackActivated
        && map.getSource('openmaptiles')
        && map.getSource('terrain-dem')
        && map.isSourceLoaded('openmaptiles')
        && map.isSourceLoaded('terrain-dem')) {
        if (startupTimer) clearTimeout(startupTimer);
        terrainProviderStatusRef.current = 'available';
        setTerrainProviderStatus('available');
        terrainAvailabilityCallbackRef.current?.(true);
      }
    };
    const handleProviderError = (event: ErrorEvent & { sourceId?: string }) => {
      if (fallbackActivated) return;
      const sourceId = event.sourceId ?? (event as any).error?.sourceId;
      const message = String((event as any).error?.message ?? event.message ?? '');
      const providerSourceFailed = ['openmaptiles', 'terrain-dem', 'major-contours'].includes(sourceId)
        || /openfreemap|openmaptiles|terrain-dem|elevation-tiles|mapzen|mlcontour/i.test(message);
      if (providerSourceFailed) activateLocalFallback();
    };

    map.on('load', addLocalLayers);
    map.on('style.load', addLocalLayers);
    map.on('idle', handleIdle);
    map.on('error', handleProviderError as any);
    // The fully local fallback style can finish synchronously during Map
    // construction, before listeners are attached. Bootstrap its local layers
    // explicitly when that has already happened.
    if (map.isStyleLoaded()) addLocalLayers();
    scheduleLocalLayerBootstrap();

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (destroyed) return;
          map.stop();
          map.resize();
          const currentRunId = selectedRunIdRef.current;
          if (currentRunId) {
            const adjacentRunIds = [...(runAdjacencyIndex.get(currentRunId) ?? [])];
            const bounds = geometryBoundsForRunIds([currentRunId, ...adjacentRunIds]);
            if (bounds && !bounds.isEmpty()) {
              const renderedMode = effectiveMapModeRef.current;
              if (renderedMode) {
                focusRunBounds(
                  map,
                  bounds,
                  renderedMode,
                  terrainProviderStatusRef.current === 'available',
                  0,
                );
              }
            }
          }
        }, 100);
      });
    resizeObserver?.observe(containerRef.current);

    return () => {
      destroyed = true;
      map.stop();
      if (interactionsBound) {
        for (const layerId of runLayerIds) {
          map.off('click', layerId, handleRunClick);
          map.off('mouseenter', layerId, showPointer);
          map.off('mouseleave', layerId, hidePointer);
        }
        map.off('click', handleMapClick);
      }
      if (startupTimer) clearTimeout(startupTimer);
      if (providerFailureTimer) clearTimeout(providerFailureTimer);
      if (fallbackLayerTimer) clearInterval(fallbackLayerTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (pendingCameraFrameRef.current !== null) cancelAnimationFrame(pendingCameraFrameRef.current);
      resizeObserver?.disconnect();
      map.off('load', addLocalLayers);
      map.off('style.load', addLocalLayers);
      map.off('idle', handleIdle);
      map.off('error', handleProviderError as any);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map
      || !ready
      || !map.getLayer('selected-run')
      || !map.getLayer('selected-run-casing')) return;
    const selectedFilter: FilterSpecification = [
      '==',
      ['get', 'flurraRunId'],
      selectedRunId ?? '__none__',
    ];
    map.setFilter('selected-run-halo', selectedFilter);
    map.setFilter('selected-run', selectedFilter);
    map.setFilter('selected-run-casing', selectedFilter);
    map.setFilter('selected-run-label', selectedFilter);
    const excludeSelectedFilter: FilterSpecification = selectedRunId
      ? ['!=', ['get', 'flurraRunId'], selectedRunId]
      : ['has', 'flurraRunId'];
    map.setFilter('major-run-labels', ['all', ['==', ['get', 'labelPriority'], 1], excludeSelectedFilter]);
    map.setFilter('canyon-run-labels', [
      'all',
      ['in', ['get', 'canyonSubarea'], ['literal', ['mott-canyon', 'killebrew-canyon']]],
      excludeSelectedFilter,
    ]);
    map.setFilter('area-run-labels', [
      'all',
      ['!=', ['get', 'canyonSubarea'], 'mott-canyon'],
      ['!=', ['get', 'canyonSubarea'], 'killebrew-canyon'],
      excludeSelectedFilter,
    ]);
    map.setFilter('black-difficulty-markers', ['all', ['==', ['get', 'effectiveMapDifficulty'], 'most-difficult'], excludeSelectedFilter]);
    map.setFilter('expert-difficulty-markers', ['all', ['==', ['get', 'effectiveMapDifficulty'], 'experts-only'], excludeSelectedFilter]);
    const selectedCanyonSubarea = selectedRunId
      ? String(runSources.runs.features.find((feature) => (
        feature.properties.flurraRunId === selectedRunId
      ))?.properties.canyonSubarea ?? '')
      : '';
    map.setFilter('expert-canyon-labels', CANYON_SUBAREA_LABELS[selectedCanyonSubarea]
      ? ['==', ['get', 'subarea'], '__selected-canyon-shown-in-overlay__']
      : ['in', ['get', 'subarea'], ['literal', ['mott-canyon', 'killebrew-canyon']]]);

    const resortView = effectiveMapMode === 'resort'
      && terrainProviderStatus === 'available'
      && Boolean(map.getSource('terrain-dem'));
    setLayerVisibility(map, 'mountain-area-labels', resortView && !selectedRunId);
    const adjacentRunIds = selectedRunId ? [...(runAdjacencyIndex.get(selectedRunId) ?? [])] : [];
    const contextRunIds = selectedRunId ? [selectedRunId, ...adjacentRunIds] : [];
    const baseOpacity = selectedRunId
      ? (resortView
        ? ['case', ['in', ['get', 'flurraRunId'], ['literal', contextRunIds]], 0.64, 0.3]
        : 0.26)
      : 0.97;
    map.setPaintProperty('verified-run-casing', 'line-opacity', selectedRunId
      ? (resortView
        ? ['case', ['in', ['get', 'flurraRunId'], ['literal', contextRunIds]], 0.58, 0.27]
        : 0.16)
      : 0.92);
    for (const layerId of ['verified-green', 'verified-blue', 'verified-black']) {
      map.setPaintProperty(layerId, 'line-opacity', baseOpacity);
    }
    map.setPaintProperty('verified-expert', 'line-opacity', selectedRunId ? baseOpacity : 0.97);
    map.setPaintProperty('verified-expert-markers', 'line-opacity', selectedRunId ? 0.3 : 0.95);
    map.setPaintProperty('heavenly-lifts-topographic', 'line-opacity', selectedRunId ? 0.5 : 0.92);
    for (const layerId of ['heavenly-lift-casing', 'heavenly-lifts', 'heavenly-gondola-casing', 'heavenly-gondola']) {
      map.setPaintProperty(layerId, 'line-opacity', selectedRunId ? 0.52 : (layerId.includes('gondola') ? 0.84 : 0.86));
    }
  }, [effectiveMapMode, ready, selectedRunId, terrainProviderStatus]);

  useEffect(() => {
    const map = mapRef.current;
    const wholeMountainBounds = initialBoundsRef.current;
    if (!map
      || !wholeMountainBounds
      || !layersReady
      || !map.getLayer('verified-run-casing')) return;

    if (requestedMapMode === 'resort' && terrainProviderStatus !== 'available') return;

    const nextEffectiveMode: HeavenlyMapMode = requestedMapMode === 'resort' ? 'resort' : 'topographic';
    const sequence = ++cameraSequenceRef.current;
    if (pendingCameraFrameRef.current !== null) {
      cancelAnimationFrame(pendingCameraFrameRef.current);
      pendingCameraFrameRef.current = null;
    }
    cameraOperationRef.current = 'fit';

    map.stop();
    map.resize();
    const presentationApplied = applyMapPresentation(
      map,
      nextEffectiveMode,
      terrainProviderStatus === 'available',
    );
    const cameraApplied = presentationApplied && fitWholeMountainCamera(
      map,
      nextEffectiveMode,
      wholeMountainBounds,
      initialPaddingRef.current,
      false,
    );
    const renderedCorrectly = cameraApplied
      && (nextEffectiveMode === 'resort' ? terrainIsApplied(map) : !map.getTerrain())
      && cameraMatchesMode(map, nextEffectiveMode);

    if (sequence === cameraSequenceRef.current && renderedCorrectly) {
      effectiveMapModeRef.current = nextEffectiveMode;
      setEffectiveMapMode(nextEffectiveMode);
    }
    cameraOperationRef.current = null;

    return () => {
      cameraSequenceRef.current += 1;
      map.stop();
    };
  }, [layersReady, requestedMapMode, terrainProviderStatus]);

  useEffect(() => {
    const map = mapRef.current;
    const wholeMountainBounds = initialBoundsRef.current;
    if (!map || !wholeMountainBounds || !ready || !effectiveMapMode) return;

    const sequence = ++cameraSequenceRef.current;
    if (pendingCameraFrameRef.current !== null) cancelAnimationFrame(pendingCameraFrameRef.current);
    map.stop();
    cameraOperationRef.current = selectedRunId ? 'selected-run-focus' : 'fit';
    pendingCameraFrameRef.current = requestAnimationFrame(() => {
      pendingCameraFrameRef.current = null;
      if (sequence !== cameraSequenceRef.current || mapRef.current !== map || !map.isStyleLoaded()) return;
      if (selectedRunId) {
        const adjacentRunIds = [...(runAdjacencyIndex.get(selectedRunId) ?? [])];
        const selectedBounds = geometryBoundsForRunIds([selectedRunId, ...adjacentRunIds]);
        if (selectedBounds && !selectedBounds.isEmpty()) {
          focusRunBounds(
            map,
            selectedBounds,
            effectiveMapMode,
            terrainProviderStatus === 'available',
            500,
          );
        }
      } else {
        fitWholeMountainCamera(map, effectiveMapMode, wholeMountainBounds, initialPaddingRef.current, true);
      }
      if (sequence === cameraSequenceRef.current) cameraOperationRef.current = null;
    });

    return () => {
      cameraSequenceRef.current += 1;
      if (pendingCameraFrameRef.current !== null) {
        cancelAnimationFrame(pendingCameraFrameRef.current);
        pendingCameraFrameRef.current = null;
      }
      cameraOperationRef.current = null;
      map.stop();
    };
  }, [effectiveMapMode, ready, selectedRunId, terrainProviderStatus]);

  const fitWholeMountain = () => {
    const map = mapRef.current;
    const bounds = initialBoundsRef.current;
    const renderedMode = effectiveMapModeRef.current;
    if (!map || !bounds || !ready || !renderedMode) return;
    const sequence = ++cameraSequenceRef.current;
    if (pendingCameraFrameRef.current !== null) {
      cancelAnimationFrame(pendingCameraFrameRef.current);
      pendingCameraFrameRef.current = null;
    }
    cameraOperationRef.current = 'fit';
    map.stop();
    fitWholeMountainCamera(
      map,
      renderedMode,
      bounds,
      initialPaddingRef.current,
      true,
    );
    if (sequence === cameraSequenceRef.current) cameraOperationRef.current = null;
  };

  const resetCamera = () => {
    const map = mapRef.current;
    const initialBounds = initialBoundsRef.current;
    const renderedMode = effectiveMapModeRef.current;
    if (!map || !initialBounds || !ready || !renderedMode) return;
    const sequence = ++cameraSequenceRef.current;
    if (pendingCameraFrameRef.current !== null) {
      cancelAnimationFrame(pendingCameraFrameRef.current);
      pendingCameraFrameRef.current = null;
    }
    cameraOperationRef.current = 'reset';
    map.stop();
    if (selectedRunId) {
      const adjacentRunIds = [...(runAdjacencyIndex.get(selectedRunId) ?? [])];
      const bounds = geometryBoundsForRunIds([selectedRunId, ...adjacentRunIds]);
      if (bounds && !bounds.isEmpty()) {
        focusRunBounds(
          map,
          bounds,
          renderedMode,
          terrainProviderStatusRef.current === 'available',
          500,
        );
        if (sequence === cameraSequenceRef.current) cameraOperationRef.current = null;
        return;
      }
    }
    fitWholeMountainCamera(
      map,
      renderedMode,
      initialBounds,
      initialPaddingRef.current,
      true,
    );
    if (sequence === cameraSequenceRef.current) cameraOperationRef.current = null;
  };

  const changeMapMode = (nextMode: HeavenlyMapMode) => {
    if (nextMode === 'resort' && terrainProviderStatusRef.current === 'unavailable') return;
    if (nextMode === requestedMapModeRef.current && nextMode === effectiveMapModeRef.current) return;
    const map = mapRef.current;
    cameraSequenceRef.current += 1;
    if (pendingCameraFrameRef.current !== null) {
      cancelAnimationFrame(pendingCameraFrameRef.current);
      pendingCameraFrameRef.current = null;
    }
    cameraOperationRef.current = null;
    map?.stop();
    requestedMapModeRef.current = nextMode;
    setRequestedMapMode(nextMode);
  };

  const selectedCanyonSubarea = selectedRunId
    ? String(runSources.runs.features.find((feature) => (
      feature.properties.flurraRunId === selectedRunId
    ))?.properties.canyonSubarea ?? '')
    : '';
  const selectedCanyonName = CANYON_SUBAREA_LABELS[selectedCanyonSubarea];

  if (failed) {
    return <View style={styles.fallback} accessibilityRole="alert">
      <Text style={styles.fallbackKicker}>MAP UNAVAILABLE</Text>
      <Text style={styles.fallbackTitle}>The mountain lines could not load.</Text>
      <Text style={styles.fallbackCopy}>The Heavenly run directory and details still work. Try reloading in a WebGL-capable browser.</Text>
    </View>;
  }

  return <View style={styles.container}>
    <style>{`
      .heavenly-map-mobile .maplibregl-ctrl-top-right .maplibregl-ctrl-group button {
        width: 44px;
        height: 44px;
      }
      .heavenly-map-mobile .maplibregl-ctrl-attrib-button {
        width: 36px;
        height: 36px;
      }
      .heavenly-map-mobile .maplibregl-ctrl-bottom-right {
        max-width: calc(100% - 8px);
      }
    `}</style>
    {!ready ? <View style={styles.loading}><ActivityIndicator color={colors.orange} /><Text style={styles.loadingText}>LOADING WINTER TERRAIN</Text></View> : null}
    <div
      ref={containerRef}
      className={compact ? 'heavenly-map-mobile' : undefined}
      aria-label="Interactive Heavenly prototype trail map"
      role="region"
      tabIndex={0}
      data-testid="heavenly-map-canvas"
      data-map-mode={effectiveMapMode ?? 'loading'}
      data-requested-map-mode={requestedMapMode}
      data-provider-state={terrainProviderStatus}
      style={{ width: '100%', height: '100%', minHeight: compact ? 500 : 520 }}
    />
    {ready ? <View style={[styles.cameraControls, compact && styles.cameraControlsMobile]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fit the whole Heavenly ski mountain"
        onPress={fitWholeMountain}
        style={({ hovered }: any) => [styles.cameraButton, hovered && styles.cameraButtonHover]}
      >
        <Feather name="maximize" size={14} color={colors.forest} />
        <Text style={styles.cameraButtonText}>FIT</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset map compass and camera"
        onPress={resetCamera}
        style={({ hovered }: any) => [styles.cameraButton, hovered && styles.cameraButtonHover]}
      >
        <Feather name="compass" size={14} color={colors.forest} />
        <Text style={styles.cameraButtonText}>RESET</Text>
      </Pressable>
    </View> : null}
    {ready && selectedCanyonName ? <View
      pointerEvents="none"
      style={[styles.selectedCanyonNotice, compact && styles.selectedCanyonNoticeMobile, terrainLimited && styles.selectedCanyonNoticeFallback, compact && terrainLimited && styles.selectedCanyonNoticeFallbackMobile]}
      accessibilityRole="text"
      accessibilityLabel={`${selectedCanyonName}. Experts only. Gated terrain.`}
    >
      <Text style={styles.selectedCanyonName}>◆◆ {selectedCanyonName}</Text>
      <Text style={styles.selectedCanyonRestriction}>EXPERTS ONLY · GATED TERRAIN</Text>
    </View> : null}
    {ready ? <View style={[styles.viewToggle, compact && styles.viewToggleMobile]} accessibilityRole="tablist">
      <Pressable
        testID="resort-view-toggle"
        accessibilityRole="tab"
        aria-selected={effectiveMapMode === 'resort'}
        accessibilityState={{ selected: effectiveMapMode === 'resort', disabled: terrainLimited }}
        disabled={terrainLimited}
        onPress={() => changeMapMode('resort')}
        style={[styles.viewToggleButton, compact && styles.viewToggleButtonMobile, effectiveMapMode === 'resort' && styles.viewToggleButtonActive, terrainLimited && styles.viewToggleButtonDisabled]}
      >
        <Text style={[styles.viewToggleText, effectiveMapMode === 'resort' && styles.viewToggleTextActive]}>RESORT 3D</Text>
      </Pressable>
      <Pressable
        testID="topographic-view-toggle"
        accessibilityRole="tab"
        aria-selected={effectiveMapMode === 'topographic'}
        accessibilityState={{ selected: effectiveMapMode === 'topographic' }}
        onPress={() => changeMapMode('topographic')}
        style={[styles.viewToggleButton, compact && styles.viewToggleButtonMobile, effectiveMapMode === 'topographic' && styles.viewToggleButtonActive]}
      >
        <Text style={[styles.viewToggleText, effectiveMapMode === 'topographic' && styles.viewToggleTextActive]}>TOPO 2D</Text>
      </Pressable>
    </View> : null}
    {terrainLimited ? <View style={[styles.terrainNotice, compact && styles.terrainNoticeMobile]} accessibilityRole="alert">
      <Text style={styles.terrainNoticeText}>Terrain context unavailable · switched to Topo 2D · local runs and lifts remain active</Text>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { minHeight: 520, width: '100%', backgroundColor: '#eaf0e7', position: 'relative', overflow: 'hidden' },
  loading: { ...StyleSheet.absoluteFillObject, zIndex: 2, backgroundColor: '#eaf0e7', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  cameraControls: { position: 'absolute', zIndex: 5, top: 72, right: 10, gap: 6 },
  cameraControlsMobile: { top: 106, right: 8 },
  cameraButton: { minWidth: 46, minHeight: 46, backgroundColor: 'rgba(252,248,238,.95)', borderColor: colors.forest, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2, shadowColor: colors.forest, shadowOpacity: .18, shadowRadius: 0, shadowOffset: { width: 2, height: 2 } },
  cameraButtonHover: { backgroundColor: colors.lime },
  cameraButtonText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 6, letterSpacing: .65 },
  selectedCanyonNotice: { position: 'absolute', zIndex: 5, top: 70, left: 12, maxWidth: 245, backgroundColor: 'rgba(252,248,238,.95)', borderColor: '#8a332d', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  selectedCanyonNoticeMobile: { top: 210, left: 8, right: 62, maxWidth: 220 },
  selectedCanyonNoticeFallback: { top: 106 },
  selectedCanyonNoticeFallbackMobile: { top: 244 },
  selectedCanyonName: { color: '#8a332d', fontFamily: fonts.bold, fontSize: 9, letterSpacing: .75 },
  selectedCanyonRestriction: { color: '#8a332d', fontFamily: fonts.bold, fontSize: 6, letterSpacing: .7, marginTop: 2 },
  viewToggle: { position: 'absolute', zIndex: 5, left: 12, bottom: 12, flexDirection: 'row', backgroundColor: 'rgba(246,240,228,.94)', borderColor: colors.forest, borderWidth: 1, padding: 3, gap: 3 },
  viewToggleMobile: { left: 8, bottom: 8 },
  viewToggleButton: { minHeight: 32, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  viewToggleButtonMobile: { minHeight: 44, paddingHorizontal: 9 },
  viewToggleButtonActive: { backgroundColor: colors.forest },
  viewToggleButtonDisabled: { opacity: 0.45 },
  viewToggleText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.8 },
  viewToggleTextActive: { color: colors.lime },
  terrainNotice: { position: 'absolute', zIndex: 4, left: 12, right: 12, top: 58, backgroundColor: 'rgba(246,240,228,.94)', borderColor: colors.orange, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  terrainNoticeMobile: { left: 8, right: 62, top: 160 },
  terrainNoticeText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, lineHeight: 11, letterSpacing: .65, textTransform: 'uppercase' },
  fallback: { minHeight: 420, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 35 },
  fallbackKicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  fallbackTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, textAlign: 'center', marginTop: 10 },
  fallbackCopy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 560, marginTop: 11 },
});
