export type ResortSearchMatch = {
  label: string;
  route: '/resorts/heavenly' | '/resorts/palisades-tahoe' | '/resorts/mammoth-mountain';
};

const resortSearchEntries: (ResortSearchMatch & { aliases: readonly string[] })[] = [
  {
    label: 'Heavenly',
    route: '/resorts/heavenly',
    aliases: ['heavenly', 'heavenly mountain', 'heavenly resort', 'heavenly mountain resort'],
  },
  {
    label: 'Palisades Tahoe',
    route: '/resorts/palisades-tahoe',
    aliases: ['palisades', 'palisades tahoe', 'palisades tahoe resort', 'squaw valley'],
  },
  {
    label: 'Mammoth Mountain',
    route: '/resorts/mammoth-mountain',
    aliases: ['mammoth', 'mammoth mountain', 'mammoth resort', 'mammoth mountain resort'],
  },
];

export const normalizeResortSearch = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export function resolveResortSearch(value: string): ResortSearchMatch | null {
  const normalizedValue = normalizeResortSearch(value);
  if (!normalizedValue) return null;

  const match = resortSearchEntries.find((entry) => entry.aliases.includes(normalizedValue));
  return match ? { label: match.label, route: match.route } : null;
}
