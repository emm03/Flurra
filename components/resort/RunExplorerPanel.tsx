import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  filterHeavenlyRuns,
  heavenlyDifficultyFilters,
  heavenlyFeatureFilters,
  type HeavenlyRunFilterId,
} from '@/data/heavenlyRunExplorer';
import type { ResortRun } from '@/data/heavenlyResort';
import { colors, fonts } from '@/theme';

type ExplorerVariant = 'desktop' | 'mobile-sheet' | 'mobile-list';

type RunExplorerPanelProps = {
  runs: ResortRun[];
  variant: ExplorerVariant;
  selectedRunId: string | null;
  savedIds: string[];
  skiedIds: string[];
  mapRunIds: ReadonlySet<string>;
  onToggleSaved: (id: string) => void;
  onToggleSkied: (id: string) => void;
  onShowOnMap: (id: string) => void;
  onOpenList?: () => void;
};

export function RunExplorerPanel({
  runs,
  variant,
  selectedRunId,
  savedIds,
  skiedIds,
  mapRunIds,
  onToggleSaved,
  onToggleSkied,
  onShowOnMap,
  onOpenList,
}: RunExplorerPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<HeavenlyRunFilterId[]>([]);
  const isSheet = variant === 'mobile-sheet';
  const isMobile = variant !== 'desktop';
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;

  const filteredRuns = useMemo(
    () => filterHeavenlyRuns(runs, query, activeFilters),
    [activeFilters, query, runs],
  );

  const toggleFilter = (filter: HeavenlyRunFilterId) => {
    setActiveFilters((current) => current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter]);
  };

  const resetFilters = () => {
    setQuery('');
    setActiveFilters([]);
  };

  if (isSheet) {
    return <View style={styles.sheet} accessibilityLabel="Heavenly run explorer bottom sheet">
      <View style={styles.sheetHandle} />
      {selectedRun ? <>
        <View style={styles.sheetSelected} accessibilityLiveRegion="polite">
          <View style={styles.sheetCopy}>
            <Text style={styles.selectedEyebrow}>{selectedRun.effectiveDifficultySymbol} {selectedRun.officialDifficulty.toUpperCase()} · {selectedRun.confidence}% CONFIDENCE</Text>
            <Text testID="mobile-selected-run-name" numberOfLines={1} style={styles.sheetRunName}>{selectedRun.name}</Text>
            <Text numberOfLines={1} style={styles.sheetDescription}>{selectedRun.description}</Text>
          </View>
        </View>
        <View style={styles.sheetActions}>
          <ProgressButton active={savedIds.includes(selectedRun.id)} activeLabel="UNSAVE" inactiveLabel="SAVE" icon="bookmark" accessibilityLabel={`${savedIds.includes(selectedRun.id) ? 'Unsave' : 'Save'} ${selectedRun.name}`} onPress={() => onToggleSaved(selectedRun.id)} />
          <ProgressButton active={skiedIds.includes(selectedRun.id)} activeLabel="UNDO SKIED" inactiveLabel="MARK SKIED" icon="check-circle" accessibilityLabel={`${skiedIds.includes(selectedRun.id) ? 'Remove skied' : 'I skied'} ${selectedRun.name}`} onPress={() => onToggleSkied(selectedRun.id)} />
          <Pressable accessibilityRole="link" accessibilityLabel={`View ${selectedRun.name} run details`} onPress={() => router.push(`/resorts/heavenly/runs/${selectedRun.id}?from=heavenly` as Href)} style={({ hovered, focused }: any) => [styles.sheetDetails, (hovered || focused) && styles.controlFocus]}>
            <Text style={styles.sheetDetailsText}>DETAILS</Text><Feather name="arrow-up-right" size={14} color={colors.deep} />
          </Pressable>
        </View>
      </> : <View style={styles.sheetSelected}>
        <View style={styles.sheetCopy}>
          <Text style={styles.selectedEyebrow}>RUN EXPLORER</Text>
          <Text style={styles.sheetRunName}>Pick a mountain line.</Text>
          <Text style={styles.sheetDescription}>Tap a verified trail, or browse all {runs.length} directory records.</Text>
        </View>
      </View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Open Heavenly run list" onPress={onOpenList} style={styles.openListButton}>
        <Text style={styles.openListText}>OPEN RUN LIST</Text><Feather name="chevron-up" size={17} color={colors.deep} />
      </Pressable>
    </View>;
  }

  return <View style={[styles.panel, isMobile && styles.panelMobile]}>
    <View style={styles.panelHeader}>
      <View style={styles.headingCopy}>
        <Text style={styles.eyebrow}>● HEAVENLY RUN EXPLORER</Text>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>Find your line.</Text>
      </View>
      <View style={styles.countTicket}><Text style={styles.countTicketText}>{runs.length} RUNS</Text></View>
    </View>

    {selectedRun ? <View style={styles.selectedCard} accessibilityLiveRegion="polite">
      <View style={styles.selectedTop}>
        <Text style={styles.selectedEyebrow}>SELECTED · {selectedRun.effectiveDifficultySymbol} {selectedRun.officialDifficulty.toUpperCase()}</Text>
        <Text style={styles.selectedConfidence}>{selectedRun.confidence}%</Text>
      </View>
      <Text testID="selected-explorer-run-name" style={styles.selectedName}>{selectedRun.name}</Text>
      <Text numberOfLines={2} style={styles.selectedDescription}>{selectedRun.description}</Text>
      <View style={styles.selectedActions}>
        <ProgressButton
          active={savedIds.includes(selectedRun.id)}
          activeLabel="UNSAVE"
          inactiveLabel="SAVE"
          icon="bookmark"
          accessibilityLabel={`${savedIds.includes(selectedRun.id) ? 'Unsave' : 'Save'} ${selectedRun.name}`}
          onPress={() => onToggleSaved(selectedRun.id)}
        />
        <ProgressButton
          active={skiedIds.includes(selectedRun.id)}
          activeLabel="UNDO SKIED"
          inactiveLabel="MARK SKIED"
          icon="check-circle"
          accessibilityLabel={`${skiedIds.includes(selectedRun.id) ? 'Remove skied' : 'I skied'} ${selectedRun.name}`}
          onPress={() => onToggleSkied(selectedRun.id)}
        />
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`View ${selectedRun.name} run details`}
          onPress={() => router.push(`/resorts/heavenly/runs/${selectedRun.id}?from=heavenly` as Href)}
          style={({ hovered, focused }: any) => [styles.selectedDetails, (hovered || focused) && styles.controlFocus]}
        >
          <Text style={styles.selectedDetailsText}>DETAILS</Text><Feather name="arrow-up-right" size={13} color={colors.white} />
        </Pressable>
      </View>
    </View> : null}

    <View style={styles.search}>
      <Feather name="search" size={17} color={colors.forest} />
      <TextInput
        accessibilityLabel="Search Heavenly runs"
        accessibilityHint="Results update while you type"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        placeholder="Search runs or mountain areas"
        placeholderTextColor="#69776f"
        style={styles.input}
      />
      {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear run search" onPress={() => setQuery('')} style={styles.clearSearch}>
        <Feather name="x" size={17} color={colors.forest} />
      </Pressable> : null}
    </View>

    <View style={styles.filters}>
      <Text style={styles.filterGroupLabel}>DIFFICULTY</Text>
      <View style={styles.filterRow}>{heavenlyDifficultyFilters.map((filter) => <FilterButton key={filter.id} filter={filter} active={activeFilters.includes(filter.id)} onPress={() => toggleFilter(filter.id)} />)}</View>
      <Text style={styles.filterGroupLabel}>RUN CHARACTER</Text>
      <View style={styles.filterRow}>{heavenlyFeatureFilters.map((filter) => <FilterButton key={filter.id} filter={filter} active={activeFilters.includes(filter.id)} onPress={() => toggleFilter(filter.id)} />)}</View>
    </View>

    <View style={styles.resultRow}>
      <Text accessibilityLiveRegion="polite" style={styles.resultCount}>{filteredRuns.length} {filteredRuns.length === 1 ? 'RUN' : 'RUNS'}</Text>
      {(query || activeFilters.length) ? <Pressable accessibilityRole="button" accessibilityLabel="Reset run search and filters" onPress={resetFilters} style={styles.reset}>
        <Text style={styles.resetText}>RESET</Text><Feather name="rotate-ccw" size={12} color={colors.orange} />
      </Pressable> : null}
    </View>

    <ScrollView
      style={styles.results}
      contentContainerStyle={styles.resultsContent}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Heavenly run results"
    >
      {filteredRuns.length ? filteredRuns.map((run) => {
        const selected = selectedRunId === run.id;
        const saved = savedIds.includes(run.id);
        const skied = skiedIds.includes(run.id);
        const hasMap = mapRunIds.has(run.id);
        return <View key={run.id} style={[styles.runRow, selected && styles.runRowSelected]}>
          <View style={styles.runPrimary}>
            <View style={[styles.difficultyMark, run.difficulty === 'Green' && styles.green, run.difficulty === 'Blue' && styles.blue, run.difficulty === 'Black' && styles.black]}>
              <Text style={styles.difficultySymbol}>{run.effectiveDifficultySymbol}</Text>
            </View>
            <View style={styles.runCopy}>
              <Text numberOfLines={1} style={styles.runName}>{run.name}</Text>
              <Text numberOfLines={1} style={styles.runMeta}>{run.mountainArea} · {run.confidence}% confidence</Text>
            </View>
            <Text style={[styles.mapStatus, selected && styles.mapStatusSelected]}>{hasMap ? (selected ? 'ON MAP' : 'MAP READY') : 'NO MAP'}</Text>
          </View>
          <View style={styles.rowActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Show ${run.name} on map`} accessibilityState={{ selected }} disabled={!hasMap} onPress={() => hasMap && onShowOnMap(run.id)} style={({ hovered, focused }: any) => [styles.cardAction, styles.showMapButton, !hasMap && styles.cardActionDisabled, (hovered || focused) && styles.controlFocus]}>
              <Feather name="map-pin" size={13} color={colors.white} /><Text style={styles.showMapButtonText}>{hasMap ? 'SHOW ON MAP' : 'NO MAP'}</Text>
            </Pressable>
            <Pressable accessibilityRole="link" accessibilityLabel={`View ${run.name} run details`} onPress={() => router.push(`/resorts/heavenly/runs/${run.id}?from=heavenly` as Href)} style={({ hovered, focused }: any) => [styles.cardAction, styles.detailsButton, (hovered || focused) && styles.controlFocus]}>
              <Feather name="arrow-up-right" size={13} color={colors.deep} /><Text style={styles.detailsText}>RUN DETAILS</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${run.name}`} accessibilityState={{ selected: saved }} onPress={() => onToggleSaved(run.id)} style={({ hovered, focused }: any) => [styles.cardAction, saved && styles.cardActionActive, (hovered || focused) && styles.controlFocus]}>
              <Feather name={saved ? 'check' : 'bookmark'} size={13} color={colors.forest} /><Text style={styles.cardActionText}>{saved ? 'UNSAVE' : 'SAVE'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`${skied ? 'Remove skied' : 'I skied'} ${run.name}`} accessibilityState={{ selected: skied }} onPress={() => onToggleSkied(run.id)} style={({ hovered, focused }: any) => [styles.cardAction, skied && styles.cardActionActive, (hovered || focused) && styles.controlFocus]}>
              <Feather name={skied ? 'rotate-ccw' : 'check-circle'} size={13} color={colors.forest} /><Text style={styles.cardActionText}>{skied ? 'UNDO SKIED' : 'MARK SKIED'}</Text>
            </Pressable>
          </View>
        </View>;
      }) : <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No runs match.</Text>
        <Text style={styles.emptyCopy}>Try a broader search or remove a filter.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Reset run search and filters" onPress={resetFilters} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>RESET FILTERS</Text>
        </Pressable>
      </View>}
    </ScrollView>
    <Text style={styles.sampleNote}>SAMPLE CONDITIONS AND CONFIDENCE — NOT LIVE RESORT STATUS</Text>
  </View>;
}

