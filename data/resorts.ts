export type ResortId =
  | 'heavenly'
  | 'palisades-tahoe'
  | 'northstar-california'
  | 'kirkwood'
  | 'mammoth-mountain';

export type ResortSupportState = 'full-map' | 'directory' | 'preview' | 'coming-soon';
export type ResortMapCapability = 'full-map' | 'map-data-in-progress' | 'directory-only' | 'coming-soon';
export type ResortTrailCapability = 'verified-directory' | 'directory-in-progress' | 'not-imported';
export type ResortRecommendationCapability = 'available' | 'data-required' | 'coming-soon';
export type ResortCommunityCapability = 'sample-preview' | 'preview' | 'coming-soon';
export type ResortPublicationStatus = 'published-beta' | 'preview' | 'coming-soon';
export type ResortIngestionStage = 'discovered' | 'imported' | 'normalized' | 'reconciled' | 'reviewed' | 'published';

export type ResortSource = {
  id: string;
  label: string;
  url: string;
  publisher: string;
  sourceType: 'official-resort' | 'official-trail-map' | 'wikimedia-commons';
  retrievedAt: string;
};

export type ResortFact = {
  value: number;
  display: string;
  label: string;
  sourceId: string;
  verificationStatus: 'official-published';
};

export type VerifiedResortPhoto = {
  kind: 'verified-photo';
  resortId: ResortId;
  uri: string;
  source: 'Wikimedia Commons';
  sourceUrl: string;
  creator: string;
  creditLine: string;
  licenseLabel: string;
  licenseUrl: string;
  usageStatus: 'verified-reusable';
  alt: string;
  verificationNote: string;
};

export type ResortImageMetadata = VerifiedResortPhoto | {
  kind: 'branded-placeholder';
  resortId: ResortId;
  source: 'Flurra';
  creditLine: 'Flurra branded placeholder';
  usageStatus: 'original-placeholder';
  alt: string;
  verificationNote: string;
};

export type ResortRecord = {
  id: ResortId;
  slug: ResortId;
  route: `/resorts/${ResortId}`;
  name: string;
  shortName: string;
  location: {
    city: string;
    state: string;
    region: string;
    display: string;
  };
  coordinates: { latitude: number; longitude: number } | null;
  description: string;
  aliases: readonly string[];
  searchTerms: readonly string[];
  facts: {
    verticalRise?: ResortFact;
    summitElevation?: ResortFact;
    baseElevation?: ResortFact;
    trailCount?: ResortFact;
    liftCount?: ResortFact;
    skiableAcres?: ResortFact;
  };
  heroImage: ResortImageMetadata;
  sources: readonly ResortSource[];
  supportState: ResortSupportState;
  capabilities: {
    map: ResortMapCapability;
    trails: ResortTrailCapability;
    recommendations: ResortRecommendationCapability;
    community: ResortCommunityCapability;
  };
  ingestion: {
    stage: ResortIngestionStage;
    sourceIdentifiers: readonly string[];
    geometryStatus: 'verified-local-snapshot' | 'not-imported';
    trailReconciliationStatus: 'reviewed' | 'not-started';
    verificationStatus: 'reviewed' | 'official-facts-only';
  };
  publicationStatus: ResortPublicationStatus;
  accent: string;
  accentSoft: string;
};

const retrievedAt = '2026-09-23';

const source = (
  id: string,
  label: string,
  url: string,
  publisher: string,
  sourceType: ResortSource['sourceType'],
): ResortSource => ({ id, label, url, publisher, sourceType, retrievedAt });

const fact = (value: number, display: string, label: string, sourceId: string): ResortFact => ({
  value,
  display,
  label,
  sourceId,
  verificationStatus: 'official-published',
});

const heavenlySources = [
  source('heavenly-mountain-info', 'Heavenly Mountain Information', 'https://www.skiheavenly.com/the-mountain/about-the-mountain/mountain-info.aspx', 'Heavenly Mountain Resort', 'official-resort'),
  source('heavenly-official-winter-map', 'Heavenly official winter trail map', 'https://www.skiheavenly.com/the-mountain/about-the-mountain/trail-map.aspx', 'Heavenly Mountain Resort', 'official-trail-map'),
  source('heavenly-photo-commons', 'Heavenly Ski With a Ranger photograph', 'https://commons.wikimedia.org/wiki/File:HeavenlySkiResortSkiWithARanger-LakeTahoeBMU-PRW-020_(52707086611).jpg', 'Wikimedia Commons', 'wikimedia-commons'),
] as const;

