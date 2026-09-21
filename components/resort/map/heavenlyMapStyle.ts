import type { StyleSpecification } from 'maplibre-gl';

export const HEAVENLY_WINTER_PALETTE = {
  snow: '#f4f2ea',
  snowShadow: '#e5e9e3',
  openLand: '#dde2d9',
  forest: '#536f62',
  ice: '#fbfaf4',
  water: '#b9d0d7',
  waterway: '#91b5bd',
  developedLand: '#d8d6cf',
  roadCasing: '#faf7ef',
  road: '#a99f91',
  building: '#c8c5bd',
  contour: '#71817c',
  hillshadeShadow: '#819496',
  hillshadeAccent: '#aebbb8',
  hillshadeHighlight: '#fffef9',
} as const;

export const OPEN_FREE_MAP_ATTRIBUTION = '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';
export const TERRAIN_ATTRIBUTION = 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Mapzen</a> / <a href="https://www.usgs.gov/3d-elevation-program" target="_blank" rel="noopener noreferrer">USGS</a>';
export const OSM_GEOMETRY_ATTRIBUTION = 'Trail geometry © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

export const heavenlyLocalFallbackStyle: StyleSpecification = {
  version: 8,
  name: 'Flurra Heavenly local fallback',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'winter-paper',
      type: 'background',
      paint: { 'background-color': HEAVENLY_WINTER_PALETTE.snow },
    },
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
      {
        id: 'winter-paper',
        type: 'background',
        paint: { 'background-color': HEAVENLY_WINTER_PALETTE.snow },
      },
      {
        id: 'winter-open-land',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: [
          'in',
          ['get', 'class'],
          ['literal', ['grass', 'scrub', 'farmland', 'rock', 'sand', 'wetland']],
        ],
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.openLand,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.08, 14, 0.18, 16, 0.24],
        },
      },
      {
        id: 'winter-forest',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'wood'],
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.forest,
          'fill-antialias': false,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.04, 12, 0.07, 14, 0.16, 16, 0.3],
        },
      },
      {
        id: 'winter-ice',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'ice'],
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.ice,
          'fill-opacity': 0.82,
        },
      },
      {
        id: 'winter-water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.water,
          'fill-opacity': 0.64,
        },
      },
      {
        id: 'winter-developed-land',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        minzoom: 12,
        filter: [
          'in',
          ['get', 'class'],
          ['literal', ['residential', 'commercial', 'industrial', 'retail']],
        ],
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.developedLand,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.05, 16, 0.15],
        },
      },
      {
        id: 'terrain-hillshade',
        type: 'hillshade',
        source: 'terrain-dem',
        paint: {
          'hillshade-shadow-color': HEAVENLY_WINTER_PALETTE.hillshadeShadow,
          'hillshade-highlight-color': HEAVENLY_WINTER_PALETTE.hillshadeHighlight,
          'hillshade-accent-color': HEAVENLY_WINTER_PALETTE.hillshadeAccent,
          'hillshade-illumination-anchor': 'map',
          'hillshade-illumination-direction': 315,
          'hillshade-exaggeration': 0.31,
        },
      },
      {
        id: 'winter-waterways',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        minzoom: 12,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': HEAVENLY_WINTER_PALETTE.waterway,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.45, 16, 1.05],
          'line-opacity': 0.3,
        },
      },
      {
        id: 'winter-road-casing',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 11.5,
        filter: [
          'in',
          ['get', 'class'],
          ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']],
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': HEAVENLY_WINTER_PALETTE.roadCasing,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 0.8, 14, 1.8, 16, 3.6],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.5, 0.18, 15, 0.52],
        },
      },
      {
        id: 'winter-roads',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 11.5,
        filter: [
          'in',
          ['get', 'class'],
          ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']],
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': HEAVENLY_WINTER_PALETTE.road,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 0.35, 14, 0.75, 16, 1.45],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11.5, 0.1, 15, 0.34],
        },
      },
      {
        id: 'winter-buildings',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-color': HEAVENLY_WINTER_PALETTE.building,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0.08, 17, 0.32],
        },
      },
    ],
  };
}