function ProgressButton({ active, activeLabel, inactiveLabel, icon, accessibilityLabel, onPress }: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  icon: 'bookmark' | 'check-circle';
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ selected: active }} onPress={onPress} style={({ hovered, focused }: any) => [styles.progressButton, active && styles.progressButtonActive, (hovered || focused) && styles.controlFocus]}>
    <Feather name={active ? 'check' : icon} size={13} color={colors.forest} />
    <Text style={styles.progressButtonText}>{active ? activeLabel : inactiveLabel}</Text>
  </Pressable>;
}

function FilterButton({ filter, active, onPress }: {
  filter: { id: HeavenlyRunFilterId; label: string };
  active: boolean;
  onPress: () => void;
}) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${active ? 'Remove' : 'Add'} ${filter.label} filter`}
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={({ hovered, focused }: any) => [styles.filter, active && styles.filterActive, (hovered || focused) && styles.controlFocus]}
  >
    <Text numberOfLines={1} style={[styles.filterText, active && styles.filterTextActive]}>{active ? '✓ ' : '+ '}{filter.label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  panel: { width: 380, minWidth: 340, maxWidth: 420, height: '100%', backgroundColor: colors.cream, borderColor: colors.forest, borderWidth: 1.5, padding: 16, overflow: 'hidden' },
  panelMobile: { width: '100%', minWidth: 0, maxWidth: '100%', borderWidth: 0, padding: 14 },
  panelHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, borderBottomColor: colors.forest, borderBottomWidth: 1, paddingBottom: 11 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2 },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 27, lineHeight: 30, letterSpacing: -0.7, marginTop: 3 },
  titleMobile: { fontSize: 30, lineHeight: 33 },
  countTicket: { backgroundColor: colors.lime, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 7, transform: [{ rotate: '1.5deg' }] },
  countTicketText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.7 },
  selectedCard: { backgroundColor: colors.forest, padding: 12, marginTop: 12, borderColor: colors.deep, borderWidth: 1, shadowColor: colors.orange, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 3, height: 3 } },
  selectedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectedEyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.8 },
  selectedConfidence: { color: colors.orange, fontFamily: fonts.display, fontSize: 17 },
  selectedName: { color: colors.white, fontFamily: fonts.display, fontSize: 24, lineHeight: 27, marginTop: 3 },
  selectedDescription: { color: '#d4e0dc', fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 4 },
  selectedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  progressButton: { flex: 1, minWidth: 0, minHeight: 44, borderColor: '#a7b9b3', borderWidth: 1, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: colors.paper },
  progressButtonActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  progressButtonText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.45 },
  selectedDetails: { minHeight: 44, marginLeft: 'auto', backgroundColor: colors.orange, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  selectedDetailsText: { color: colors.white, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.6 },
  search: { minHeight: 48, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.25, paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  input: { flex: 1, minWidth: 0, height: 46, color: colors.ink, fontFamily: fonts.body, fontSize: 12, outlineStyle: 'none' } as any,
  clearSearch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 4, marginTop: 8 },
  filterGroupLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.8, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 4 },
  filter: { flex: 1, minWidth: 0, minHeight: 44, borderColor: '#9ba49b', borderWidth: 1, backgroundColor: colors.paper, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  filterActive: { borderColor: colors.forest, backgroundColor: colors.forest },
  filterText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.25 },
  filterTextActive: { color: colors.lime },
  resultRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  resultCount: { color: colors.muted, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.9 },
  reset: { minHeight: 44, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  resetText: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.7 },
  results: { flex: 1, minHeight: 0, borderTopColor: '#a9b1aa', borderTopWidth: 1 },
  resultsContent: { paddingVertical: 8, gap: 7 },
  runRow: { backgroundColor: colors.paper, borderColor: '#aab2aa', borderWidth: 1 },
  runRowSelected: { borderColor: colors.orange, borderWidth: 2 },
  runPrimary: { minHeight: 55, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  difficultyMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  green: { backgroundColor: '#4b9a67' },
  blue: { backgroundColor: '#357fa7' },
  black: { backgroundColor: colors.deep },
  difficultySymbol: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  runCopy: { flex: 1, minWidth: 0 },
  runName: { color: colors.forest, fontFamily: fonts.display, fontSize: 17, lineHeight: 20 },
  runMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginTop: 2 },
  mapStatus: { color: colors.muted, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.45 },
  mapStatusSelected: { color: colors.orange },
  rowActions: { borderTopColor: '#d1d3cb', borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap' },
  cardAction: { width: '50%', minHeight: 44, paddingHorizontal: 5, borderColor: '#d1d3cb', borderWidth: .5, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  cardActionActive: { backgroundColor: colors.lime },
  cardActionDisabled: { opacity: .48 },
  cardActionText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 6.5, letterSpacing: 0.38 },
  showMapButton: { backgroundColor: colors.forest },
  showMapButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 6.5, letterSpacing: 0.38 },
  detailsButton: { backgroundColor: colors.orange },
  detailsText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 6.5, letterSpacing: 0.38 },
  sampleNote: { color: colors.muted, fontFamily: fonts.bold, fontSize: 7, lineHeight: 11, letterSpacing: 0.55, marginTop: 7 },
  empty: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 34 },
  emptyTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 22 },
  emptyCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, textAlign: 'center', marginTop: 5 },
  emptyButton: { minHeight: 44, backgroundColor: colors.lime, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  emptyButtonText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.7 },
  sheet: { position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 9, minHeight: 108, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 10, paddingTop: 8, shadowColor: colors.deep, shadowOpacity: 0.34, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#a2aaa3', marginBottom: 8 },
  sheetSelected: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sheetCopy: { flex: 1, minWidth: 0 },
  sheetRunName: { color: colors.forest, fontFamily: fonts.display, fontSize: 21, lineHeight: 24, marginTop: 2 },
  sheetDescription: { color: colors.muted, fontFamily: fonts.body, fontSize: 9, marginTop: 2 },
  sheetDetails: { flex: 1, minWidth: 72, height: 44, backgroundColor: colors.orange, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' },
  sheetDetailsText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .45 },
  sheetActions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  openListButton: { minHeight: 44, backgroundColor: colors.lime, marginTop: 7, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  openListText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.8 },
  controlFocus: { outlineColor: colors.lime, outlineOffset: -3, outlineStyle: 'solid', outlineWidth: 3 } as any,
});
