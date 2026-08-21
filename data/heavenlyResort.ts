import {
  HeavenlyAlternateRunName,
  HeavenlyMountainArea,
  HeavenlySourceMapRef,
  heavenlyOfficialRuns,
  heavenlyTrailCatalogProvenance,
  OfficialRunDifficulty,
} from './heavenlyOfficialRuns';
import { getHeavenlyRunMetadata, HeavenlyTerrainTag } from './heavenlyRunMetadata';

export type DifficultyKey = 'Green' | 'Blue' | 'Black';
export type RunFeature = 'confidence-friendly' | 'scenic' | 'groomed' | 'recent-reports';

export type ResortRun = {
  id: string;
  slug: string;
  name: string;
  officialName: string;
  difficulty: DifficultyKey;
  officialDifficulty: string;
  officialDifficultyCode: OfficialRunDifficulty;
  mountainArea: HeavenlyMountainArea;
  geometryRef: string | null;
  sourceMapRef: HeavenlySourceMapRef;
  recordType: 'map-derived-run';
  verificationStatus: 'provisional';
  alternateNames: HeavenlyAlternateRunName[];
  confidence: number;
  confidenceFriendly: boolean;
  scenic: boolean;
  groomed: boolean;
  terrainTags: HeavenlyTerrainTag[];
  description: string;
  detail: string;
  access: string;
  bestFor: string;
  conditionTags: string[];
  features: RunFeature[];
};

export type MountainReport = {
  id: string;
  author: string;
  initials: string;
  run: string;
  time: string;
  text: string;
  tags: string[];
  likes: number;
  accent: string;
};

export type MountainSkier = {
  id: string;
  name: string;
  initials: string;
  status: string;
  accent: string;
};

export type SkiGroup = {
  id: string;
  name: string;
  when: string;
  pace: string;
  members: number;
};

export const heavenlyResort = {
  name: 'Heavenly',
  location: 'South Lake Tahoe, CA',
  vertical: '3,500 ft',
  trails: heavenlyTrailCatalogProvenance.currentPublishedTrailCount.value,
  peak: '10,067 ft',
  image: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1600&q=90',
};

const difficultyKey: Record<OfficialRunDifficulty, DifficultyKey> = {
  easier: 'Green',
  'more-difficult': 'Blue',
  'most-difficult': 'Black',
  'experts-only': 'Black',
};

const difficultyLabel: Record<OfficialRunDifficulty, string> = {
  easier: 'Easier · green circle',
  'more-difficult': 'More difficult · blue square',
  'most-difficult': 'Most difficult · black diamond',
  'experts-only': 'Most difficult · experts only · double black diamond',
};

const bestFor: Record<OfficialRunDifficulty, string> = {
  easier: 'Learning laps, warm-ups, and lower-pressure skiing.',
  'more-difficult': 'Intermediate skiers comfortable following posted mountain routes.',
  'most-difficult': 'Advanced skiers comfortable on ungroomed and changing terrain.',
  'experts-only': 'Expert skiers only; use open gates and follow all posted warnings.',
};

const runsWithSampleReports = new Set(['maggies', 'powderbowl-woods', 'ridge-run']);

/**
 * UI-ready records composed from official map facts and separate Flurra metadata.
 * Saved and completed state remains in the consuming screen, not in this catalog.
 */
export const heavenlyRuns: ResortRun[] = heavenlyOfficialRuns.map((official) => {
  const metadata = getHeavenlyRunMetadata(official);
  const features: RunFeature[] = [];

  if (metadata.confidenceFriendly) features.push('confidence-friendly');
  if (metadata.scenic) features.push('scenic');
  if (metadata.groomed) features.push('groomed');
  if (runsWithSampleReports.has(official.id)) features.push('recent-reports');

  return {
    id: official.id,
    slug: official.slug,
    name: official.officialName,
    officialName: official.officialName,
    difficulty: difficultyKey[official.officialDifficulty],
    officialDifficulty: difficultyLabel[official.officialDifficulty],
    officialDifficultyCode: official.officialDifficulty,
    mountainArea: official.mountainArea,
    geometryRef: official.geometryRef,
    sourceMapRef: official.sourceMapRef,
    recordType: official.recordType,
    verificationStatus: official.verificationStatus,
    alternateNames: official.alternateNames,
    confidence: metadata.flurraConfidenceRating,
    confidenceFriendly: metadata.confidenceFriendly,
    scenic: metadata.scenic,
    groomed: metadata.groomed,
    terrainTags: metadata.terrainTags,
    description: metadata.shortDescription,
    detail: `${metadata.shortDescription} Flurra's terrain profile is prototype editorial data, not an official condition report.`,
    access: `${official.mountainArea} · follow current on-mountain signs and closures.`,
    bestFor: bestFor[official.officialDifficulty],
    conditionTags: metadata.terrainTags.map((tag) => `Sample: ${tag}`),
    features,
  };
});

// Everything below is Flurra sample/community data and is intentionally not part
// of the permanent official run catalog.
export const mountainReports: MountainReport[] = [
  { id: 'report-ridge', author: 'Jordan Lee', initials: 'JL', run: 'Ridge Run', time: '28 min ago', text: 'Beautiful up top. A few firm patches near the last pitch, but the edges are soft and there is lots of room.', tags: ['Groomed', 'Firm patches', 'Moderate crowds'], likes: 124, accent: '#f4ce58' },
  { id: 'report-maggies', author: 'Alex Kim', initials: 'AK', run: "Maggie's", time: '41 min ago', text: 'Fresh groom is holding nicely. Great confidence lap before heading higher on the California side.', tags: ['Fresh groom', 'Easy pace'], likes: 68, accent: '#d8ed4b' },
  { id: 'report-powder', author: 'Nia Brooks', initials: 'NB', run: 'Powderbowl Woods', time: '1 hr ago', text: 'Soft pockets between the trees, with some bumps showing lower down. Still worth the detour.', tags: ['Soft snow', 'Glades', 'Bumps'], likes: 91, accent: '#bcdde2' },
];

export const mountainSkiers: MountainSkier[] = [
  { id: 'skier-alex', name: 'Alex Kim', initials: 'AK', status: "Maggie's · groomed", accent: '#f4ce58' },
  { id: 'skier-nia', name: 'Nia Brooks', initials: 'NB', status: 'Sky Deck · low visibility', accent: '#bcdde2' },
  { id: 'skier-sam', name: 'Sam Rivera', initials: 'SR', status: 'Ridge Run · soft edges', accent: '#efab83' },
];

export const skiGroups: SkiGroup[] = [
  { id: 'group-bluebird', name: 'Bluebird Cruisers', when: 'Saturday · 9:15 AM', pace: 'Easy blues · social pace', members: 8 },
  { id: 'group-trees', name: 'First Chair Tree Crew', when: 'Sunday · 8:45 AM', pace: 'Advanced · soft-snow hunt', members: 5 },
];

export const communityPhotos = [
  { id: 'photo-lake', label: 'Lake-view lap', author: 'Maya R.', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=900&q=82' },
  { id: 'photo-trees', label: 'Into the trees', author: 'Theo K.', image: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=82' },
  { id: 'photo-chair', label: 'First chair energy', author: 'Liv S.', image: 'https://images.unsplash.com/photo-1522056615691-da7b8106c665?auto=format&fit=crop&w=900&q=82' },
];

export function getHeavenlyRun(id?: string | string[]) {
  const runId = Array.isArray(id) ? id[0] : id;
  return heavenlyRuns.find((run) => run.id === runId || run.slug === runId);
}
