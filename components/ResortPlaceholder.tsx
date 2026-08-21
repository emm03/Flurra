import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { heavenlyRuns } from '@/data/runRecommendations';
import { colors, fonts } from '@/theme';
import { TopographicLines } from './TopographicLines';

type ResortPlaceholderProps = {
  name: string;
  location: string;
  vertical: string;
  trails: number;
  image: string;
  complete?: boolean;
};

export function ResortPlaceholder({ name, location, vertical, trails, image, complete = false }: ResortPlaceholderProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width > 0 && width < 760;
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_900Black });

  if (!loaded) return <View style={styles.loading}><ActivityIndicator color={colors.lime} /></View>;

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.hero}>
      <TopographicLines light />
      <View style={styles.header}>
        <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>✳</Text></View><Text style={styles.logo}>flurra</Text></View>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/')} style={({ hovered }: any) => [styles.back, hovered && styles.backHover]}>
          <Feather name="arrow-left" size={15} color={colors.deep} /><Text style={styles.backText}>BACK TO HOME</Text>
        </Pressable>
      </View>
      <View style={[styles.heroInner, compact && styles.heroInnerMobile]}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{complete ? 'YOUR HEAVENLY MOUNTAIN FILE' : 'MOUNTAIN FILE · COMING SOON'}</Text>
          <Text style={[styles.title, compact && styles.titleMobile]}>{name}</Text>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.intro}>{complete ? 'Start with the mountain essentials, check today’s pulse, and find the Heavenly runs that match your ski day.' : `Flurra is building the ${name} mountain guide, community reports, and personalized run recommendations.`}</Text>
          <View style={styles.stats}>
            <View><Text style={styles.statValue}>{vertical}</Text><Text style={styles.statLabel}>VERTICAL</Text></View>
            <View style={styles.statDivider} />
            <View><Text style={styles.statValue}>{trails}</Text><Text style={styles.statLabel}>TRAILS</Text></View>
          </View>
        </View>
        <View style={[styles.photoFrame, compact && styles.photoFrameMobile]}>
          <View style={styles.tape} />
          <ImageBackground source={{ uri: image }} style={styles.photo} imageStyle={styles.photoImage}>
            <View style={styles.photoShade} />
            <View style={styles.photoTag}><Text style={styles.photoTagText}>{complete ? 'LAKE TAHOE · TWO STATES · ONE BIG DAY' : 'MOUNTAIN PREVIEW'}</Text></View>
          </ImageBackground>
        </View>
      </View>
    </View>

    {complete ? <>
      <View style={styles.conditionsSection}>
        <View style={styles.sectionInner}>
          <Text style={styles.sectionEyebrow}>TODAY AT HEAVENLY</Text>
          <Text style={styles.sectionTitle}>The quick mountain read.</Text>
          <View style={[styles.conditionGrid, compact && styles.stack]}>
            {[
              ['Fresh corduroy', 'Surface', 'Smooth early laps with a few firm patches lower down.'],
              ['Bluebird energy', 'Weather', 'Clear skies, light wind, and big lake views.'],
              ['Building slowly', 'Crowds', 'Moderate traffic near the main base lifts.'],
            ].map(([value, label, copy]) => <View key={label} style={styles.conditionCard}><Text style={styles.conditionLabel}>{label}</Text><Text style={styles.conditionValue}>{value}</Text><Text style={styles.conditionCopy}>{copy}</Text></View>)}
          </View>
        </View>
      </View>
      <View style={styles.runsSection}>
        <View style={styles.sectionInner}>
          <Text style={styles.sectionEyebrow}>RUN STARTERS</Text>
          <Text style={styles.sectionTitle}>Three Heavenly classics.</Text>
          <View style={[styles.runGrid, compact && styles.stack]}>
            {heavenlyRuns.slice(0, 3).map((run, index) => <View key={run.id} style={styles.runCard}>
              <View style={styles.runTop}><Text style={styles.runNumber}>0{index + 1}</Text><Text style={styles.difficulty}>{run.difficulty}</Text></View>
              <Text style={styles.runName}>{run.name}</Text>
              <Text style={styles.runCopy}>{run.fallbackReason}</Text>
              <View style={styles.tags}>{run.conditionTags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View>
            </View>)}
          </View>
        </View>
      </View>
    </> : <View style={styles.comingSoon}>
      <Text style={styles.comingIcon}>✳</Text>
      <Text style={styles.comingTitle}>Your {name} guide is next in line.</Text>
      <Text style={styles.comingCopy}>This route is ready for resort data, trail details, live reports, and community features.</Text>
      <Pressable accessibilityRole="link" onPress={() => router.replace('/')} style={styles.homeButton}><Text style={styles.homeButtonText}>KEEP EXPLORING FLURRA</Text><Feather name="arrow-right" size={15} color={colors.deep} /></Pressable>
    </View>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  page: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1 },
  hero: { backgroundColor: colors.forest, minHeight: 650, overflow: 'hidden' },
  header: { alignSelf: 'center', width: '100%', maxWidth: 1240, paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  markText: { color: colors.deep, fontSize: 20, fontWeight: '900' },
  logo: { color: colors.white, fontFamily: fonts.display, fontSize: 30, letterSpacing: -1.5 },
  back: { backgroundColor: colors.lime, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backHover: { transform: [{ rotate: '-1deg' }] },
  backText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
  heroInner: { alignSelf: 'center', maxWidth: 1180, width: '100%', paddingHorizontal: 28, paddingTop: 70, paddingBottom: 90, flexDirection: 'row', alignItems: 'center', gap: 75 },
  heroInnerMobile: { flexDirection: 'column', alignItems: 'stretch', paddingTop: 45, gap: 50 },
  heroCopy: { flex: 1, zIndex: 2 },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 68, lineHeight: 72, letterSpacing: -3, marginTop: 12 },
  titleMobile: { fontSize: 48, lineHeight: 52, letterSpacing: -2 },
  location: { color: colors.orange, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 12 },
  intro: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 16, lineHeight: 25, maxWidth: 540, marginTop: 22 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 25, marginTop: 35 },
  statValue: { color: colors.white, fontFamily: fonts.display, fontSize: 28 },
  statLabel: { color: '#8ca69d', fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.4, marginTop: 3 },
  statDivider: { width: 1, height: 42, backgroundColor: '#507067' },
  photoFrame: { width: 460, height: 350, backgroundColor: colors.paper, padding: 11, paddingBottom: 42, transform: [{ rotate: '2deg' }], shadowColor: '#000', shadowOpacity: .3, shadowRadius: 16, shadowOffset: { width: 5, height: 12 } },
  photoFrameMobile: { width: '100%', height: 320 },
  tape: { position: 'absolute', zIndex: 3, top: -14, left: '38%', width: 105, height: 31, backgroundColor: '#e9d497', opacity: .85, transform: [{ rotate: '-5deg' }] },
  photo: { flex: 1, justifyContent: 'flex-end' },
  photoImage: { backgroundColor: '#759ca4' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,35,29,.22)' },
  photoTag: { alignSelf: 'flex-start', backgroundColor: colors.lime, paddingHorizontal: 10, paddingVertical: 6, margin: 12 },
  photoTagText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  conditionsSection: { backgroundColor: colors.cream, paddingVertical: 90 },
  runsSection: { backgroundColor: '#e9e1d3', paddingVertical: 90 },
  sectionInner: { maxWidth: 1160, width: '100%', alignSelf: 'center', paddingHorizontal: 24 },
  sectionEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  sectionTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 40, lineHeight: 44, marginTop: 8, marginBottom: 38 },
  conditionGrid: { flexDirection: 'row', gap: 18 },
  conditionCard: { flex: 1, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1.5, padding: 25, shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 5, height: 6 } },
  conditionLabel: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.3 },
  conditionValue: { color: colors.forest, fontFamily: fonts.display, fontSize: 23, marginTop: 9 },
  conditionCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 10 },
  runGrid: { flexDirection: 'row', gap: 18 },
  runCard: { flex: 1, backgroundColor: colors.forest, padding: 24, minHeight: 230 },
  runTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  runNumber: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.3 },
  difficulty: { color: colors.lime, fontFamily: fonts.bold, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1 },
  runName: { color: colors.white, fontFamily: fonts.display, fontSize: 26, marginTop: 18 },
  runCopy: { color: '#cbd9d4', fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 18 },
  tag: { color: colors.deep, backgroundColor: colors.lime, fontFamily: fonts.bold, fontSize: 7, textTransform: 'uppercase', paddingHorizontal: 6, paddingVertical: 4 },
  stack: { flexDirection: 'column' },
  comingSoon: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', paddingHorizontal: 24, paddingVertical: 105 },
  comingIcon: { color: colors.orange, fontSize: 36 },
  comingTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 38, lineHeight: 43, textAlign: 'center', marginTop: 16 },
  comingCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 560, marginTop: 14 },
  homeButton: { backgroundColor: colors.lime, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 30 },
  homeButtonText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
});
