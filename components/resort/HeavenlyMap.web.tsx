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
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { heavenlyMapData } from '@/data/heavenlyMap';
import { colors, fonts } from '@/theme';
import {
  createHeavenlyWinterStyle,
  heavenlyLocalFallbackStyle,
} from './map/heavenlyMapStyle';

type HeavenlyMapProps = {
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
};

type HeavenlyMapMode = 'resort' | 'topographic';

const runLayerIds = [
  'verified-run-hitbox',
  'verified-green',
  'verified-blue',
  'verified-black',
  'verified-expert',
  'selected-run',
];

const RESORT_VIEW_CAMERA = {
  bearing: 165,
  pitch: 46,
  exaggeration: 1.15,
};

const selectedDifficultyColor = [
  'match',
  ['get', 'officialDifficulty'],
  'easier', '#34875a',
  'more-difficult', '#176da0',
  'most-difficult', colors.deep,
  'experts-only', '#111916',
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

  for (const feature of heavenlyMapData.verifiedRuns.features) {
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

function setLayerVisibility(map: MapLibreMap, layerId: string, visible: boolean) {
  if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

function applyTerrainTreatment(map: MapLibreMap, mode: HeavenlyMapMode) {
  const resortView = mode === 'resort';

  if (map.getLayer('winter-open-land')) {
    map.setPaintProperty('winter-open-land', 'fill-color', resortView ? '#edf2ec' : '#dbe3d7');
    map.setPaintProperty('winter-open-land', 'fill-outline-color', resortView ? '#edf2ec' : '#dbe3d7');
    map.setPaintProperty('winter-open-land', 'fill-opacity', resortView ? 0 : 0.2);
  }
  if (map.getLayer('winter-forest')) {
    map.setPaintProperty('winter-forest', 'fill-color', resortView ? '#6f8c81' : '#bfd0c6');
    map.setPaintProperty('winter-forest', 'fill-outline-color', resortView ? '#6f8c81' : '#bfd0c6');
    map.setPaintProperty('winter-forest', 'fill-opacity', resortView
      ? ['interpolate', ['linear'], ['zoom'], 10, 0, 14, 0.16, 16, 0.32]
      : ['interpolate', ['linear'], ['zoom'], 10, 0.42, 14, 0.5]);
  }
  if (map.getLayer('winter-water')) {
    map.setPaintProperty('winter-water', 'fill-color', resortView ? '#90bac6' : '#a9cfda');
    map.setPaintProperty('winter-water', 'fill-opacity', resortView ? 0.62 : 0.82);
  }
  if (map.getLayer('terrain-hillshade')) {
    map.setPaintProperty('terrain-hillshade', 'hillshade-shadow-color', resortView ? '#365c56' : '#42645f');
    map.setPaintProperty('terrain-hillshade', 'hillshade-highlight-color', resortView ? '#fffef8' : '#fffdf5');
    map.setPaintProperty('terrain-hillshade', 'hillshade-accent-color', resortView ? '#6f8d88' : '#6f8d87');
    map.setPaintProperty('terrain-hillshade', 'hillshade-exaggeration', resortView ? 0.58 : 0.44);
  }
  if (map.getLayer('major-contours')) {
    map.setPaintProperty('major-contours', 'line-opacity', resortView ? 0.06 : 0.34);
  }
  if (map.getLayer('winter-waterways')) {
    map.setPaintProperty('winter-waterways', 'line-opacity', resortView ? 0.2 : 0.48);
  }
}

function applyRunAndLiftTreatment(map: MapLibreMap, mode: HeavenlyMapMode) {
  const resortView = mode === 'resort';
  const runWidth = resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.15, 15, 4.5]
    : 3.5;
  const expertWidth = resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.45, 15, 4.8]
    : 5.2;

  map.setPaintProperty('verified-run-casing', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 4.6, 15, 8.2]
    : 6);
  for (const layerId of ['verified-green', 'verified-blue', 'verified-black']) {
    map.setPaintProperty(layerId, 'line-width', runWidth);
  }
  map.setPaintProperty('verified-expert', 'line-width', expertWidth);
  setLayerVisibility(map, 'verified-expert-markers', !resortView);

  setLayerVisibility(map, 'heavenly-lifts-topographic', !resortView);
  for (const layerId of ['heavenly-lift-casing', 'heavenly-lifts', 'heavenly-gondola-casing', 'heavenly-gondola']) {
    setLayerVisibility(map, layerId, resortView);
  }

  map.setPaintProperty('selected-run-halo', 'line-opacity', resortView ? 1 : 0);
  map.setPaintProperty('selected-run-casing', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 7.3, 15, 12.5]
    : 10);
  map.setPaintProperty('selected-run', 'line-width', resortView
    ? ['interpolate', ['linear'], ['zoom'], 11, 2.7, 15, 5.3]
    : 6.5);
  map.setPaintProperty('selected-run', 'line-color', resortView ? selectedDifficultyColor : colors.lime);
}

