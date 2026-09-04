import type { StyleSpecification } from 'maplibre-gl';

export const OPEN_FREE_MAP_ATTRIBUTION = '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';
export const TERRAIN_ATTRIBUTION = 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Mapzen</a> / <a href="https://www.usgs.gov/3d-elevation-program" target="_blank" rel="noopener noreferrer">USGS</a>';
export const OSM_GEOMETRY_ATTRIBUTION = 'Trail geometry © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

export const heavenlyLocalFallbackStyle: StyleSpecification = {
  version: 8,
  name: 'Flurra Heavenly local fallback',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    { id: 'winter-paper', type: 'background', paint: { 'background-color': '#eaf0e7' } },
  ],
};

export function createHeavenlyWinterStyle(demTileUrl: string): StyleSpecification {
  return {
    version: 8,
    name: 'Flurra Heavenly winter topographic map',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution: OPEN_FREE_MAP_ATTRIBUTION,
      },
      'terrain-dem': {
        type: 'raster-dem',
        encoding: 'terrarium',
        tiles: [demTileUrl],
        tileSize: 256,
        maxzoom: 15,
        attribution: TERRAIN_ATTRIBUTION,
      },
    },
    layers: [
      { id: 'winter-paper', type: 'background', paint: { 'background-color': '#eaf0e7' } },
      {
        id: 'winter-open-land',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'grass'],
        paint: {
          'fill-color': '#dbe3d7',
          'fill-opacity': 0.2,
          'fill-outline-color': '#dbe3d7',
        },
      },
      {
        id: 'winter-forest',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'wood'],
        paint: {
          'fill-color': '#bfd0c6',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.42, 14, 0.5],
          'fill-outline-color': '#bfd0c6',
        },
      },
      {
        id: 'winter-ice',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'ice'],
        paint: {
          'fill-color': '#f7faf4',
          'fill-opacity': 0.74,
          'fill-outline-color': '#f7faf4',
        },
      },
      {
        id: 'winter-water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': '#a9cfda', 'fill-opacity': 0.82 },
      },
      {
        id: 'terrain-hillshade',
        type: 'hillshade',
        source: 'terrain-dem',
        paint: {
          'hillshade-shadow-color': '#42645f',
          'hillshade-highlight-color': '#fffdf5',
          'hillshade-accent-color': '#6f8d87',
          'hillshade-exaggeration': 0.44,
        },
      },
      {
        id: 'winter-waterways',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        minzoom: 12,
        paint: { 'line-color': '#8dbbc8', 'line-width': 1, 'line-opacity': 0.48 },
      },
    ],
  };
}
