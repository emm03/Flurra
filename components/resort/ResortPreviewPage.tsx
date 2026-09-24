import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ResortFact, ResortRecord } from '@/data/resorts';
import { getResortSupportLabel } from '@/data/resorts';
import { colors, fonts } from '@/theme';
import { Footer } from '../Footer';
import { TopographicLines } from '../TopographicLines';
import { ResortImage, ResortImageCredit } from './ResortImage';

const factOrder = ['verticalRise', 'summitElevation', 'trailCount', 'liftCount', 'skiableAcres'] as const;

function displayFacts(resort: ResortRecord) {
  return factOrder
    .map((key) => resort.facts[key])
    .filter((item): item is ResortFact => Boolean(item))
    .slice(0, 4);
}

const capabilityCopy = {
  'map-data-in-progress': 'Geographic trail and lift data has not been imported or reconciled. No fake map is shown.',
  'directory-only': 'A verified directory is available; interactive geographic geometry is not published yet.',
  'coming-soon': 'This resort is in Flurra’s discovery queue.',
  'full-map': 'Verified local geometry is available.',
} as const;

export function ResortPreviewPage({ resort }: { resort: ResortRecord }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });
  const officialSource = resort.sources.find((item) => item.sourceType === 'official-resort' || item.sourceType === 'official-trail-map');
  const facts = displayFacts(resort);

  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.hero}>
      <TopographicLines light />
      <View style={[styles.header, compact && styles.headerMobile]}>
        <Pressable accessibilityRole="link" accessibilityLabel="Flurra home" onPress={() => router.replace('/')} style={styles.brand}>
          <View style={styles.mark}><Text style={styles.markText}>✳</Text></View><Text style={styles.logo}>flurra</Text>
        </Pressable>
        <Pressable accessibilityRole="link" accessibilityLabel="Back to Flurra home" onPress={() => router.replace('/')} style={styles.back}>
          <Feather name="arrow-left" size={15} color={colors.deep} /><Text style={styles.backText}>BACK TO HOME</Text>
        </Pressable>
      </View>

      <View style={[styles.heroInner, compact && styles.heroInnerMobile]}>
        <View style={styles.heroCopy}>
          <View style={[styles.statusBadge, { backgroundColor: resort.accent }]}><Text style={styles.statusBadgeText}>{getResortSupportLabel(resort).toUpperCase()}</Text></View>
          <Text style={[styles.title, compact && styles.titleMobile]}>{resort.name}</Text>
          <Text style={styles.location}>{resort.location.display}</Text>
          <Text style={styles.description}>{resort.description}</Text>
          <View style={[styles.facts, compact && styles.factsMobile]}>
            {facts.map((item) => <View key={item.label} style={styles.fact}>
              <Text style={styles.factValue}>{item.display}</Text>
              <Text style={styles.factLabel}>{item.label.toUpperCase()}</Text>
            </View>)}
          </View>
          <Text style={styles.factsDisclosure}>Published resort facts · verified from official resort sources · not live conditions</Text>
        </View>

        <View style={[styles.photoFrame, compact && styles.photoFrameMobile]}>
          <View style={styles.tape} />
          <ResortImage image={resort.heroImage} style={styles.photo} imageStyle={styles.photoImage}>
            <View style={styles.photoShade} />
            <View style={styles.photoTag}><Text style={styles.photoTagText}>VERIFIED RESORT PHOTOGRAPH</Text></View>
          </ResortImage>
          <ResortImageCredit image={resort.heroImage} inverse />
        </View>
      </View>
    </View>

    <View style={styles.readinessSection}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionEyebrow}>FLURRA RESORT BETA</Text>
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleMobile]}>The mountain file is real. The detailed guide is still being built.</Text>
        <View style={[styles.readinessGrid, compact && styles.stack]}>
          <View style={styles.mapCard}>
            <View style={styles.mapArt}>
              <View style={[styles.mapGlow, { backgroundColor: resort.accentSoft }]} />
              <Text style={styles.mapMark}>✳</Text>
              <Text style={styles.mapTitle}>Verified geometry pending</Text>
              <Text style={styles.mapCopy}>Flurra will not substitute Heavenly geometry or invent a schematic trail network for {resort.shortName}.</Text>
            </View>
            <View style={styles.mapStatus}><Text style={styles.mapStatusLabel}>MAP CAPABILITY</Text><Text style={styles.mapStatusValue}>{resort.capabilities.map.replaceAll('-', ' ')}</Text></View>
          </View>
          <View style={styles.statusColumn}>
            <View style={styles.progressCard}>
              <Text style={styles.cardEyebrow}>YOUR EXPLORATION</Text>
              <View style={styles.progressRow}><Text style={styles.progressValue}>0%</Text><Text style={styles.progressLabel}>No run catalog published yet</Text></View>
              <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
              <Text style={styles.cardCopy}>Saved and skied progress will unlock after a verified {resort.shortName} run directory is published.</Text>
            </View>
            <View style={styles.capabilityCard}>
              <Text style={styles.cardEyebrow}>DATA READINESS</Text>
              <Text style={styles.capabilityTitle}>{resort.ingestion.stage.toUpperCase()}</Text>
              <Text style={styles.cardCopy}>{capabilityCopy[resort.capabilities.map]}</Text>
              <View style={styles.pills}>
                <Text style={styles.pill}>FACTS VERIFIED</Text>
                <Text style={styles.pillMuted}>GEOMETRY {resort.ingestion.geometryStatus.replaceAll('-', ' ').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>

    <View style={styles.futureSection}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionEyebrow}>WHAT FLURRA CAN HONESTLY SHOW TODAY</Text>
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleMobile]}>Useful now. Explicit about what comes next.</Text>
        <View style={[styles.futureGrid, compact && styles.stack]}>
          {[
            ['01', 'Official mountain facts', 'Published statistics and source provenance are ready for this preview.'],
            ['02', 'Run discovery', 'Trail names, difficulties, and recommendations wait for resort-specific reconciliation.'],
            ['03', 'Community', 'Reports, groups, reactions, and live activity are not active. This is a product preview only.'],
          ].map(([number, title, copy]) => <View key={number} style={styles.futureCard}>
            <Text style={styles.futureNumber}>{number}</Text><Text style={styles.futureTitle}>{title}</Text><Text style={styles.futureCopy}>{copy}</Text>
          </View>)}
        </View>
        {officialSource ? <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open official source for ${resort.name}`}
          onPress={() => void Linking.openURL(officialSource.url)}
          style={styles.sourceLink}
        ><Text style={styles.sourceLinkText}>VIEW OFFICIAL MOUNTAIN SOURCE</Text><Feather name="external-link" size={14} color={colors.deep} /></Pressable> : null}
      </View>
    </View>

    <View style={styles.safety}>
      <Feather name="alert-circle" size={19} color={colors.orange} />
      <Text style={styles.safetyText}>Flurra is informational only. Resort signage, closures, patrol guidance, and official resort information always take precedence. This preview contains no live conditions or operational status.</Text>
    </View>
    <Footer />
  </ScrollView>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  page: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1 },
  hero: { backgroundColor: colors.forest, overflow: 'hidden' },
  header: { width: 'calc(100% - 48px)' as any, maxWidth: 1240, alignSelf: 'center', minHeight: 64, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerMobile: { width: 'calc(100% - 24px)' as any },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44 },
  mark: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  markText: { color: colors.deep, fontSize: 20, fontWeight: '900' },
  logo: { color: colors.white, fontFamily: fonts.display, fontSize: 28, letterSpacing: -1.4 },
  back: { minHeight: 44, backgroundColor: colors.lime, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  backText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .8 },
  heroInner: { width: 'calc(100% - 56px)' as any, maxWidth: 1180, alignSelf: 'center', paddingTop: 48, paddingBottom: 70, flexDirection: 'row', alignItems: 'center', gap: 62 },
  heroInnerMobile: { width: 'calc(100% - 28px)' as any, flexDirection: 'column', alignItems: 'stretch', paddingTop: 30, paddingBottom: 44, gap: 35 },
  heroCopy: { flex: 1, zIndex: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, transform: [{ rotate: '-1.5deg' }] },
  statusBadgeText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.1 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 59, lineHeight: 62, letterSpacing: -2.7, marginTop: 14 },
  titleMobile: { fontSize: 41, lineHeight: 44, letterSpacing: -1.8 },
  location: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 9 },
  description: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 15, lineHeight: 23, maxWidth: 570, marginTop: 18 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 22, marginTop: 27 },
  factsMobile: { gap: 12 },
  fact: { minWidth: 82 },
  factValue: { color: colors.white, fontFamily: fonts.display, fontSize: 24 },
  factLabel: { color: '#8fa9a0', fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.05, marginTop: 3 },
  factsDisclosure: { color: '#8fa9a0', fontFamily: fonts.medium, fontSize: 8, lineHeight: 13, textTransform: 'uppercase', letterSpacing: .6, marginTop: 19 },
  photoFrame: { width: 445, height: 355, backgroundColor: colors.paper, padding: 10, paddingBottom: 45, transform: [{ rotate: '1deg' }], shadowColor: '#000', shadowOpacity: .28, shadowRadius: 15, shadowOffset: { width: 6, height: 10 } },
  photoFrameMobile: { width: '100%', height: 310, transform: [{ rotate: '0deg' }] },
  tape: { position: 'absolute', zIndex: 5, top: -14, left: '38%', width: 95, height: 27, backgroundColor: '#ead89d', opacity: .88, transform: [{ rotate: '-5deg' }] },
  photo: { flex: 1, justifyContent: 'flex-end' },
  photoImage: { backgroundColor: '#70989d' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,35,29,.18)' },
  photoTag: { alignSelf: 'flex-start', backgroundColor: colors.lime, paddingHorizontal: 9, paddingVertical: 6, margin: 10 },
  photoTagText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1 },
  readinessSection: { backgroundColor: colors.cream, paddingVertical: 85 },
  futureSection: { backgroundColor: '#e8e0d2', paddingVertical: 85 },
  sectionInner: { width: '100%', maxWidth: 1160, alignSelf: 'center', paddingHorizontal: 22 },
  sectionEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.6 },
  sectionTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 40, lineHeight: 44, maxWidth: 820, marginTop: 8, marginBottom: 34 },
  sectionTitleMobile: { fontSize: 31, lineHeight: 35 },
  readinessGrid: { flexDirection: 'row', gap: 24, alignItems: 'stretch' },
  mapCard: { flex: 1.25, borderColor: colors.forest, borderWidth: 1.5, backgroundColor: colors.paper, minHeight: 390, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  mapArt: { flex: 1, minHeight: 310, alignItems: 'center', justifyContent: 'center', padding: 30, overflow: 'hidden' },
  mapGlow: { position: 'absolute', width: 320, height: 190, borderRadius: 180, opacity: .75, transform: [{ rotate: '-14deg' }] },
  mapMark: { color: colors.orange, fontSize: 35, fontWeight: '900' },
  mapTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 26, textAlign: 'center', marginTop: 8 },
  mapCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 400, marginTop: 10 },
  mapStatus: { borderTopColor: colors.forest, borderTopWidth: 1.5, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  mapStatusLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  mapStatusValue: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .8, textTransform: 'uppercase' },
  statusColumn: { flex: .75, gap: 18 },
  progressCard: { flex: 1, backgroundColor: colors.forest, padding: 24 },
  capabilityCard: { flex: 1, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 23 },
  cardEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 16 },
  progressValue: { color: colors.lime, fontFamily: fonts.display, fontSize: 38 },
  progressLabel: { color: colors.white, fontFamily: fonts.medium, fontSize: 10, flexShrink: 1 },
  progressTrack: { height: 7, backgroundColor: '#49675f', marginTop: 13 },
  progressFill: { height: '100%', width: 0, backgroundColor: colors.orange },
  cardCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 18, marginTop: 12 },
  capabilityTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 27, marginTop: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
  pill: { backgroundColor: colors.lime, color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .8, paddingHorizontal: 7, paddingVertical: 5 },
  pillMuted: { backgroundColor: '#ddd7ca', color: colors.deep, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .8, paddingHorizontal: 7, paddingVertical: 5 },
  futureGrid: { flexDirection: 'row', gap: 18 },
  stack: { flexDirection: 'column' },
  futureCard: { flex: 1, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 23, minHeight: 205 },
  futureNumber: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  futureTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 23, marginTop: 18 },
  futureCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, marginTop: 10 },
  sourceLink: { minHeight: 48, alignSelf: 'flex-start', backgroundColor: colors.lime, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28 },
  sourceLinkText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  safety: { backgroundColor: colors.forest, paddingHorizontal: 24, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  safetyText: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 10, lineHeight: 16, maxWidth: 820, flexShrink: 1 },
});
