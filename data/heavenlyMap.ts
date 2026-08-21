import runtimeMapData from './maps/heavenly/runtime-map-data.json';

export type MapCoordinate = [number, number];

export type HeavenlyMapFeature = {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'LineString' | 'MultiLineString' | 'Polygon' | 'GeometryCollection';
    coordinates?: unknown;
    geometries?: unknown[];
  };
  properties: Record<string, string | number | null>;
};

export type HeavenlyRuntimeMapData = {
  schemaVersion: number;
  generatedFrom: {
    osmSnapshotTimestamp: string;
    matchReportGeneratedAt: string;
    policy: string;
  };
  attribution: {
    text: string;
    license: string;
    url: string;
  };
  bounds: [MapCoordinate, MapCoordinate];
  verifiedRunCount: number;
  verifiedRunFeatureCount: number;
  liftFeatureCount: number;
  runGeometryIndex: Record<string, string[]>;
  verifiedRuns: {
    type: 'FeatureCollection';
    features: HeavenlyMapFeature[];
  };
  lifts: {
    type: 'FeatureCollection';
    features: HeavenlyMapFeature[];
  };
};

export const heavenlyMapData = runtimeMapData as unknown as HeavenlyRuntimeMapData;

export const heavenlyVerifiedRunIds = new Set(
  Object.keys(heavenlyMapData.runGeometryIndex),
);
