import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { heavenlyMapData } from '@/data/heavenlyMap';
import type { ResortRun } from '@/data/heavenlyResort';
import { colors, fonts } from '@/theme';
import { HeavenlyMap } from './HeavenlyMap';

type FutureMapSectionProps = {
  resortName: string;
  compact: boolean;
  runs: ResortRun[];
  selectedRunId: string | null;
  onSelectRun: (runId: string | null) => void;
};

const legendItems = [
  { label: 'GREEN', color: '#34875a', shape: '●' },
  { label: 'BLUE', color: '#176da0', shape: '■' },
  { label: 'BLACK', color: colors.deep, shape: '◆' },
  { label: 'EXPERT', color: '#070d0b', shape: '◆◆' },
  { label: 'LIFT', color: colors.orange, shape: '━' },
];

export function FutureMapSection({ resortName, compact, runs, selectedRunId, onSelectRun }: FutureMapSectionProps) {
  const router = useRouter();
  const selectedRun = runs.find((run) => run.id === selectedRunId);

  return <View style={styles.section}>
    <View style={styles.inner}>
      <View style={[styles.heading, compact && styles.headingMobile]}>
        <View>
          <Text style={styles.eyebrow}>REAL MOUNTAIN / PROTOTYPE</Text>
          <Text style={[styles.title, compact && styles.titleMobile]}>{resortName}, line by line.</Text>
          <Text style={styles.copy}>Explore verified Flurra run matches on real geographic geometry. Pan, zoom, and select a trail to open its field note.</Text>
        </View>
        <View style={styles.ticket}><Text style={styles.ticketTop}>LOCAL OSM SNAPSHOT</Text><Text style={styles.ticketMain}>MAP / 002</Text></View>
      </View>

      <View style={styles.mapFrame}>
        <View style={styles.tape} />
        <View style={styles.mapShell}>
          <HeavenlyMap selectedRunId={selectedRunId} onSelectRun={onSelectRun} />
          <View style={[styles.legend, compact && styles.legendMobile]} pointerEvents="none">
            <Text style={styles.legendTitle}>TRAIL KEY</Text>
            <View style={styles.legendItems}>
              {legendItems.map((item) => <View key={item.label} style={styles.legendItem}>
                <Text style={[styles.legendShape, { color: item.color }]}>{item.shape}</Text>
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>)}
            </View>
          </View>
          <View style={styles.prototypeLabel} pointerEvents="none">
            <Text style={styles.prototypeText}>PROTOTYPE MAP — TRAIL GEOMETRY FROM OPENSTREETMAP</Text>
          </View>
        </View>

        <View style={[styles.mapFooter, compact && styles.mapFooterMobile]}>
          <View style={styles.mapFacts}>
            <Text style={styles.factValue}>{heavenlyMapData.verifiedRunCount}</Text>
            <Text style={styles.factLabel}>VERIFIED FLURRA RUN MATCHES</Text>
          </View>
          <View style={styles.mapFacts}>
            <Text style={styles.factValue}>{heavenlyMapData.liftFeatureCount}</Text>
            <Text style={styles.factLabel}>OSM LIFT GEOMETRIES</Text>
          </View>
          <Text style={styles.attribution}>OpenFreeMap © OpenMapTiles · © OpenStreetMap contributors (ODbL) · Terrain: Mapzen / USGS</Text>
        </View>
      </View>

      <View style={[styles.selectionRow, compact && styles.selectionRowMobile]} accessibilityLiveRegion="polite">
        {selectedRun ? <>
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedEyebrow}>SELECTED RUN · {selectedRun.officialDifficulty.toUpperCase()}</Text>
            <Text testID="selected-map-run-name" style={styles.selectedName}>{selectedRun.name}</Text>
            <Text style={styles.selectedDescription}>{selectedRun.description}</Text>
            <View style={styles.selectedTags}>{selectedRun.conditionTags.map((tag) => <Text key={tag} style={styles.selectedTag}>{tag.replace('Sample: ', '')}</Text>)}</View>
          </View>
          <View style={styles.selectedActions}>
            <View style={styles.confidence}><Text style={styles.confidenceValue}>{selectedRun.confidence}%</Text><Text style={styles.confidenceLabel}>FLURRA CONFIDENCE</Text></View>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`View ${selectedRun.name} run details`}
              onPress={() => router.push(`/resorts/heavenly/runs/${selectedRun.id}` as Href)}
              style={({ hovered }: any) => [styles.viewRun, hovered && styles.viewRunHover]}
            >
              <Text style={styles.viewRunText}>VIEW RUN DETAILS</Text><Feather name="arrow-up-right" size={14} color={colors.white} />
            </Pressable>
          </View>
        </> : <View style={styles.emptySelection}>
          <Text style={styles.emptyMark}>✳</Text>
          <View><Text style={styles.emptyTitle}>Pick a trail line.</Text><Text style={styles.emptyCopy}>Click any verified colored run on the map, or use “Show on map” in the searchable directory below.</Text></View>
        </View>}
      </View>

      <View style={styles.safetyRow}>
        <Feather name="alert-triangle" size={15} color={colors.orange} />
        <Text style={styles.safety}>Flurra is informational only. Current resort signage, closures, patrol guidance, and your own judgment always take precedence.</Text>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { backgroundColor: '#e9e1d3', paddingVertical: 100 },
  inner: { alignSelf: 'center', maxWidth: 1180, width: '100%', paddingHorizontal: 24 },
  heading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 35, marginBottom: 35 },
  headingMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  eyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 47, lineHeight: 51, letterSpacing: -1.5, marginTop: 8 },
  titleMobile: { fontSize: 37, lineHeight: 41 },
  copy: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, maxWidth: 700, marginTop: 12 },
  ticket: { backgroundColor: colors.orange, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 12, transform: [{ rotate: '2deg' }] },
  ticketTop: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.1 },
  ticketMain: { color: colors.deep, fontFamily: fonts.display, fontSize: 18, marginTop: 3 },
  mapFrame: { backgroundColor: colors.paper, padding: 12, paddingBottom: 0, transform: [{ rotate: '-.25deg' }], shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 8, height: 9 } },
  tape: { position: 'absolute', zIndex: 5, top: -13, left: '45%', width: 110, height: 29, backgroundColor: '#e9d89f', opacity: .88, transform: [{ rotate: '-4deg' }] },
  mapShell: { minHeight: 520, borderColor: colors.forest, borderWidth: 1.5, overflow: 'hidden', position: 'relative' },
  legend: { position: 'absolute', zIndex: 3, top: 14, left: 14, backgroundColor: 'rgba(255,250,240,.94)', borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9, shadowColor: colors.forest, shadowOpacity: .25, shadowRadius: 0, shadowOffset: { width: 3, height: 3 } },
  legendMobile: { top: 10, left: 10, right: 54 },
  legendTitle: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.1 },
  legendItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendShape: { fontFamily: fonts.bold, fontSize: 10 },
  legendLabel: { color: colors.forest, fontFamily: fonts.bold, fontSize: 6, letterSpacing: .5 },
  prototypeLabel: { position: 'absolute', zIndex: 3, right: 14, bottom: 14, backgroundColor: 'rgba(18,60,50,.92)', paddingHorizontal: 9, paddingVertical: 7 },
  prototypeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 6, letterSpacing: .8 },
  mapFooter: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 30, paddingHorizontal: 16, paddingVertical: 12 },
  mapFooterMobile: { flexWrap: 'wrap', gap: 15 },
  mapFacts: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  factValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 24 },
  factLabel: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .8 },
  attribution: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginLeft: 'auto' },
  selectionRow: { marginTop: 28, backgroundColor: colors.forest, borderColor: colors.deep, borderWidth: 1.5, padding: 24, minHeight: 170, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 30, shadowColor: colors.orange, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  selectionRowMobile: { flexDirection: 'column', alignItems: 'stretch' },
  selectedCopy: { flex: 1 },
  selectedEyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.2 },
  selectedName: { color: colors.white, fontFamily: fonts.display, fontSize: 34, lineHeight: 39, marginTop: 5 },
  selectedDescription: { color: '#d4e0dc', fontFamily: fonts.body, fontSize: 12, lineHeight: 19, maxWidth: 700, marginTop: 7 },
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 },
  selectedTag: { color: colors.forest, backgroundColor: colors.paper, fontFamily: fonts.bold, fontSize: 6, textTransform: 'uppercase', paddingHorizontal: 6, paddingVertical: 4 },
  selectedActions: { minWidth: 190, alignItems: 'stretch', gap: 12 },
  confidence: { alignItems: 'center' },
  confidenceValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 29 },
  confidenceLabel: { color: '#a9bbb5', fontFamily: fonts.bold, fontSize: 6, letterSpacing: .8 },
  viewRun: { minHeight: 42, backgroundColor: colors.orange, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  viewRunHover: { backgroundColor: '#dd6537' },
  viewRunText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .7 },
  emptySelection: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyMark: { color: colors.lime, fontSize: 31 },
  emptyTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 25 },
  emptyCopy: { color: '#b9cbc5', fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 3 },
  safetyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 24, paddingHorizontal: 5 },
  safety: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 16 },
});
