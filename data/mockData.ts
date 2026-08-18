export type Resort = { name: string; location: string; vertical: string; trails: number; image: string; color: string };
export type Report = { author: string; initials: string; mountain: string; time: string; text: string; accent: string };

export const resorts: Resort[] = [
  { name: 'Heavenly', location: 'Lake Tahoe, CA', vertical: '3,500 ft', trails: 97, color: '#5f99a2', image: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Palisades Tahoe', location: 'Olympic Valley, CA', vertical: '2,850 ft', trails: 170, color: '#d06b3a', image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Mammoth Mountain', location: 'Mammoth Lakes, CA', vertical: '3,100 ft', trails: 175, color: '#a7b84a', image: 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?auto=format&fit=crop&w=1200&q=85' },
];

export const vibes = [
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
