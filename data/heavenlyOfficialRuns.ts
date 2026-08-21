export type OfficialRunDifficulty =
  | 'easier'
  | 'more-difficult'
  | 'most-difficult'
  | 'experts-only';

export type HeavenlyMountainArea =
  | 'Mott & Killebrew Canyons'
  | 'Galaxy / Stagecoach'
  | 'Boulder / North Bowl'
  | 'East Peak / Dipper'
  | 'Sky / Canyon'
  | 'California'
  | 'Top of Gondola';

export const HEAVENLY_OFFICIAL_WINTER_MAP_REF =
  'heavenly-official-winter-trail-map' as const;
export const HEAVENLY_OFFICIAL_2018_19_WINTER_MAP_REF =
  'heavenly-official-winter-trail-map-2018-19' as const;

export type HeavenlySourceMapRef =
  | typeof HEAVENLY_OFFICIAL_WINTER_MAP_REF
  | typeof HEAVENLY_OFFICIAL_2018_19_WINTER_MAP_REF;

export type HeavenlyAlternateRunName = {
  name: string;
  recordType: 'alternate-historical-name';
  relationship: 'map-version-conflict';
  sourceMapRef: HeavenlySourceMapRef;
  note: string;
};

export type HeavenlyOfficialRun = {
  id: string;
  slug: string;
  officialName: string;
  officialDifficulty: OfficialRunDifficulty;
  mountainArea: HeavenlyMountainArea;
  geometryRef: string | null;
  recordType: 'map-derived-run';
  verificationStatus: 'provisional';
  alternateNames: HeavenlyAlternateRunName[];
  sourceMapRef: HeavenlySourceMapRef;
};

const officialRun = (
  slug: string,
  officialName: string,
  officialDifficulty: OfficialRunDifficulty,
  mountainArea: HeavenlyMountainArea,
  alternateNames: HeavenlyAlternateRunName[] = [],
): HeavenlyOfficialRun => ({
  id: slug,
  slug,
  officialName,
  officialDifficulty,
  mountainArea,
  geometryRef: null,
  recordType: 'map-derived-run',
  verificationStatus: 'provisional',
  alternateNames,
  sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
});

/**
 * Permanent trail facts transcribed from the attached official Heavenly winter map.
 *
 * This file deliberately contains no saved/completed state, live conditions,
 * grooming state, community reports, or Flurra editorial ratings.
 */