const palisadesSources = [
  source('palisades-mountain-stats', 'Palisades Tahoe Mountain Statistics', 'https://www.palisadestahoe.com/footer/mountain-statistics', 'Palisades Tahoe', 'official-resort'),
  source('palisades-photo-commons', 'Palisades Tahoe ski area photograph', 'https://commons.wikimedia.org/wiki/File:Palisades_Tahoe_ski_area.jpg', 'Wikimedia Commons', 'wikimedia-commons'),
] as const;

const northstarSources = [
  source('northstar-mountain-info', 'Northstar California Mountain Information', 'https://www.northstarcalifornia.com/the-mountain/about-the-mountain/mountain-info.aspx', 'Northstar California Resort', 'official-resort'),
  source('northstar-photo-commons', 'Northstar California Resort photograph', 'https://commons.wikimedia.org/wiki/File:Northstar_California_Resort,_California,_US.jpg', 'Wikimedia Commons', 'wikimedia-commons'),
] as const;

const kirkwoodSources = [
  source('kirkwood-mountain-info', 'Kirkwood Mountain Information', 'https://www.kirkwood.com/the-mountain/about-the-mountain/mountain-info.aspx', 'Kirkwood Mountain Resort', 'official-resort'),
  source('kirkwood-photo-commons', 'Kirkwood Mountain Resort photograph', 'https://commons.wikimedia.org/wiki/File:Kirkwood_Mountain_Resort,_Kirkwood,_California_(21385611049).jpg', 'Wikimedia Commons', 'wikimedia-commons'),
] as const;

const mammothSources = [
  source('mammoth-winter-map-stats', 'Mammoth Mountain Winter Trail Map & Mountain Stats', 'https://www.mammothmountain.com/on-the-mountain/winter-trail-map', 'Mammoth Mountain', 'official-resort'),
  source('mammoth-photo-commons', 'Mammoth Mountain Ski Area photograph', 'https://commons.wikimedia.org/wiki/File:Mammoth_Mountain_Ski_Area.jpg', 'Wikimedia Commons', 'wikimedia-commons'),
] as const;

