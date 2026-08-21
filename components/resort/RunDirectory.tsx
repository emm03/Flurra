import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DifficultyKey, ResortRun, RunFeature } from '@/data/heavenlyResort';
import { colors, fonts } from '@/theme';

type FilterId = DifficultyKey | RunFeature;

type RunDirectoryProps = {
  runs: ResortRun[];
  compact: boolean;
  savedIds: string[];
  skiedIds: string[];
  onToggleSaved: (id: string) => void;
  onToggleSkied: (id: string) => void;
};

const filters: { id: FilterId; label: string }[] = [
  { id: 'Green', label: 'Green' },
  { id: 'Blue', label: 'Blue' },
  { id: 'Black', label: 'Black' },
  { id: 'confidence-friendly', label: 'Confidence-friendly' },
  { id: 'scenic', label: 'Scenic' },
  { id: 'groomed', label: 'Groomed' },
  { id: 'recent-reports', label: 'Recent reports' },
];

const difficultyFilters: DifficultyKey[] = ['Green', 'Blue', 'Black'];

export function RunDirectory({ runs, compact, savedIds, skiedIds, onToggleSaved, onToggleSkied }: RunDirectoryProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([]);

  const filteredRuns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedDifficulties = activeFilters.filter((filter): filter is DifficultyKey => difficultyFilters.includes(filter as DifficultyKey));
    const selectedFeatures = activeFilters.filter((filter): filter is RunFeature => !difficultyFilters.includes(filter as DifficultyKey));

    return runs.filter((run) => {
      const searchable = [run.name, run.description, run.officialDifficulty, ...run.conditionTags].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesDifficulty = !selectedDifficulties.length || selectedDifficulties.includes(run.difficulty);
      const matchesFeatures = selectedFeatures.every((feature) => run.features.includes(feature));
      return matchesQuery && matchesDifficulty && matchesFeatures;
    });
  }, [activeFilters, query, runs]);

  const toggleFilter = (filter: FilterId) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const resetFilters = () => {
    setQuery('');
    setActiveFilters([]);
  };

  return <View style={styles.section}>
    <View style={styles.inner}>
      <View style={[styles.headingRow, compact && styles.headingMobile]}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>● HEAVENLY RUN DIRECTORY</Text>
          <Text style={[styles.title, compact && styles.titleMobile]}>Find your line.</Text>
          <Text style={styles.copy}>Search the prototype directory or layer filters to match the kind of Heavenly lap you want right now.</Text>
        </View>
        <View style={styles.directoryTicket}><Text style={styles.directoryTicketTop}>FIELD GUIDE / 001</Text><Text style={styles.directoryTicketMain}>{runs.length} SAMPLE RUNS</Text></View>
      </View>

      <View style={styles.controls}>
        <View style={styles.search}>
          <Feather name="search" size={18} color={colors.forest} />
          <TextInput
            accessibilityLabel="Search Heavenly runs"
            value={query}
            onChangeText={setQuery}
            placeholder="Search run name, condition, or difficulty..."
            placeholderTextColor="#7a837b"
            style={styles.input}
          />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear run search" onPress={() => setQuery('')}><Feather name="x" size={17} color={colors.forest} /></Pressable> : null}
        </View>
        <View style={styles.filters}>
          {filters.map((filter) => {
            const active = activeFilters.includes(filter.id);
            return <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={filter.id}
              onPress={() => toggleFilter(filter.id)}
              style={({ hovered }: any) => [styles.filter, active && styles.filterActive, hovered && styles.filterHover]}
            ><Text style={[styles.filterText, active && styles.filterTextActive]}>{active ? '✓ ' : '+ '}{filter.label}</Text></Pressable>;
          })}
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>{filteredRuns.length} {filteredRuns.length === 1 ? 'RUN' : 'RUNS'} MATCH</Text>
          {(query || activeFilters.length) ? <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.clear}><Text style={styles.clearText}>RESET DIRECTORY</Text><Feather name="rotate-ccw" size={12} color={colors.orange} /></Pressable> : null}
        </View>
      </View>

      {filteredRuns.length ? <View style={[styles.grid, compact && styles.gridMobile]}>
        {filteredRuns.map((run) => {
          const saved = savedIds.includes(run.id);
          const skied = skiedIds.includes(run.id);
          return <View key={run.id} style={[styles.card, compact && styles.cardMobile]}>
            <View style={styles.cardTop}>
              <View style={[styles.difficultyBadge, run.difficulty === 'Green' && styles.green, run.difficulty === 'Blue' && styles.blue, run.difficulty === 'Black' && styles.black]}>
                <Text style={styles.difficultyText}>{run.officialDifficulty.toUpperCase()}</Text>
              </View>
              <View style={styles.confidence}><Text style={styles.confidenceValue}>{run.confidence}%</Text><Text style={styles.confidenceLabel}>FLURRA CONFIDENCE</Text></View>
            </View>
            <Text style={styles.runName}>{run.name}</Text>
            <Text style={styles.description}>{run.description}</Text>
            <Text style={styles.conditionLabel}>SAMPLE CONDITIONS · NOT LIVE</Text>
            <View style={styles.tags}>{run.conditionTags.map((tag) => <Text key={tag} style={styles.tag}>{tag.replace('Sample: ', '')}</Text>)}</View>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${run.name}`} onPress={() => onToggleSaved(run.id)} style={[styles.actionSecondary, saved && styles.actionSelected]}>
                <Feather name={saved ? 'check' : 'bookmark'} size={13} color={colors.forest} /><Text style={styles.actionSecondaryText}>{saved ? 'SAVED' : 'SAVE'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`${skied ? 'Remove skied' : 'I skied'} ${run.name}`} onPress={() => onToggleSkied(run.id)} style={[styles.actionSecondary, skied && styles.actionSelected]}>
                <Feather name={skied ? 'check' : 'check-circle'} size={13} color={colors.forest} /><Text style={styles.actionSecondaryText}>{skied ? 'SKIED' : 'I SKIED THIS'}</Text>
              </Pressable>
              <Pressable accessibilityRole="link" accessibilityLabel={`View ${run.name}`} onPress={() => router.push(`/resorts/heavenly/runs/${run.id}` as Href)} style={({ hovered }: any) => [styles.viewAction, hovered && styles.viewHover]}>
                <Text style={styles.viewText}>VIEW RUN</Text><Feather name="arrow-up-right" size={14} color={colors.white} />
              </Pressable>
            </View>
          </View>;
        })}
      </View> : <View style={styles.empty}>
        <Text style={styles.emptyMark}>〰</Text><Text style={styles.emptyTitle}>No run matches that exact day.</Text><Text style={styles.emptyCopy}>Try removing a filter or searching with a broader condition.</Text>
        <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.emptyButton}><Text style={styles.emptyButtonText}>RESET DIRECTORY</Text></Pressable>
      </View>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.cream, paddingVertical: 100 },
  inner: { alignSelf: 'center', maxWidth: 1180, width: '100%', paddingHorizontal: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 35, borderBottomColor: colors.forest, borderBottomWidth: 2, paddingBottom: 28 },
  headingMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  headingCopy: { maxWidth: 700 },
  eyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 55, lineHeight: 59, letterSpacing: -2, marginTop: 8 },
  titleMobile: { fontSize: 42, lineHeight: 45 },
  copy: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, maxWidth: 650, marginTop: 12 },
  directoryTicket: { backgroundColor: colors.lime, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 13, transform: [{ rotate: '2deg' }], shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 4, height: 5 } },
  directoryTicketTop: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2 },
  directoryTicketMain: { color: colors.deep, fontFamily: fonts.display, fontSize: 18, marginTop: 3 },
  controls: { paddingVertical: 28 },
  search: { backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: '100%', color: colors.ink, fontFamily: fonts.body, fontSize: 14, outlineStyle: 'none' } as any,
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  filter: { borderColor: '#9ba49b', borderWidth: 1, backgroundColor: colors.paper, paddingHorizontal: 11, paddingVertical: 8 },
  filterActive: { borderColor: colors.forest, backgroundColor: colors.forest },
  filterHover: { borderColor: colors.orange },
  filterText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 9, letterSpacing: .4 },
  filterTextActive: { color: colors.lime },
  resultRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  resultCount: { color: colors.muted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  clearText: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  gridMobile: { flexDirection: 'column' },
  card: { flexGrow: 1, flexBasis: 440, maxWidth: '100%', minWidth: 320, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 22, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 5, height: 6 } },
  cardMobile: { minWidth: 0, width: '100%' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 15 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 6 },
  green: { backgroundColor: '#7fbf69' },
  blue: { backgroundColor: '#64a4c2' },
  black: { backgroundColor: colors.deep },
  difficultyText: { color: colors.white, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1 },
  confidence: { alignItems: 'flex-end' },
  confidenceValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 21 },
  confidenceLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 6, letterSpacing: .8 },
  runName: { color: colors.forest, fontFamily: fonts.display, fontSize: 27, lineHeight: 31, marginTop: 15 },
  description: { color: colors.ink, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, minHeight: 48, marginTop: 7 },
  conditionLabel: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2, marginTop: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { color: colors.forest, borderColor: '#c0c6bd', borderWidth: 1, fontFamily: fonts.bold, fontSize: 7, textTransform: 'uppercase', paddingHorizontal: 6, paddingVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 20 },
  actionSecondary: { minHeight: 36, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  actionSelected: { backgroundColor: colors.lime },
  actionSecondaryText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .5 },
  viewAction: { minHeight: 36, backgroundColor: colors.orange, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginLeft: 'auto' },
  viewHover: { backgroundColor: colors.forest },
  viewText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .6 },
  empty: { backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, alignItems: 'center', paddingHorizontal: 25, paddingVertical: 65, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  emptyMark: { color: colors.orange, fontSize: 35 },
  emptyTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 28, textAlign: 'center', marginTop: 8 },
  emptyCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginTop: 8 },
  emptyButton: { backgroundColor: colors.lime, paddingHorizontal: 16, paddingVertical: 11, marginTop: 20 },
  emptyButtonText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
});