export const heavenlyOfficialRuns: HeavenlyOfficialRun[] = [
  // Mott & Killebrew Canyons
  officialRun('boundary-chutes', 'Boundary Chutes', 'experts-only', 'Mott & Killebrew Canyons'),
  officialRun('outer-limits', 'Outer Limits', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('pipeline', 'Pipeline', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('ramarrahs', "Ramarrah's", 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('the-fingers', 'The Fingers', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('stateline-chute', 'Stateline Chute', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('bobs-boulevard', "Bob's Boulevard", 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('sweetwater', 'Sweetwater', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('the-y', 'The "Y"', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('bills', "Bill's", 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('snake-eyes', 'Snake Eyes', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('lone-wolf', 'Lone Wolf', 'most-difficult', 'Mott & Killebrew Canyons', [
    {
      name: 'Widow Maker',
      recordType: 'alternate-historical-name',
      relationship: 'map-version-conflict',
      sourceMapRef: HEAVENLY_OFFICIAL_2018_19_WINTER_MAP_REF,
      note: 'Appears on another official Heavenly map version; retained as a conflict for later verification, not as a separate run.',
    },
  ]),
  officialRun('hully-gully', 'Hully Gully', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('pinenuts', 'Pinenuts', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('southern-comfort', 'Southern Comfort', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('on-hold', 'On Hold', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('promised-land', 'Promise Land', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('north-40', 'North 40', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('hemlock', 'Hemlock', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('ernies', "Ernie's", 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('rim-trail', 'Rim Trail', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('perimeter', 'Perimeter', 'more-difficult', 'Mott & Killebrew Canyons'),
  officialRun('upper-perimeter', 'Upper Perimeter', 'more-difficult', 'Mott & Killebrew Canyons'),
  officialRun('milky-way-bowl', 'Milky Way Bowl', 'most-difficult', 'Mott & Killebrew Canyons'),
  officialRun('milky-way', 'Milky Way', 'most-difficult', 'Mott & Killebrew Canyons'),

  // Galaxy & Stagecoach
  officialRun('galaxy', 'Galaxy', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('galaxy-line', 'Galaxy Line', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('outlaw', 'Outlaw', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('nevada-trail', 'Nevada Trail', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('mineshaft', 'Mineshaft', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('comstock', 'Comstock', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('stagecoach', 'Stagecoach', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('emilys-run', "Emily's Run", 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('lower-stagecoach', 'Lower Stagecoach', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('stagecoach-return', 'Stagecoach Return', 'more-difficult', 'Galaxy / Stagecoach'),
  officialRun('stagecoach-woods', 'Stagecoach Woods', 'most-difficult', 'Galaxy / Stagecoach'),

  // Boulder & North Bowl
  officialRun('boulder-bowl', 'Boulder Bowl', 'easier', 'Boulder / North Bowl'),
  officialRun('boulder-chute', 'Boulder Chute', 'more-difficult', 'Boulder / North Bowl'),
  officialRun('upper-north-bowl', 'Upper North Bowl', 'more-difficult', 'Boulder / North Bowl'),
  officialRun('100-saddle', '$100 Saddle', 'more-difficult', 'Boulder / North Bowl'),
  officialRun('north-bowl', 'North Bowl', 'most-difficult', 'Boulder / North Bowl'),
  officialRun('bohemian-grove', 'Bohemian Grove', 'most-difficult', 'Boulder / North Bowl'),
  officialRun('nevada-woods', 'Nevada Woods', 'most-difficult', 'Boulder / North Bowl'),
  officialRun('the-burn', 'The Burn', 'most-difficult', 'Boulder / North Bowl'),
  officialRun('the-pines', 'The Pines', 'more-difficult', 'Boulder / North Bowl'),

  // East Peak & Dipper
  officialRun('olympic-downhill', 'Olympic Downhill', 'more-difficult', 'East Peak / Dipper'),
  officialRun('pepis', "Pepi's", 'more-difficult', 'East Peak / Dipper'),
  officialRun('orion', 'Orion', 'more-difficult', 'East Peak / Dipper'),
  officialRun('jacks', "Jack's", 'more-difficult', 'East Peak / Dipper'),
  officialRun('nova', 'Nova', 'more-difficult', 'East Peak / Dipper'),
  officialRun('lower-dipper-return', 'Lower Dipper Return', 'more-difficult', 'East Peak / Dipper'),
  officialRun('upper-dipper-return', 'Upper Dipper Return', 'more-difficult', 'East Peak / Dipper'),
  officialRun('orions-belt', "Orion's Belt", 'more-difficult', 'East Peak / Dipper'),
  officialRun('big-dipper', 'Big Dipper', 'more-difficult', 'East Peak / Dipper'),
  officialRun('meteor', 'Meteor', 'more-difficult', 'East Peak / Dipper'),
  officialRun('dipper-bowl', 'Dipper Bowl', 'most-difficult', 'East Peak / Dipper'),
  officialRun('dipper-line', 'Dipper Line', 'most-difficult', 'East Peak / Dipper'),
  officialRun('dipper-woods', 'Dipper Woods', 'most-difficult', 'East Peak / Dipper'),
  officialRun('aries-woods', 'Aries Woods', 'most-difficult', 'East Peak / Dipper'),
  officialRun('cosmic-wave', 'Cosmic Wave', 'more-difficult', 'East Peak / Dipper'),
  officialRun('aries', 'Aries', 'more-difficult', 'East Peak / Dipper'),
  officialRun('little-dipper', 'Little Dipper', 'most-difficult', 'East Peak / Dipper'),
  officialRun('comet', 'Comet', 'more-difficult', 'East Peak / Dipper'),
  officialRun('bonanza', 'Bonanza', 'more-difficult', 'East Peak / Dipper'),
  officialRun('crossover', 'Crossover', 'more-difficult', 'East Peak / Dipper'),
  officialRun('silver-spur', 'Silver Spur', 'more-difficult', 'East Peak / Dipper'),
  officialRun('ponderosa', 'Ponderosa', 'more-difficult', 'East Peak / Dipper'),
  officialRun('cloud-9', 'Cloud 9', 'more-difficult', 'East Peak / Dipper'),
  officialRun('49er', "49'er", 'more-difficult', 'East Peak / Dipper'),
  officialRun('sams-dream', "Sam's Dream", 'more-difficult', 'East Peak / Dipper'),

  // Tamarack, Sky & Canyon
  officialRun('cascade', 'Cascade', 'more-difficult', 'Sky / Canyon'),
  officialRun('tamarack-return', 'Tamarack Return', 'more-difficult', 'Sky / Canyon'),
  officialRun('california-trail', 'California Trail', 'more-difficult', 'Sky / Canyon'),
  officialRun('skyline-trail', 'Skyline Trail', 'more-difficult', 'Sky / Canyon'),
  officialRun('sand-dunes', 'Sand Dunes', 'most-difficult', 'Sky / Canyon'),
  officialRun('ski-ways-glades', 'Ski Ways Glades', 'most-difficult', 'Sky / Canyon'),
  officialRun('pinnacles', 'Pinnacles', 'most-difficult', 'Sky / Canyon'),
  officialRun('ellies', "Ellie's", 'most-difficult', 'Sky / Canyon'),
  officialRun('ellies-swing', "Ellie's Swing", 'most-difficult', 'Sky / Canyon'),
  officialRun('express-line', 'Express Line', 'most-difficult', 'Sky / Canyon'),
  officialRun('lizs', "Liz's", 'more-difficult', 'Sky / Canyon'),
  officialRun('canyonland', 'Canyonland', 'more-difficult', 'Sky / Canyon'),
  officialRun('sky', 'Sky', 'most-difficult', 'Sky / Canyon'),
  officialRun('canyon', 'Canyon', 'most-difficult', 'Sky / Canyon'),
  officialRun('double-down', 'Double Down', 'most-difficult', 'Sky / Canyon'),
  officialRun('high-five', 'High Five', 'more-difficult', 'Sky / Canyon'),
  officialRun('ridge-run', 'Ridge Run', 'more-difficult', 'Sky / Canyon'),
  officialRun('maggies-canyon', "Maggie's Canyon", 'most-difficult', 'Sky / Canyon'),
  officialRun('sky-chute', 'Sky Chute', 'more-difficult', 'Sky / Canyon'),

  // California
  officialRun('upper-powderbowl', 'Upper Powderbowl', 'more-difficult', 'California'),
  officialRun('ridge-bowl', 'Ridge Bowl', 'most-difficult', 'California'),
  officialRun('powderbowl-run', 'Powderbowl Run', 'more-difficult', 'California'),
  officialRun('powderbowl-woods', 'Powderbowl Woods', 'most-difficult', 'California'),
  officialRun('upper-mombo', 'Upper Mombo', 'more-difficult', 'California'),
  officialRun('mombo', 'Mombo', 'more-difficult', 'California'),
  officialRun('fall-line', 'Fall Line', 'most-difficult', 'California'),
  officialRun('powder-line', 'Powder Line', 'most-difficult', 'California'),
  officialRun('waterfall', 'Waterfall', 'most-difficult', 'California'),
  officialRun('swing-trail', 'Swing Trail', 'more-difficult', 'California'),
  officialRun('steins-way', 'Steins Way', 'more-difficult', 'California'),
  officialRun('maggies', "Maggie's", 'easier', 'California'),
  officialRun('patsys', "Patsy's", 'easier', 'California'),
  officialRun('round-a-bout', 'Round-A-Bout', 'more-difficult', 'California'),
  officialRun('hogsback', 'Hogsback', 'most-difficult', 'California'),
  officialRun('east-bowl-woods', 'East Bowl Woods', 'most-difficult', 'California'),
  officialRun('east-bowl', 'East Bowl', 'experts-only', 'California'),
  officialRun('pistol', 'Pistol', 'most-difficult', 'California'),
  officialRun('gunbarrel', 'Gunbarrel', 'experts-only', 'California'),
  officialRun('the-face', 'The Face', 'experts-only', 'California'),
  officialRun('world-cup', 'World Cup', 'more-difficult', 'California'),
  officialRun('west-bowl', 'West Bowl', 'most-difficult', 'California'),

  // Top of Gondola learning terrain
  officialRun('von-schmidt', 'Von Schmidt', 'more-difficult', 'Top of Gondola'),
  officialRun('easy-street', 'Easy Street', 'easier', 'Top of Gondola'),
  officialRun('big-easy', 'Big Easy', 'easier', 'Top of Gondola'),
  officialRun('poma-trail', 'Poma Trail', 'easier', 'California'),
  officialRun('enchanted-forest', 'Enchanted Forest', 'easier', 'California'),
];

export type HeavenlyMapFeatureKind =
  | 'terrain-park'
  | 'expert-terrain-area'
  | 'terrain-landmark';

export type HeavenlyMapFeature = {
  id: string;
  name: string;
  recordType: 'map-feature';
  featureKind: HeavenlyMapFeatureKind;
  mountainArea: HeavenlyMountainArea;
  geometryRef: string | null;
  sourceMapRef: HeavenlySourceMapRef;
  note: string;
};

/**
 * Named map features that are useful for future map navigation but are not
 * counted as distinct run-directory records.
 */
export const heavenlyMapFeatures: HeavenlyMapFeature[] = [
  {
    id: 'groove-park',
    name: 'Groove Park',
    recordType: 'map-feature',
    featureKind: 'terrain-park',
    mountainArea: 'California',
    geometryRef: null,
    sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
    note: 'Terrain park label, not a distinct run-directory record.',
  },
  {
    id: 'mott-canyon',
    name: 'Mott Canyon',
    recordType: 'map-feature',
    featureKind: 'expert-terrain-area',
    mountainArea: 'Mott & Killebrew Canyons',
    geometryRef: null,
    sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
    note: 'Parent expert-terrain area containing separately named runs.',
  },
  {
    id: 'killebrew-canyon',
    name: 'Killebrew Canyon',
    recordType: 'map-feature',
    featureKind: 'expert-terrain-area',
    mountainArea: 'Mott & Killebrew Canyons',
    geometryRef: null,
    sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
    note: 'Parent expert-terrain area containing separately named runs.',
  },
  {
    id: 'rocky-point',
    name: 'Rocky Point',
    recordType: 'map-feature',
    featureKind: 'terrain-landmark',
    mountainArea: 'Mott & Killebrew Canyons',
    geometryRef: null,
    sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
    note: 'Named terrain location without a distinct run difficulty marker.',
  },
];

export const heavenlyTrailCatalogProvenance = {
  currentPublishedTrailCount: {
    value: 111,
    recordType: 'official-current-resort-count' as const,
    sourceUrl: 'https://www.skiheavenly.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
    observedOn: '2026-08-20',
    note: 'Current resort-published count; not the size of Flurra\'s map-derived directory.',
  },
  mapDerivedDirectory: {
    value: heavenlyOfficialRuns.length,
    recordType: 'provisional-map-derived-directory-count' as const,
    sourceMapRef: HEAVENLY_OFFICIAL_WINTER_MAP_REF,
    note: 'Internal Flurra directory size. Do not present this as Heavenly\'s official trail count.',
  },
  sourceMaps: {
    [HEAVENLY_OFFICIAL_WINTER_MAP_REF]: {
      recordType: 'source-map-version' as const,
      resort: 'Heavenly',
      version: 'User-supplied official winter trail map; edition not printed in the supplied image',
      sourceUrl: null,
      note: 'Primary source for provisional run names and difficulty symbols in this directory.',
    },
    [HEAVENLY_OFFICIAL_2018_19_WINTER_MAP_REF]: {
      recordType: 'source-map-version' as const,
      resort: 'Heavenly',
      version: '2018/19 archived official winter trail-map artwork',
      sourceUrl: 'https://www.skiheavenly.com/-/media/heavenly/files/heavenlytrailmap_201819.ashx',
      note: 'Secondary official version retained for alternate or historical-name reconciliation.',
    },
  },
} as const;