export const resortRegistry: readonly ResortRecord[] = [
  {
    id: 'heavenly',
    slug: 'heavenly',
    route: '/resorts/heavenly',
    name: 'Heavenly Mountain Resort',
    shortName: 'Heavenly',
    location: { city: 'South Lake Tahoe', state: 'CA / NV', region: 'Lake Tahoe', display: 'South Lake Tahoe, CA / Stateline, NV' },
    coordinates: { latitude: 38.93972, longitude: -119.91196 },
    description: 'A two-state Lake Tahoe mountain with high-alpine views, long groomers, and experts-only gated canyon terrain.',
    aliases: ['heavenly', 'heavenly mountain', 'heavenly resort', 'heavenly mountain resort'],
    searchTerms: ['south lake tahoe heavenly', 'stateline heavenly', 'lake tahoe heavenly'],
    facts: {
      verticalRise: fact(3500, '3,500 ft', 'Vertical rise', 'heavenly-official-winter-map'),
      summitElevation: fact(10067, '10,067 ft', 'Highest elevation', 'heavenly-mountain-info'),
      baseElevation: fact(6657, '6,657 ft', 'Base elevation', 'heavenly-mountain-info'),
      trailCount: fact(111, '111', 'Published trails', 'heavenly-mountain-info'),
      liftCount: fact(28, '28', 'Published lifts', 'heavenly-mountain-info'),
      skiableAcres: fact(4800, '4,800', 'Skiable acres', 'heavenly-mountain-info'),
    },
    heroImage: {
      kind: 'verified-photo', resortId: 'heavenly',
      uri: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/HeavenlySkiResortSkiWithARanger-LakeTahoeBMU-PRW-020%20%2852707086611%29.jpg?width=1600',
      source: 'Wikimedia Commons', sourceUrl: heavenlySources[2].url,
      creator: 'USDA Forest Service, Region 5 Photography',
      creditLine: 'USDA Forest Service, Region 5 · Public domain',
      licenseLabel: 'Public domain (U.S. federal government work)',
      licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/United_States#Works_by_the_US_Federal_Government',
      usageStatus: 'verified-reusable',
      alt: 'Skiers participating in the Ski With a Ranger program at Heavenly Mountain Resort.',
      verificationNote: 'Wikimedia Commons identifies Heavenly and confirms the U.S. Forest Service public-domain basis.',
    },
    sources: heavenlySources,
    supportState: 'full-map',
    capabilities: { map: 'full-map', trails: 'verified-directory', recommendations: 'available', community: 'sample-preview' },
    ingestion: {
      stage: 'published',
      sourceIdentifiers: ['heavenly-official-winter-trail-map', 'openstreetmap-heavenly-local-snapshot'],
      geometryStatus: 'verified-local-snapshot',
      trailReconciliationStatus: 'reviewed',
      verificationStatus: 'reviewed',
    },
    publicationStatus: 'published-beta',
    accent: '#d8ed4b',
    accentSoft: '#dcebed',
  },
  {
    id: 'palisades-tahoe',
    slug: 'palisades-tahoe',
    route: '/resorts/palisades-tahoe',
    name: 'Palisades Tahoe',
    shortName: 'Palisades',
    location: { city: 'Olympic Valley & Alpine Meadows', state: 'CA', region: 'North Lake Tahoe', display: 'Olympic Valley & Alpine Meadows, CA' },
    coordinates: null,
    description: 'A connected two-mountain Lake Tahoe resort spanning Palisades and Alpine, with bowls, peaks, and broad terrain variety.',
    aliases: ['palisades', 'palisades tahoe', 'palisades tahoe resort', 'squaw valley', 'squaw alpine'],
    searchTerms: ['olympic valley palisades', 'alpine meadows palisades', 'north lake tahoe palisades'],
    facts: {
      verticalRise: fact(2850, '2,850 ft', 'Vertical rise', 'palisades-mountain-stats'),
      summitElevation: fact(9050, '9,050 ft', 'Peak elevation', 'palisades-mountain-stats'),
      baseElevation: fact(6200, '6,200 ft', 'Base elevation', 'palisades-mountain-stats'),
      trailCount: fact(288, '288', 'Published trails', 'palisades-mountain-stats'),
      liftCount: fact(39, '39', 'Published lifts', 'palisades-mountain-stats'),
      skiableAcres: fact(6000, '6,000', 'Skiable acres', 'palisades-mountain-stats'),
    },
    heroImage: {
      kind: 'verified-photo', resortId: 'palisades-tahoe',
      uri: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Palisades%20Tahoe%20ski%20area.jpg?width=1600',
      source: 'Wikimedia Commons', sourceUrl: palisadesSources[1].url,
      creator: 'John M', creditLine: 'John M · CC BY-SA 2.0',
      licenseLabel: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      usageStatus: 'verified-reusable', alt: 'Wide view of the Palisades Tahoe ski area and surrounding Sierra terrain.',
      verificationNote: 'The Commons record identifies the Palisades Tahoe ski area and preserves reviewed Flickr licensing.',
    },
    sources: palisadesSources,
    supportState: 'preview',
    capabilities: { map: 'map-data-in-progress', trails: 'not-imported', recommendations: 'data-required', community: 'preview' },
    ingestion: { stage: 'normalized', sourceIdentifiers: ['palisades-official-mountain-statistics'], geometryStatus: 'not-imported', trailReconciliationStatus: 'not-started', verificationStatus: 'official-facts-only' },
    publicationStatus: 'preview',
    accent: '#ef7f55', accentSoft: '#efe0d4',
  },
  {
    id: 'northstar-california',
    slug: 'northstar-california',
    route: '/resorts/northstar-california',
    name: 'Northstar California Resort',
    shortName: 'Northstar',
    location: { city: 'Truckee', state: 'CA', region: 'North Lake Tahoe', display: 'Truckee, CA' },
    coordinates: null,
    description: 'A wooded Tahoe resort centered on groomed progression, family terrain, and long routes from Mt. Pluto.',
    aliases: ['northstar', 'northstar california', 'northstar california resort', 'northstar resort'],
    searchTerms: ['truckee northstar', 'lake tahoe northstar', 'martis valley northstar'],
    facts: {
      summitElevation: fact(8610, '8,610 ft', 'Highest elevation', 'northstar-mountain-info'),
      baseElevation: fact(6330, '6,330 ft', 'Base elevation', 'northstar-mountain-info'),
      trailCount: fact(100, '100', 'Published trails', 'northstar-mountain-info'),
      liftCount: fact(20, '20', 'Published lifts', 'northstar-mountain-info'),
      skiableAcres: fact(3170, '3,170', 'Skiable acres', 'northstar-mountain-info'),
    },
    heroImage: {
      kind: 'verified-photo', resortId: 'northstar-california',
      uri: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Northstar%20California%20Resort%2C%20California%2C%20US.jpg?width=1600',
      source: 'Wikimedia Commons', sourceUrl: northstarSources[1].url,
      creator: 'Clyde Charles Brown', creditLine: 'Clyde Charles Brown · CC BY-SA 4.0',
      licenseLabel: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      usageStatus: 'verified-reusable', alt: 'Winter view across Northstar California Resort.',
      verificationNote: 'The Commons record identifies Northstar California Resort and provides creator-specific reuse terms.',
    },
    sources: northstarSources,
    supportState: 'preview',
    capabilities: { map: 'map-data-in-progress', trails: 'not-imported', recommendations: 'data-required', community: 'preview' },
    ingestion: { stage: 'normalized', sourceIdentifiers: ['northstar-official-mountain-info'], geometryStatus: 'not-imported', trailReconciliationStatus: 'not-started', verificationStatus: 'official-facts-only' },
    publicationStatus: 'preview',
    accent: '#f0b443', accentSoft: '#e9e1c8',
  },
  {
    id: 'kirkwood',
    slug: 'kirkwood',
    route: '/resorts/kirkwood',
    name: 'Kirkwood Mountain Resort',
    shortName: 'Kirkwood',
    location: { city: 'Kirkwood', state: 'CA', region: 'South Lake Tahoe region', display: 'Kirkwood, CA' },
    coordinates: null,
    description: 'A high-base Sierra mountain known for ridgelines, bowls, cornices, and a compact village south of Lake Tahoe.',
    aliases: ['kirkwood', 'kirkwood mountain', 'kirkwood resort', 'kirkwood mountain resort'],
    searchTerms: ['kirkwood california', 'south lake tahoe kirkwood'],
    facts: {
      verticalRise: fact(2000, '2,000 ft', 'Vertical drop', 'kirkwood-mountain-info'),
      summitElevation: fact(9800, '9,800 ft', 'Highest elevation', 'kirkwood-mountain-info'),
      baseElevation: fact(7800, '7,800 ft', 'Base elevation', 'kirkwood-mountain-info'),
      trailCount: fact(86, '86', 'Published trails', 'kirkwood-mountain-info'),
      liftCount: fact(15, '15', 'Published lifts', 'kirkwood-mountain-info'),
      skiableAcres: fact(2300, '2,300', 'Skiable acres', 'kirkwood-mountain-info'),
    },
    heroImage: {
      kind: 'verified-photo', resortId: 'kirkwood',
      uri: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kirkwood%20Mountain%20Resort%2C%20Kirkwood%2C%20California%20%2821385611049%29.jpg?width=1600',
      source: 'Wikimedia Commons', sourceUrl: kirkwoodSources[1].url,
      creator: 'Ken Lund', creditLine: 'Ken Lund · CC BY-SA 2.0',
      licenseLabel: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      usageStatus: 'verified-reusable', alt: 'Aerial view over Kirkwood Mountain Resort and the surrounding Sierra terrain.',
      verificationNote: 'The Commons record identifies Kirkwood Mountain Resort and a reviewed CC BY-SA Flickr source.',
    },
    sources: kirkwoodSources,
    supportState: 'preview',
    capabilities: { map: 'map-data-in-progress', trails: 'not-imported', recommendations: 'data-required', community: 'preview' },
    ingestion: { stage: 'normalized', sourceIdentifiers: ['kirkwood-official-mountain-info'], geometryStatus: 'not-imported', trailReconciliationStatus: 'not-started', verificationStatus: 'official-facts-only' },
    publicationStatus: 'preview',
    accent: '#e76f4d', accentSoft: '#ead8ce',
  },
  {
    id: 'mammoth-mountain',
    slug: 'mammoth-mountain',
    route: '/resorts/mammoth-mountain',
    name: 'Mammoth Mountain',
    shortName: 'Mammoth',
    location: { city: 'Mammoth Lakes', state: 'CA', region: 'Eastern Sierra', display: 'Mammoth Lakes, CA' },
    coordinates: null,
    description: 'An Eastern Sierra mountain with a high summit, broad volcanic terrain, and a long published winter trail network.',
    aliases: ['mammoth', 'mammoth mountain', 'mammoth resort', 'mammoth mountain resort'],
    searchTerms: ['mammoth lakes', 'mammoth lakes resort', 'eastern sierra mammoth'],
    facts: {
      verticalRise: fact(3100, '3,100 ft', 'Vertical rise', 'mammoth-winter-map-stats'),
      summitElevation: fact(11053, '11,053 ft', 'Summit elevation', 'mammoth-winter-map-stats'),
      baseElevation: fact(7953, '7,953 ft', 'Base elevation', 'mammoth-winter-map-stats'),
      trailCount: fact(180, '180', 'Named trails', 'mammoth-winter-map-stats'),
      liftCount: fact(25, '25', 'Published lifts', 'mammoth-winter-map-stats'),
      skiableAcres: fact(3500, '3,500+', 'Skiable acres', 'mammoth-winter-map-stats'),
    },
    heroImage: {
      kind: 'verified-photo', resortId: 'mammoth-mountain',
      uri: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mammoth%20Mountain%20Ski%20Area.jpg?width=1600',
      source: 'Wikimedia Commons', sourceUrl: mammothSources[1].url,
      creator: 'Plane777', creditLine: 'Plane777 · Public domain',
      licenseLabel: 'Public domain dedication', licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
      usageStatus: 'verified-reusable', alt: 'Snow-covered slopes and lifts at Mammoth Mountain Ski Area.',
      verificationNote: 'The Commons record identifies Mammoth Mountain Ski Area and records the author’s public-domain release.',
    },
    sources: mammothSources,
    supportState: 'preview',
    capabilities: { map: 'map-data-in-progress', trails: 'not-imported', recommendations: 'data-required', community: 'preview' },
    ingestion: { stage: 'normalized', sourceIdentifiers: ['mammoth-official-winter-map-stats'], geometryStatus: 'not-imported', trailReconciliationStatus: 'not-started', verificationStatus: 'official-facts-only' },
    publicationStatus: 'preview',
    accent: '#98b9c8', accentSoft: '#dce8ea',
  },
] as const;

