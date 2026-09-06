import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { heavenlyMapData } from '@/data/heavenlyMap';
import type { ResortRun } from '@/data/heavenlyResort';
import { colors, fonts } from '@/theme';
import { HeavenlyMap } from './HeavenlyMap';
import { RunExplorerPanel } from './RunExplorerPanel';

type HeavenlyMapWorkspaceProps = {
  resortName: string;
  compact: boolean;
  runs: ResortRun[];
  selectedRunId: string | null;
  savedIds: string[];
  skiedIds: string[];
  mapRunIds: ReadonlySet<string>;
  onSelectRun: (runId: string | null) => void;
  onToggleSaved: (id: string) => void;
  onToggleSkied: (id: string) => void;
  onShowOnMap: (id: string) => void;
};

const legendItems = [
  { label: 'GREEN', color: '#34875a', shape: '●' },
  { label: 'BLUE', color: '#176da0', shape: '■' },
  { label: 'BLACK', color: colors.deep, shape: '◆' },
  { label: 'EXPERT', color: '#070d0b', shape: '◆◆' },
  { label: 'LIFT', color: colors.orange, shape: '━' },
];

const baseAttributionLinks = [
  { label: 'OpenFreeMap', url: 'https://openfreemap.org/' },
  { label: 'OpenMapTiles', url: 'https://openmaptiles.org/' },
  { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' },
];

const terrainAttributionLinks = [
  { label: 'Mapzen terrain', url: 'https://registry.opendata.aws/terrain-tiles/' },
  { label: 'USGS 3DEP', url: 'https://www.usgs.gov/3d-elevation-program' },
];

export function HeavenlyMapWorkspace({
  resortName,
  compact,
  runs,
  selectedRunId,
  savedIds,
  skiedIds,
  mapRunIds,
  onSelectRun,
  onToggleSaved,
  onToggleSkied,
  onShowOnMap,
}: HeavenlyMapWorkspaceProps) {
  const { height } = useWindowDimensions();
  const [terrainAvailable, setTerrainAvailable] = useState(true);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const attributionLinks = terrainAvailable ? [...baseAttributionLinks, ...terrainAttributionLinks] : baseAttributionLinks;
  const workspaceHeight = compact
    ? Math.max(610, Math.min(720, height - 80))
    : Math.max(650, Math.min(790, height - 90));

  const showRunOnMap = (runId: string) => {
    onShowOnMap(runId);
    if (compact) setMobileView('map');
  };

  return <View style={[styles.section, compact && styles.sectionMobile]}>
    <View style={[styles.topbar, compact && styles.topbarMobile]}>
      <View style={styles.topbarCopy}>
        <Text style={styles.eyebrow}>REAL MOUNTAIN / PROTOTYPE</Text>
        <Text style={[styles.title, compact && styles.titleMobile]}>{resortName}, line by line.</Text>
        {!compact ? <Text style={styles.copy}>Search the directory beside the mountain, then select a verified run to focus its real OpenStreetMap geometry.</Text> : null}
      </View>
      <View style={styles.ticket}><Text style={styles.ticketTop}>LOCAL OSM SNAPSHOT</Text><Text style={styles.ticketMain}>MAP / 002</Text></View>
    </View>

    {compact ? <View style={styles.mobileSwitch} accessibilityRole="tablist" accessibilityLabel="Heavenly explorer view">
      <Pressable accessibilityRole="tab" aria-selected={mobileView === 'map'} accessibilityState={{ selected: mobileView === 'map' }} accessibilityLabel="Show interactive mountain map" onPress={() => setMobileView('map')} style={[styles.mobileTab, mobileView === 'map' && styles.mobileTabActive]}>
        <Feather name="map" size={16} color={mobileView === 'map' ? colors.lime : colors.forest} />
        <Text style={[styles.mobileTabText, mobileView === 'map' && styles.mobileTabTextActive]}>MAP</Text>
      </Pressable>
      <Pressable accessibilityRole="tab" aria-selected={mobileView === 'list'} accessibilityState={{ selected: mobileView === 'list' }} accessibilityLabel="Show searchable Heavenly run list" onPress={() => setMobileView('list')} style={[styles.mobileTab, mobileView === 'list' && styles.mobileTabActive]}>
        <Feather name="list" size={17} color={mobileView === 'list' ? colors.lime : colors.forest} />
        <Text style={[styles.mobileTabText, mobileView === 'list' && styles.mobileTabTextActive]}>LIST</Text>
      </Pressable>
    </View> : null}

    <View style={[styles.workspace, compact && styles.workspaceMobile, { height: workspaceHeight }]}>
      {!compact ? <RunExplorerPanel runs={runs} variant="desktop" selectedRunId={selectedRunId} savedIds={savedIds} skiedIds={skiedIds} mapRunIds={mapRunIds} onToggleSaved={onToggleSaved} onToggleSkied={onToggleSkied} onShowOnMap={showRunOnMap} /> : null}

      <View style={[styles.mapFrame, compact && styles.mapFrameMobile]}>
        <View style={styles.tape} />
        <View style={styles.mapShell}>
          <HeavenlyMap compact={compact} workspace bottomInset={compact && mobileView === 'map' ? 202 : 0} selectedRunId={selectedRunId} onSelectRun={onSelectRun} onTerrainAvailabilityChange={setTerrainAvailable} />
          <View style={[styles.legend, compact && styles.legendMobile]} pointerEvents="none">
            <Text style={styles.legendTitle}>TRAIL KEY</Text>
            <View style={[styles.legendItems, compact && styles.legendItemsMobile]}>{legendItems.map((item) => <View key={item.label} style={styles.legendItem}><Text style={[styles.legendShape, { color: item.color }]}>{item.shape}</Text><Text style={styles.legendLabel}>{item.label}</Text></View>)}</View>
          </View>
          <View style={[styles.prototypeLabel, compact && styles.prototypeLabelMobile]} pointerEvents="none"><Text style={styles.prototypeText}>PROTOTYPE MAP — TRAIL GEOMETRY FROM OPENSTREETMAP</Text></View>

          {compact ? <>
            {mobileView === 'map' ? <RunExplorerPanel runs={runs} variant="mobile-sheet" selectedRunId={selectedRunId} savedIds={savedIds} skiedIds={skiedIds} mapRunIds={mapRunIds} onToggleSaved={onToggleSaved} onToggleSkied={onToggleSkied} onShowOnMap={showRunOnMap} onOpenList={() => setMobileView('list')} /> : null}
            <View pointerEvents={mobileView === 'list' ? 'auto' : 'none'} style={[styles.mobileListOverlay, mobileView !== 'list' && styles.mobileListOverlayHidden]}><RunExplorerPanel runs={runs} variant="mobile-list" selectedRunId={selectedRunId} savedIds={savedIds} skiedIds={skiedIds} mapRunIds={mapRunIds} onToggleSaved={onToggleSaved} onToggleSkied={onToggleSkied} onShowOnMap={showRunOnMap} /></View>
          </> : null}
        </View>

        <View style={[styles.mapFooter, compact && styles.mapFooterMobile]}>
          {!compact ? <><View style={styles.mapFacts}><Text style={styles.factValue}>{heavenlyMapData.verifiedRunCount}</Text><Text style={styles.factLabel}>VERIFIED RUN MATCHES</Text></View><View style={styles.mapFacts}><Text style={styles.factValue}>{heavenlyMapData.liftFeatureCount}</Text><Text style={styles.factLabel}>OSM LIFT GEOMETRIES</Text></View></> : null}
          <View style={[styles.attribution, compact && styles.attributionMobile]} accessibilityLabel="Map data attribution">
            {attributionLinks.map((item, index) => <View key={item.label} style={styles.attributionItem}>{index > 0 ? <Text style={styles.attributionSeparator}>·</Text> : null}<Pressable accessibilityRole="link" accessibilityLabel={`Attribution: ${item.label}`} onPress={() => Linking.openURL(item.url)} style={({ hovered, focused }: any) => [styles.attributionLink, (hovered || focused) && styles.attributionLinkActive]}><Text style={styles.attributionText}>{item.label}</Text></Pressable></View>)}
          </View>
        </View>
      </View>
    </View>

    <View style={[styles.safetyRow, compact && styles.safetyRowMobile]}><Feather name="alert-triangle" size={15} color={colors.orange} /><Text style={styles.safety}>Flurra is informational only. Current resort signage, closures, patrol guidance, and your own judgment always take precedence. Community reports and sample conditions below are not official resort status.</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  section: { backgroundColor: '#e9e1d3', paddingTop: 30, paddingBottom: 48 },
  sectionMobile: { paddingTop: 20, paddingBottom: 36 },
  topbar: { alignSelf: 'center', width: 'calc(100% - 48px)' as any, maxWidth: 1420, minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 18 },
  topbarMobile: { width: 'calc(100% - 16px)' as any, minHeight: 84, alignItems: 'flex-end', gap: 10, paddingHorizontal: 6, marginBottom: 12 },
  topbarCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.5 },
  title: { color: colors.forest, fontFamily: fonts.display, fontSize: 35, lineHeight: 39, letterSpacing: -1, marginTop: 4 },
  titleMobile: { fontSize: 29, lineHeight: 32 },
  copy: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, maxWidth: 720, marginTop: 5 },
  ticket: { backgroundColor: colors.orange, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, transform: [{ rotate: '1.5deg' }] },
  ticketTop: { color: colors.deep, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.85 },
  ticketMain: { color: colors.deep, fontFamily: fonts.display, fontSize: 15, marginTop: 2 },
  workspace: { alignSelf: 'center', width: 'calc(100% - 48px)' as any, maxWidth: 1420, flexDirection: 'row', gap: 12 },
  workspaceMobile: { width: 'calc(100% - 16px)' as any, flexDirection: 'column', gap: 0 },
  mapFrame: { flex: 1, minWidth: 0, height: '100%', backgroundColor: colors.paper, padding: 8, paddingBottom: 0, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  mapFrameMobile: { width: '100%', padding: 5, paddingBottom: 0, shadowOffset: { width: 3, height: 4 } },
  tape: { position: 'absolute', zIndex: 12, top: -10, left: '44%', width: 86, height: 22, backgroundColor: '#e9d89f', opacity: 0.88, transform: [{ rotate: '-3deg' }] },
  mapShell: { flex: 1, minHeight: 0, borderColor: colors.forest, borderWidth: 1.5, overflow: 'hidden', position: 'relative' },
  legend: { position: 'absolute', zIndex: 6, top: 12, left: 12, backgroundColor: 'rgba(255,250,240,.94)', borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7, shadowColor: colors.forest, shadowOpacity: 0.2, shadowRadius: 0, shadowOffset: { width: 2, height: 2 } },
  legendMobile: { top: 7, left: 7, right: 58, paddingHorizontal: 7, paddingVertical: 6 },
  legendTitle: { color: colors.orange, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.9 },
  legendItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  legendItemsMobile: { columnGap: 7, rowGap: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendShape: { fontFamily: fonts.bold, fontSize: 9 },
  legendLabel: { color: colors.forest, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.4 },
  prototypeLabel: { position: 'absolute', zIndex: 5, right: 10, bottom: 10, backgroundColor: 'rgba(18,60,50,.9)', paddingHorizontal: 8, paddingVertical: 6 },
  prototypeLabelMobile: { left: 'auto', right: 7, bottom: 212, maxWidth: 168 },
  prototypeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.65 },
  mapFooter: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 12, paddingVertical: 8 },
  mapFooterMobile: { minHeight: 78, paddingHorizontal: 8, paddingVertical: 7 },
  mapFacts: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  factValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 20 },
  factLabel: { color: colors.forest, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 0.65 },
  attribution: { marginLeft: 'auto', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', maxWidth: 520 },
  attributionMobile: { width: '100%', maxWidth: '100%', marginLeft: 0, justifyContent: 'flex-start' },
  attributionItem: { flexDirection: 'row', alignItems: 'center' },
  attributionSeparator: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginHorizontal: 3 },
  attributionLink: { minHeight: 28, justifyContent: 'center', borderBottomColor: 'transparent', borderBottomWidth: 1 },
  attributionLinkActive: { borderBottomColor: colors.orange },
  attributionText: { color: colors.muted, fontFamily: fonts.body, fontSize: 8 },
  mobileSwitch: { alignSelf: 'center', width: 'calc(100% - 16px)' as any, maxWidth: 1420, minHeight: 48, flexDirection: 'row', paddingHorizontal: 2, marginBottom: 7 },
  mobileTab: { flex: 1, minHeight: 48, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  mobileTabActive: { backgroundColor: colors.forest },
  mobileTabText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.9 },
  mobileTabTextActive: { color: colors.lime },
  mobileListOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, backgroundColor: colors.cream },
  mobileListOverlayHidden: { display: 'none' },
  safetyRow: { alignSelf: 'center', width: 'calc(100% - 48px)' as any, maxWidth: 1420, flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 20, paddingHorizontal: 4 },
  safetyRowMobile: { width: 'calc(100% - 16px)' as any, paddingHorizontal: 6, marginTop: 15 },
  safety: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 9, lineHeight: 14 },
});
