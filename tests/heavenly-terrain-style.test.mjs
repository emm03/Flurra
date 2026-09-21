import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHeavenlyWinterStyle,
  heavenlyLocalFallbackStyle,
  OPEN_FREE_MAP_ATTRIBUTION,
  TERRAIN_ATTRIBUTION,
} from '../components/resort/map/heavenlyMapStyle.ts';

const style = createHeavenlyWinterStyle('dem://terrain/{z}/{x}/{y}');
const layersById = new Map(style.layers.map((layer) => [layer.id, layer]));

test('winter style keeps the approved open geographic providers and attribution', () => {
  assert.equal(style.sources.openmaptiles.url, 'https://tiles.openfreemap.org/planet');
  assert.deepEqual(style.sources['terrain-dem'].tiles, ['dem://terrain/{z}/{x}/{y}']);
  assert.match(OPEN_FREE_MAP_ATTRIBUTION, /OpenStreetMap contributors/);
  assert.match(OPEN_FREE_MAP_ATTRIBUTION, /OpenFreeMap/);
  assert.match(OPEN_FREE_MAP_ATTRIBUTION, /OpenMapTiles/);
  assert.match(TERRAIN_ATTRIBUTION, /Mapzen/);
  assert.match(TERRAIN_ATTRIBUTION, /USGS/);
});

test('winter style supplies restrained provider-backed mountain context', () => {
  for (const layerId of [
    'winter-open-land',
    'winter-forest',
    'winter-water',
    'winter-developed-land',
    'terrain-hillshade',
    'winter-waterways',
    'winter-road-casing',
    'winter-roads',
    'winter-buildings',
  ]) {
    assert.ok(layersById.has(layerId), `${layerId} should be part of the winter style`);
  }

  assert.equal(layersById.get('winter-forest').paint['fill-antialias'], false);
  assert.equal(layersById.get('terrain-hillshade').paint['hillshade-illumination-anchor'], 'map');
  assert.equal(layersById.get('terrain-hillshade').paint['hillshade-illumination-direction'], 315);
  assert.ok(layersById.get('terrain-hillshade').paint['hillshade-exaggeration'] < 0.4);
});

test('local fallback contains no remote terrain or vector source references', () => {
  assert.deepEqual(heavenlyLocalFallbackStyle.sources, {});
  assert.deepEqual(heavenlyLocalFallbackStyle.layers.map(({ id }) => id), ['winter-paper']);
});