const resortsById = new Map<ResortId, ResortRecord>(resortRegistry.map((resort) => [resort.id, resort]));
const resortsBySlug = new Map<ResortId, ResortRecord>(resortRegistry.map((resort) => [resort.slug, resort]));

export function getResortById(id: ResortId) {
  return resortsById.get(id);
}

export function getResortBySlug(slug?: string | string[]) {
  const value = Array.isArray(slug) ? slug[0] : slug;
  return value ? resortsBySlug.get(value as ResortId) : undefined;
}

export function getResortSupportLabel(resort: ResortRecord) {
  if (resort.supportState === 'full-map') return 'Full interactive map';
  if (resort.supportState === 'directory') return 'Run directory available';
  if (resort.supportState === 'preview') return 'Verified resort preview';
  return 'Coming soon';
}

export function getResortCtaLabel(resort: ResortRecord) {
  if (resort.supportState === 'full-map') return 'Explore mountain';
  if (resort.supportState === 'directory') return 'Browse runs';
  if (resort.supportState === 'preview') return 'Preview resort';
  return 'See what is planned';
}

export type ResortSearchMatch = {
  id: ResortId;
  label: string;
  route: `/resorts/${ResortId}`;
  supportState: ResortSupportState;
};

export const normalizeResortSearch = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export function resolveResortSearch(value: string): ResortSearchMatch | null {
  const normalizedValue = normalizeResortSearch(value);
  if (!normalizedValue) return null;

  const match = resortRegistry.find((resort) => (
    [...resort.aliases, ...resort.searchTerms]
      .map(normalizeResortSearch)
      .includes(normalizedValue)
  ));

  return match ? {
    id: match.id,
    label: match.name,
    route: match.route,
    supportState: match.supportState,
  } : null;
}