function applyMapMode(
  map: MapLibreMap,
  mode: HeavenlyMapMode,
  bounds: LngLatBounds,
  basePadding: number,
  terrainAvailable: boolean,
  animate: boolean,
) {
  const resortView = mode === 'resort' && terrainAvailable;
  const camera = resortCamera();

  map.setTerrain(resortView ? { source: 'terrain-dem', exaggeration: camera.exaggeration } : null);
  applyTerrainTreatment(map, resortView ? 'resort' : 'topographic');
  applyRunAndLiftTreatment(map, resortView ? 'resort' : 'topographic');
  const overrideLongitude = optionalNumericSearchParam('longitude');
  const overrideLatitude = optionalNumericSearchParam('latitude');
  const overrideZoom = optionalNumericSearchParam('zoom');
  if (resortView && overrideLongitude !== null && overrideLatitude !== null && overrideZoom !== null) {
    map.jumpTo({
      center: [overrideLongitude, overrideLatitude],
      zoom: overrideZoom,
      bearing: camera.bearing,
      pitch: camera.pitch,
    });
    return;
  }
  map.fitBounds(bounds, {
    padding: resortView
      ? { top: 110, right: Math.max(22, basePadding - 18), bottom: 30, left: Math.max(22, basePadding - 18) }
      : basePadding,
    duration: animate ? 750 : 0,
    maxZoom: resortView ? 13.1 : 13.3,
    bearing: resortView ? camera.bearing : 0,
    pitch: resortView ? camera.pitch : 0,
    offset: [0, 0],
  });

  if (resortView && !animate) {
    map.setZoom(Math.min(map.getZoom() + 0.3, 13.45));
    map.panBy([0, -105], { duration: 0 });
  }

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

function geometryBounds(runId: string) {
  const osmRefs = new Set(heavenlyMapData.runGeometryIndex[runId] ?? []);
  const coordinates: [number, number][] = [];

  function collect(value: unknown) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && value.every((item) => typeof item === 'number')) {
      coordinates.push(value as [number, number]);
      return;
    }
    value.forEach(collect);
  }

  for (const feature of heavenlyMapData.verifiedRuns.features) {
    if (!osmRefs.has(feature.id)) continue;
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

export function HeavenlyMap({ selectedRunId, onSelectRun }: HeavenlyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const selectRunRef = useRef(onSelectRun);
  const initialBoundsRef = useRef<LngLatBounds | null>(null);
  const initialPaddingRef = useRef(48);
  const terrainAvailableRef = useRef(false);
  const mapModeRef = useRef<HeavenlyMapMode>('resort');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [terrainLimited, setTerrainLimited] = useState(false);
  const [mapMode, setMapMode] = useState<HeavenlyMapMode>(() => (
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'topographic'
      ? 'topographic'
      : 'resort'
  ));

  useEffect(() => {
    selectRunRef.current = onSelectRun;
  }, [onSelectRun]);

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const forceTerrainFallback = new URLSearchParams(window.location.search).get('terrain') === 'fallback';
    const initialBounds = allRunGeometryBounds();
    const initialPadding = containerRef.current.clientWidth < 600 ? 34 : 48;
    initialBoundsRef.current = initialBounds;
    initialPaddingRef.current = initialPadding;
    const demSource = forceTerrainFallback ? null : getDemSource();
    let fallbackActivated = forceTerrainFallback;
    let localLayersAdded = false;
    let contextTimer: ReturnType<typeof setTimeout> | undefined;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: demSource
          ? createHeavenlyWinterStyle(demSource.sharedDemProtocolUrl)
          : heavenlyLocalFallbackStyle,
        bounds: initialBounds,
        fitBoundsOptions: { padding: initialPadding, maxZoom: 13.3 },
        minZoom: 11,
        maxZoom: 17,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch {
      setFailed(true);
      return;
    }

    mapRef.current = map;
    terrainAvailableRef.current = Boolean(demSource);
    setTerrainLimited(forceTerrainFallback);
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const activateLocalFallback = () => {
      if (fallbackActivated || localLayersAdded) return;
      fallbackActivated = true;
      terrainAvailableRef.current = false;
      setTerrainLimited(true);
      map.setStyle(heavenlyLocalFallbackStyle);
    };
    if (!forceTerrainFallback) startupTimer = setTimeout(activateLocalFallback, 8000);

    const handleRunClick = (event: MapLayerMouseEvent) => {
      const runId = event.features?.[0]?.properties?.flurraRunId;
      if (typeof runId === 'string') selectRunRef.current(runId);
    };
    const showPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
    const hidePointer = () => { map.getCanvas().style.cursor = ''; };

    const addLocalLayers = () => {
      if (map.getSource('verified-runs')) return;
      if (demSource && !fallbackActivated) addMajorContours(map, demSource);
      map.addSource('verified-runs', {
        type: 'geojson',
        data: heavenlyMapData.verifiedRuns as any,
      });
      map.addSource('heavenly-lifts', {
        type: 'geojson',
        data: heavenlyMapData.lifts as any,
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
        filter: ['==', ['get', 'officialDifficulty'], 'easier'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#34875a', 'line-width': 3.5, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-blue',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'more-difficult'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#176da0', 'line-width': 3.5, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-black',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'most-difficult'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': colors.deep, 'line-width': 3.7, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-expert',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'experts-only'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#070d0b', 'line-width': 5.2, 'line-opacity': 0.98 },
      });
      map.addLayer({
        id: 'verified-expert-markers',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'experts-only'],
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
          'line-color': '#f8f3e8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 3.8, 15, 6.2],
          'line-opacity': 0.92,
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
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.8, 15, 3.1],
          'line-opacity': 0.88,
        },
      });
      map.addLayer({
        id: 'heavenly-gondola-casing',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['==', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.deep,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 5, 15, 8.4],
          'line-opacity': 0.88,
        },
      });
      map.addLayer({
        id: 'heavenly-gondola',
        type: 'line',
        source: 'heavenly-lifts',
        filter: ['==', ['get', 'name'], 'Heavenly Gondola'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colors.orange,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.4, 15, 4.4],
          'line-opacity': 0.96,
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

      for (const layerId of runLayerIds) {
        map.on('click', layerId, handleRunClick);
        map.on('mouseenter', layerId, showPointer);
        map.on('mouseleave', layerId, hidePointer);
      }

      localLayersAdded = true;
      if (startupTimer) clearTimeout(startupTimer);
      map.resize();
      applyMapMode(map, mapModeRef.current, initialBounds, initialPadding, Boolean(demSource && !fallbackActivated), false);
      setReady(true);

      if (!fallbackActivated) {
        contextTimer = setTimeout(() => {
          const vectorReady = map.getSource('openmaptiles') && map.isSourceLoaded('openmaptiles');
          const terrainReady = map.getSource('terrain-dem') && map.isSourceLoaded('terrain-dem');
          if (!vectorReady || !terrainReady) setTerrainLimited(true);
        }, 8000);
      }
    };

    map.on('style.load', addLocalLayers);
    map.on('idle', () => {
      if (!fallbackActivated
        && map.getSource('openmaptiles')
        && map.getSource('terrain-dem')
        && map.isSourceLoaded('openmaptiles')
        && map.isSourceLoaded('terrain-dem')) {
        if (contextTimer) clearTimeout(contextTimer);
        setTerrainLimited(false);
      }
    });
    map.on('error', (event) => {
      const sourceId = (event as any).sourceId as string | undefined;
      if (!localLayersAdded && !fallbackActivated && sourceId === 'openmaptiles') {
        activateLocalFallback();
      }
    });

    return () => {
      for (const layerId of runLayerIds) {
        map.off('click', layerId, handleRunClick);
        map.off('mouseenter', layerId, showPointer);
        map.off('mouseleave', layerId, hidePointer);
      }
      if (contextTimer) clearTimeout(contextTimer);
      if (startupTimer) clearTimeout(startupTimer);
      map.off('style.load', addLocalLayers);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const bounds = initialBoundsRef.current;
    if (!map || !bounds || !ready || !map.isStyleLoaded() || !map.getLayer('verified-run-casing')) return;
    applyMapMode(
      map,
      mapMode,
      bounds,
      initialPaddingRef.current,
      terrainAvailableRef.current,
      false,
    );
  }, [mapMode, ready]);

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

    const resortView = mapMode === 'resort' && terrainAvailableRef.current;
    const baseOpacity = selectedRunId ? (resortView ? 0.44 : 0.26) : 0.94;
    map.setPaintProperty('verified-run-casing', 'line-opacity', selectedRunId ? (resortView ? 0.3 : 0.16) : 0.9);
    for (const layerId of ['verified-green', 'verified-blue', 'verified-black']) {
      map.setPaintProperty(layerId, 'line-opacity', baseOpacity);
    }
    map.setPaintProperty('verified-expert', 'line-opacity', selectedRunId ? (resortView ? 0.5 : 0.3) : 0.98);
    map.setPaintProperty('verified-expert-markers', 'line-opacity', selectedRunId ? 0.3 : 0.95);
    map.setPaintProperty('heavenly-lifts-topographic', 'line-opacity', selectedRunId ? 0.48 : 0.92);
    for (const layerId of ['heavenly-lift-casing', 'heavenly-lifts', 'heavenly-gondola-casing', 'heavenly-gondola']) {
      map.setPaintProperty(layerId, 'line-opacity', selectedRunId ? 0.58 : (layerId.includes('gondola') ? 0.96 : 0.88));
    }

    if (selectedRunId) {
      const bounds = geometryBounds(selectedRunId);
      if (bounds && !bounds.isEmpty()) {
        if (resortView) {
          const focusCamera = map.cameraForBounds(bounds, { padding: 90, maxZoom: 15 });
          if (focusCamera) {
            const focusZoom = focusCamera.zoom ?? map.getZoom();
            map.easeTo({
              center: focusCamera.center,
              zoom: Math.min(focusZoom - 1.8, 13.2),
              duration: 650,
              bearing: resortCamera().bearing,
              pitch: resortCamera().pitch,
            });
          }
        } else {
          map.fitBounds(bounds, { padding: 90, duration: 650, maxZoom: 15 });
        }
      }
    }
  }, [mapMode, ready, selectedRunId]);

  if (failed) {
    return <View style={styles.fallback} accessibilityRole="alert">
      <Text style={styles.fallbackKicker}>MAP UNAVAILABLE</Text>
      <Text style={styles.fallbackTitle}>The mountain lines could not load.</Text>
      <Text style={styles.fallbackCopy}>The Heavenly run directory and details still work. Try reloading in a WebGL-capable browser.</Text>
    </View>;
  }

  return <View style={styles.container}>
    {!ready ? <View style={styles.loading}><ActivityIndicator color={colors.orange} /><Text style={styles.loadingText}>LOADING WINTER TERRAIN</Text></View> : null}
    <div
      ref={containerRef}
      aria-label="Interactive Heavenly prototype trail map"
      role="region"
      data-testid="heavenly-map-canvas"
      style={{ width: '100%', height: '100%', minHeight: 520 }}
    />
    {ready ? <View style={styles.viewToggle} accessibilityRole="tablist">
      <Pressable
        testID="resort-view-toggle"
        accessibilityRole="tab"
        accessibilityState={{ selected: mapMode === 'resort', disabled: terrainLimited }}
        disabled={terrainLimited}
        onPress={() => setMapMode('resort')}
        style={[styles.viewToggleButton, mapMode === 'resort' && styles.viewToggleButtonActive, terrainLimited && styles.viewToggleButtonDisabled]}
      >
        <Text style={[styles.viewToggleText, mapMode === 'resort' && styles.viewToggleTextActive]}>RESORT 3D</Text>
      </Pressable>
      <Pressable
        testID="topographic-view-toggle"
        accessibilityRole="tab"
        accessibilityState={{ selected: mapMode === 'topographic' }}
        onPress={() => setMapMode('topographic')}
        style={[styles.viewToggleButton, mapMode === 'topographic' && styles.viewToggleButtonActive]}
      >
        <Text style={[styles.viewToggleText, mapMode === 'topographic' && styles.viewToggleTextActive]}>TOPO 2D</Text>
      </Pressable>
    </View> : null}
    {terrainLimited ? <View style={styles.terrainNotice} accessibilityRole="alert">
      <Text style={styles.terrainNoticeText}>Terrain context unavailable · local runs and lifts remain active</Text>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { minHeight: 520, width: '100%', backgroundColor: '#eaf0e7', position: 'relative', overflow: 'hidden' },
  loading: { ...StyleSheet.absoluteFillObject, zIndex: 2, backgroundColor: '#eaf0e7', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  viewToggle: { position: 'absolute', zIndex: 5, left: 12, bottom: 12, flexDirection: 'row', backgroundColor: 'rgba(246,240,228,.94)', borderColor: colors.forest, borderWidth: 1, padding: 3, gap: 3 },
  viewToggleButton: { minHeight: 32, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  viewToggleButtonActive: { backgroundColor: colors.forest },
  viewToggleButtonDisabled: { opacity: 0.45 },
  viewToggleText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.8 },
  viewToggleTextActive: { color: colors.lime },
  terrainNotice: { position: 'absolute', zIndex: 4, left: 12, right: 12, top: 58, backgroundColor: 'rgba(246,240,228,.94)', borderColor: colors.orange, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  terrainNoticeText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, lineHeight: 11, letterSpacing: .65, textTransform: 'uppercase' },
  fallback: { minHeight: 420, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 35 },
  fallbackKicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  fallbackTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, textAlign: 'center', marginTop: 10 },
  fallbackCopy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 560, marginTop: 11 },
});
