import {
  type FilterSpecification,
  LngLatBounds,
  Map as MapLibreMap,
  type MapLayerMouseEvent,
  NavigationControl,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { heavenlyMapData } from '@/data/heavenlyMap';
import { colors, fonts } from '@/theme';

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

const mapStyle: StyleSpecification = {
  version: 8,
  name: 'Flurra Heavenly prototype',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#bcdde2' },
    },
  ],
};

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

  useEffect(() => {
    selectRunRef.current = onSelectRun;
  }, [onSelectRun]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: mapStyle,
        bounds: heavenlyMapData.bounds,
        fitBoundsOptions: { padding: 42 },
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
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const handleRunClick = (event: MapLayerMouseEvent) => {
      const runId = event.features?.[0]?.properties?.flurraRunId;
      if (typeof runId === 'string') selectRunRef.current(runId);
    };
    const showPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
    const hidePointer = () => { map.getCanvas().style.cursor = ''; };

    map.on('load', () => {
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

      setReady(true);
    });

    map.on('error', (event) => {
      if (!map.loaded() && event.error) setFailed(true);
    });

    return () => {
      for (const layerId of runLayerIds) {
        map.off('click', layerId, handleRunClick);
        map.off('mouseenter', layerId, showPointer);
        map.off('mouseleave', layerId, hidePointer);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
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
    {!ready ? <View style={styles.loading}><ActivityIndicator color={colors.orange} /><Text style={styles.loadingText}>LOADING LOCAL TRAIL GEOMETRY</Text></View> : null}
    <div
      ref={containerRef}
      aria-label="Interactive Heavenly prototype trail map"
      role="region"
      data-testid="heavenly-map-canvas"
      style={{ width: '100%', height: '100%', minHeight: 520 }}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { minHeight: 520, width: '100%', backgroundColor: colors.blue, position: 'relative', overflow: 'hidden' },
  loading: { ...StyleSheet.absoluteFillObject, zIndex: 2, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  fallback: { minHeight: 420, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 35 },
  fallbackKicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8 },
  fallbackTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, textAlign: 'center', marginTop: 10 },
  fallbackCopy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 560, marginTop: 11 },
});
