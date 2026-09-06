import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ResortRun } from '@/data/heavenlyResort';
import { heavenlyVerifiedRunIds } from '@/data/heavenlyMap';
import { getRunDetailReturn, type RunDetailOrigin } from '@/navigation/runDetailReturn';
import { useRunProgress } from '@/state/RunProgressStore';
import { colors, fonts } from '@/theme';
import { TopographicLines } from '../TopographicLines';

export function RunDetailPage({ run, origin }: { run?: ResortRun; origin?: RunDetailOrigin }) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const { isSaved, isCompleted, toggleSaved, toggleCompleted, persistenceStatus } = useRunProgress();
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });

  useEffect(() => {
    if (!loaded) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [loaded, run?.id]);

  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  if (!run) return <View style={styles.notFound}><Text style={styles.notFoundMark}>〰</Text><Text style={styles.notFoundTitle}>That run is not in this field guide yet.</Text><Pressable accessibilityRole="link" onPress={() => router.replace('/resorts/heavenly')} style={styles.backButton}><Text style={styles.backButtonText}>BACK TO HEAVENLY</Text></Pressable></View>;

  const saved = isSaved(run.id);
  const skied = isCompleted(run.id);
  const returnTarget = getRunDetailReturn(origin, router.canGoBack());
  const returnFromRun = () => {
    if (returnTarget.useHistory) router.back();
    else router.replace(returnTarget.destination);
  };

  return <ScrollView ref={scrollRef} style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.hero}>
      <TopographicLines light />
      <View style={[styles.header, compact && styles.headerMobile]}>
        <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>✳</Text></View><Text style={styles.logo}>flurra</Text></View>
        <Pressable accessibilityRole="link" accessibilityLabel={returnTarget.label} onPress={returnFromRun} style={[styles.back, compact && styles.backMobile]}><Feather name="arrow-left" size={14} color={colors.deep} /><Text style={styles.backText}>{returnTarget.label.toUpperCase()}</Text></Pressable>
      </View>
      <View style={[styles.heroInner, compact && styles.heroInnerMobile]}>
        <View style={styles.ticket}><Text style={styles.ticketText}>RUN FILE · SAMPLE CONDITIONS</Text></View>
        <Text style={styles.eyebrow}>HEAVENLY · {run.effectiveDifficultySymbol} {run.officialDifficulty.toUpperCase()}</Text>
        <Text style={[styles.title, compact && styles.titleMobile]}>{run.name}</Text>
        <Text style={styles.description}>{run.description}</Text>
        <View style={styles.confidence}><Text style={styles.confidenceValue}>{run.confidence}%</Text><View><Text style={styles.confidenceLabel}>FLURRA CONFIDENCE</Text><Text style={styles.confidenceNote}>Prototype score · not live guidance</Text></View></View>
      </View>
    </View>

    <View style={styles.detailSection}>
      <View style={[styles.detailInner, compact && styles.detailInnerMobile]}>
        <View style={[styles.detailCard, compact && styles.cardMobile]}>
          <Text style={styles.detailEyebrow}>THE FIELD NOTE</Text>
          <Text style={styles.detailTitle}>Why this run belongs in your day.</Text>
          <Text style={styles.detailCopy}>{run.detail}</Text>
          <View style={styles.detailRows}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>{run.accessRestriction ? 'EFFECTIVE MAP CLASSIFICATION' : 'OFFICIAL DIFFICULTY'}</Text><Text style={styles.detailValue}>{run.effectiveDifficultySymbol} {run.officialDifficulty}</Text></View>
            {run.accessRestriction && run.sourceOfficialDifficultyCode !== run.officialDifficultyCode ? <View style={styles.detailRow}><Text style={styles.detailLabel}>SOURCE RUN DIFFICULTY</Text><Text style={styles.detailValue}>{run.sourceOfficialDifficulty} · retained separately from the gated-area restriction</Text></View> : null}
            <View style={styles.detailRow}><Text style={styles.detailLabel}>ACCESS</Text><Text style={styles.detailValue}>{run.access}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>BEST FOR</Text><Text style={styles.detailValue}>{run.bestFor}</Text></View>
          </View>
        </View>
        <View style={[styles.sideCard, compact && styles.cardMobile]}>
          <Text style={styles.sideEyebrow}>SAMPLE CONDITIONS · NOT LIVE</Text>
          <View style={styles.tags}>{run.conditionTags.map((tag) => <Text key={tag} style={styles.tag}>{tag.replace('Sample: ', '')}</Text>)}</View>
          <Text style={styles.safety}>Use current resort signage, patrol guidance, and your own judgment before skiing any run.</Text>
          {heavenlyVerifiedRunIds.has(run.id) ? <Pressable accessibilityRole="link" accessibilityLabel={`View ${run.name} on map`} onPress={() => router.push(`/resorts/heavenly?run=${encodeURIComponent(run.id)}` as Href)} style={styles.mapAction}><Feather name="map-pin" size={14} color={colors.deep} /><Text style={styles.actionText}>VIEW ON PROTOTYPE MAP</Text></Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${run.name}`} accessibilityState={{ selected: saved }} onPress={() => toggleSaved(run.id)} style={[styles.action, saved && styles.actionSelected]}><Feather name={saved ? 'check' : 'bookmark'} size={14} color={colors.deep} /><Text style={styles.actionText}>{saved ? 'SAVED TO MY DAY' : 'SAVE THIS RUN'}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`${skied ? 'Remove skied' : 'I skied'} ${run.name}`} accessibilityState={{ selected: skied }} onPress={() => toggleCompleted(run.id)} style={[styles.action, styles.actionDark, skied && styles.actionSelected]}><Feather name={skied ? 'check' : 'check-circle'} size={14} color={skied ? colors.deep : colors.white} /><Text style={[styles.actionText, styles.actionTextLight, skied && styles.actionTextSelected]}>{skied ? '✓ ADDED TO MY PROGRESS' : 'I SKIED THIS'}</Text></Pressable>
          <Text accessibilityLiveRegion="polite" style={styles.persistenceNote}>{persistenceStatus === 'unavailable' ? 'Progress is available for this visit, but this browser blocked local saving.' : 'Progress saves on this device.'}</Text>
        </View>
      </View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  notFound: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: 25 },
  notFoundMark: { color: colors.orange, fontSize: 35 },
  notFoundTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, textAlign: 'center', marginTop: 12 },
  backButton: { backgroundColor: colors.lime, paddingHorizontal: 16, paddingVertical: 12, marginTop: 24 },
  backButtonText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  page: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1 },
  hero: { backgroundColor: colors.forest, minHeight: 580, overflow: 'hidden' },
  header: { alignSelf: 'center', maxWidth: 1180, width: '100%', paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerMobile: { paddingHorizontal: 16, gap: 10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { backgroundColor: colors.lime, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.deep, fontSize: 18 },
  logo: { color: colors.white, fontFamily: fonts.display, fontSize: 28 },
  back: { backgroundColor: colors.lime, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  backMobile: { minHeight: 44, paddingHorizontal: 11 },
  backText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  heroInner: { alignSelf: 'center', maxWidth: 1000, width: '100%', paddingHorizontal: 28, paddingTop: 80, paddingBottom: 100, alignItems: 'center' },
  heroInnerMobile: { paddingHorizontal: 18, paddingTop: 55, paddingBottom: 70 },
  ticket: { backgroundColor: colors.orange, paddingHorizontal: 13, paddingVertical: 7, transform: [{ rotate: '-2deg' }] },
  ticketText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.2 },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2, marginTop: 25 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 72, lineHeight: 77, textAlign: 'center', letterSpacing: -3, marginTop: 8 },
  titleMobile: { fontSize: 48, lineHeight: 52, letterSpacing: -2 },
  description: { color: '#d4e0dc', fontFamily: fonts.body, fontSize: 16, lineHeight: 25, textAlign: 'center', maxWidth: 720, marginTop: 16 },
  confidence: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.paper, borderColor: colors.lime, borderWidth: 3, paddingHorizontal: 16, paddingVertical: 10, marginTop: 27, transform: [{ rotate: '1deg' }] },
  confidenceValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 28 },
  confidenceLabel: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  confidenceNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 7, marginTop: 2 },
  detailSection: { backgroundColor: colors.cream, paddingVertical: 90 },
  detailInner: { alignSelf: 'center', maxWidth: 1080, width: '100%', paddingHorizontal: 24, flexDirection: 'row', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' },
  detailInnerMobile: { paddingHorizontal: 16, flexDirection: 'column', flexWrap: 'nowrap' },
  detailCard: { flex: 1.5, minWidth: 300, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 30, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 7, height: 8 } },
  detailEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.5 },
  detailTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 34, lineHeight: 39, marginTop: 8 },
  detailCopy: { color: colors.ink, fontFamily: fonts.body, fontSize: 14, lineHeight: 23, marginTop: 15 },
  detailRows: { marginTop: 26 },
  detailRow: { borderTopColor: '#d6d4c9', borderTopWidth: 1, paddingVertical: 14 },
  detailLabel: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.1 },
  detailValue: { color: colors.forest, fontFamily: fonts.medium, fontSize: 12, lineHeight: 19, marginTop: 5 },
  sideCard: { flex: 1, minWidth: 280, backgroundColor: colors.blue, borderColor: colors.forest, borderWidth: 1.5, padding: 25, transform: [{ rotate: '1deg' }] },
  cardMobile: { minWidth: 0, width: '100%', flex: 0 },
  sideEyebrow: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 15 },
  tag: { color: colors.forest, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1, fontFamily: fonts.bold, fontSize: 7, textTransform: 'uppercase', paddingHorizontal: 7, paddingVertical: 5 },
  safety: { color: '#49655e', fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 20 },
  mapAction: { minHeight: 43, backgroundColor: colors.lime, borderColor: colors.forest, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 },
  action: { minHeight: 43, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 },
  actionDark: { backgroundColor: colors.forest },
  actionSelected: { backgroundColor: colors.lime },
  actionText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .8 },
  actionTextLight: { color: colors.white },
  actionTextSelected: { color: colors.deep },
  persistenceNote: { color: '#49655e', fontFamily: fonts.body, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 10 },
});
