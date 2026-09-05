export type VibeLabel = 'Fast & steep' | 'Trees, please' | 'Cruisy laps' | 'Fresh tracks';

export type HeavenlyRun = {
  id: string;
  name: string;
  difficulty: 'Green circle' | 'Blue square' | 'Black diamond' | 'Double black diamond';
  baseConfidence: number;
  priority: number;
  vibes: VibeLabel[];
  reasons: Partial<Record<VibeLabel, string>>;
  fallbackReason: string;
  conditionTags: string[];
  details: string;
};

export type RunRecommendation = HeavenlyRun & {
  confidence: number;
  reason: string;
};

export const heavenlyRuns: HeavenlyRun[] = [
  {
    id: 'ridge-run',
    name: 'Ridge Run',
    difficulty: 'Blue square',
    baseConfidence: 87,
    priority: 1,
    vibes: ['Cruisy laps', 'Fast & steep'],
    reasons: {
      'Cruisy laps': 'A long, flowing groomer with wide views and room to settle into your rhythm.',
      'Fast & steep': 'Its open upper pitches are a reliable place to let your skis run.',
    },
    fallbackReason: 'A dependable Heavenly lap with mountain views and a little bit of everything.',
    conditionTags: ['Fresh groom', 'Firm patches', 'Moderate crowds'],
    details: 'Start from Sky Express and follow the ridge toward California Lodge. The upper section is broad and scenic before the final steeper pitch.',
  },
  {
    id: 'boundary-chutes',
    name: 'Boundary Chutes',
    difficulty: 'Double black diamond',
    baseConfidence: 85,
    priority: 2,
    vibes: ['Fast & steep', 'Fresh tracks'],
    reasons: {
      'Fast & steep': 'Sustained fall-line terrain makes this the strongest match when you want a real challenge.',
      'Fresh tracks': 'Protected canyon lines are a good bet for finding softer snow after a storm.',
    },
    fallbackReason: 'A serious, memorable line for expert skiers when the gated terrain is officially open.',
    conditionTags: ['Sample: steep terrain', 'Experts only', 'Gated access'],
    details: 'Experts-only gated terrain. Enter through open gates only and follow current resort signage, closures, and patrol guidance.',
  },
  {
    id: 'powderbowl-woods',
    name: 'Powderbowl Woods',
    difficulty: 'Black diamond',
    baseConfidence: 84,
    priority: 3,
    vibes: ['Trees, please', 'Fresh tracks'],
    reasons: {
      'Trees, please': 'Well-spaced glades deliver the tucked-away tree lap you asked for.',
      'Fresh tracks': 'The trees shelter soft snow and often hold fresh turns longer than open slopes.',
    },
    fallbackReason: 'A sheltered glade with playful lines and plenty of ways through.',
    conditionTags: ['Soft snow', 'Glades', 'Watch for bumps'],
    details: 'Enter below Powderbowl Express and keep an eye on marked boundaries. Choose your line carefully as the trees tighten lower down.',
  },
  {
    id: 'orion',
    name: 'Orion',
    difficulty: 'Blue square',
    baseConfidence: 82,
    priority: 4,
    vibes: ['Cruisy laps', 'Fresh tracks'],
    reasons: {
      'Cruisy laps': 'A mellow Nevada-side cruiser that is ideal for relaxed, repeatable laps.',
      'Fresh tracks': 'Early laps can hold smooth corduroy and wind-deposited snow along the edges.',
    },
    fallbackReason: 'A smooth, approachable cruiser for finding an easy mountain rhythm.',
    conditionTags: ['Corduroy', 'Sunny', 'Light traffic'],
    details: 'Lap from Dipper Express on the Nevada side. It is wide, consistent, and especially good early in the day.',
  },
  {
    id: 'north-bowl',
    name: 'North Bowl',
    difficulty: 'Black diamond',
    baseConfidence: 81,
    priority: 5,
    vibes: ['Trees, please', 'Fast & steep'],
    reasons: {
      'Trees, please': 'Natural features and tree-lined pitches make every lap feel exploratory.',
      'Fast & steep': 'Short, steep sections offer quick hits of technical skiing.',
    },
    fallbackReason: 'A character-filled advanced lap away from the main groomed routes.',
    conditionTags: ['Variable', 'Natural snow', 'Technical'],
    details: 'This California-side advanced zone has natural terrain and changing coverage. Check patrol signage before entering.',
  },
  {
    id: 'maggies',
    name: "Maggie's",
    difficulty: 'Green circle',
    baseConfidence: 79,
    priority: 6,
    vibes: ['Cruisy laps'],
    reasons: {
      'Cruisy laps': 'A friendly, low-pressure lap made for taking in the lake view without rushing.',
    },
    fallbackReason: 'An easygoing choice when the goal is simply to enjoy being on snow.',
    conditionTags: ['Fresh groom', 'Easy pace', 'Lake views'],
    details: 'A gentle California Lodge run with a consistent grade. It is a comfortable warm-up or final lap of the day.',
  },
];

export function getHeavenlyRunRecommendations(selectedVibes: VibeLabel[]): RunRecommendation[] {
  return heavenlyRuns
    .map((run) => {
      const matches = selectedVibes.filter((vibe) => run.vibes.includes(vibe));
      const primaryMatch = selectedVibes.find((vibe) => run.vibes.includes(vibe));

      return {
        ...run,
        confidence: Math.min(97, run.baseConfidence + matches.length * 4),
        reason: primaryMatch ? run.reasons[primaryMatch] ?? run.fallbackReason : run.fallbackReason,
        matchCount: matches.length,
      };
    })
    .sort((a, b) => b.matchCount - a.matchCount || b.confidence - a.confidence || a.priority - b.priority)
    .slice(0, 3)
    .map(({ matchCount: _matchCount, ...run }) => run);
}
