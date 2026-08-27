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
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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

const runLayerIds = [
  'verified-green',
  'verified-blue',
  'verified-black',
  'verified-expert',
  'verified-expert-markers',
  'selected-run',
];

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
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [terrainLimited, setTerrainLimited] = useState(false);

  useEffect(() => {
    selectRunRef.current = onSelectRun;
  }, [onSelectRun]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const forceTerrainFallback = new URLSearchParams(window.location.search).get('terrain') === 'fallback';
    const initialBounds = allRunGeometryBounds();
    const initialPadding = containerRef.current.clientWidth < 600 ? 34 : 48;
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
    setTerrainLimited(forceTerrainFallback);
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const activateLocalFallback = () => {
      if (fallbackActivated || localLayersAdded) return;
      fallbackActivated = true;
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
        paint: { 'line-color': '#34875a', 'line-width': 3.5, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-blue',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'more-difficult'],
        paint: { 'line-color': '#176da0', 'line-width': 3.5, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-black',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'most-difficult'],
        paint: { 'line-color': colors.deep, 'line-width': 3.7, 'line-opacity': 0.94 },
      });
      map.addLayer({
        id: 'verified-expert',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'experts-only'],
        paint: { 'line-color': '#070d0b', 'line-width': 5.2, 'line-opacity': 0.98 },
      });
      map.addLayer({
        id: 'verified-expert-markers',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'officialDifficulty'], 'experts-only'],
        paint: {
          'line-color': colors.orange,
          'line-width': 2,
          'line-dasharray': [1, 1.4],
          'line-opacity': 0.95,
        },
      });
      map.addLayer({
        id: 'heavenly-lifts',
        type: 'line',
        source: 'heavenly-lifts',
        paint: {
          'line-color': colors.orange,
          'line-width': 2.2,
          'line-dasharray': [2.3, 1.5],
          'line-opacity': 0.92,
        },
      });
      map.addLayer({
        id: 'selected-run-casing',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        paint: {
          'line-color': colors.paper,
          'line-width': 10,
          'line-opacity': 1,
        },
      });
      map.addLayer({
        id: 'selected-run',
        type: 'line',
        source: 'verified-runs',
        filter: ['==', ['get', 'flurraRunId'], '__none__'],
        paint: {
          'line-color': colors.lime,
          'line-width': 6.5,
          'line-opacity': 1,
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
      map.fitBounds(initialBounds, {
        padding: initialPadding,
        duration: 0,
        maxZoom: 13.3,
      });
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
    if (!map
      || !ready
      || !map.isStyleLoaded()
      || !map.getLayer('selected-run')
      || !map.getLayer('selected-run-casing')) return;
    const selectedFilter: FilterSpecification = [
      '==',
      ['get', 'flurraRunId'],
      selectedRunId ?? '__none__',
    ];
    map.setFilter('selected-run', selectedFilter);
    map.setFilter('selected-run-casing', selectedFilter);

    const baseOpacity = selectedRunId ? 0.26 : 0.94;
    map.setPaintProperty('verified-run-casing', 'line-opacity', selectedRunId ? 0.16 : 0.9);
    for (const layerId of ['verified-green', 'verified-blue', 'verified-black']) {
      map.setPaintProperty(layerId, 'line-opacity', baseOpacity);
    }
    map.setPaintProperty('verified-expert', 'line-opacity', selectedRunId ? 0.3 : 0.98);
    map.setPaintProperty('verified-expert-markers', 'line-opacity', selectedRunId ? 0.3 : 0.95);
    map.setPaintProperty('heavenly-lifts', 'line-opacity', selectedRunId ? 0.48 : 0.92);

    if (selectedRunId) {
      const bounds = geometryBounds(selectedRunId);
      if (bounds && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 90, duration: 650, maxZoom: 15 });
      }
    }
  }, [ready, selectedRunId]);

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
    {terrainLimited ? <View style={styles.terrainNotice} accessibilityRole="alert">
      <Text style={styles.terrainNoticeText}>Terrain context unavailable · local runs and lifts remain active</Text>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { minHeight: 520, width: '100%', backgroundColor: '#eaf0e7', position: 'relative', overflow: 'hidden' },
  loading: { ...StyleSheet.absoluteFillObject, zIndex: 2, backgroundColor: '#eaf0e7', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  terrainNotice: { position: 'absolute', zIndex: 4, left: 12, right: 12, top: 58, backgroundColor: 'rgba(246,240,228,.94)', borderColor: colors.orange, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  terrainNoticeText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, lineHeight: 11, letterSpacing: .65, textTransform: 'uppercase' },
  fallback: { minHeight: 420, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 35 },
  fallbackKicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  fallbackTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, textAlign: 'center', marginTop: 10 },
  fallbackCopy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 560, marginTop: 11 },
});