export function validateResortRegistry(records: readonly ResortRecord[] = resortRegistry) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const resort of records) {
    if (ids.has(resort.id)) errors.push(`Duplicate resort id: ${resort.id}`);
    if (slugs.has(resort.slug)) errors.push(`Duplicate resort slug: ${resort.slug}`);
    ids.add(resort.id);
    slugs.add(resort.slug);

    if (resort.route !== `/resorts/${resort.slug}`) errors.push(`Route/slug mismatch: ${resort.id}`);
    if (!resort.aliases.length) errors.push(`Missing aliases: ${resort.id}`);
    if (!resort.sources.some((item) => item.sourceType === 'official-resort' || item.sourceType === 'official-trail-map')) {
      errors.push(`Missing official source: ${resort.id}`);
    }
    if (resort.heroImage.resortId !== resort.id) errors.push(`Image/resort mismatch: ${resort.id}`);
    if (resort.heroImage.kind === 'verified-photo') {
      if (!resort.heroImage.sourceUrl || !resort.heroImage.licenseUrl || !resort.heroImage.creator || !resort.heroImage.alt) {
        errors.push(`Incomplete verified photo metadata: ${resort.id}`);
      }
    }
    if (resort.supportState !== 'full-map' && resort.capabilities.map === 'full-map') {
      errors.push(`Preview resort cannot claim a full map: ${resort.id}`);
    }
  }

  return errors;
}
