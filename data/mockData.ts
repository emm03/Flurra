import type { VibeLabel } from './runRecommendations';

export type Report = { author: string; initials: string; mountain: string; time: string; text: string; accent: string };

export const vibes: { icon: string; label: VibeLabel; sub: string }[] = [
  { icon: '⚡', label: 'Fast & steep', sub: 'Let it rip' },
  { icon: '🌲', label: 'Trees, please', sub: 'Find the secret stash' },
  { icon: '☀️', label: 'Cruisy laps', sub: 'Good views, no rush' },
  { icon: '❄️', label: 'Fresh tracks', sub: 'Chase the soft stuff' },
];

export const reports: Report[] = [
  { author: 'Maya R.', initials: 'MR', mountain: 'Heavenly', time: '12 min ago', text: 'Wind buff on Ridge Run is skiing so smooth right now. North Bowl next!', accent: '#d8ed4b' },
  { author: 'Theo K.', initials: 'TK', mountain: 'Palisades', time: '28 min ago', text: 'Granite Chief opened and the upper mountain is still holding soft turns.', accent: '#f27c4d' },
  { author: 'Liv S.', initials: 'LS', mountain: 'Mammoth', time: '41 min ago', text: 'Bluebird morning. Meet-up at Chair 14 for a sunny cruiser lap?', accent: '#f4ce58' },
];
