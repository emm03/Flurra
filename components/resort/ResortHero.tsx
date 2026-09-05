import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';
import { TopographicLines } from '../TopographicLines';

type ResortHeroProps = {
  name: string;
  location: string;
  image: string;
  vertical: string;
  trails: number;
  peak: string;
  completedCount: number;
  savedCount: number;
  explorationProgress: number;
  compact: boolean;
  onFindRun: () => void;
};

export function ResortHero({ name, location, image, vertical, trails, peak, completedCount, savedCount, explorationProgress, compact, onFindRun }: ResortHeroProps) {
  const router = useRouter();

  return <View style={styles.hero}>
    <TopographicLines light />
    <View style={[styles.header, compact && styles.headerMobile]}>
      <Pressable accessibilityRole="link" accessibilityLabel="Flurra home" onPress={() => router.replace('/')} style={styles.brand}>
        <View style={styles.mark}><Text style={styles.markText}>✳</Text></View><Text style={styles.logo}>flurra</Text>
      </Pressable>
      {!compact ? <View style={styles.sampleFlag}><View style={styles.sampleDot} /><Text style={styles.sampleText}>SAMPLE MOUNTAIN DATA</Text></View> : null}
      <Pressable accessibilityRole="link" accessibilityLabel="Back to Flurra home" onPress={() => router.replace('/')} style={({ hovered }: any) => [styles.back, compact && styles.backMobile, hovered && styles.backHover]}>
        <Feather name="arrow-left" size={15} color={colors.deep} /><Text style={styles.backText}>BACK TO HOME</Text>
      </Pressable>
    </View>

    <View style={[styles.inner, compact && styles.innerMobile]}>
      <View style={styles.copy}>
        <View style={styles.ticket}><Text style={styles.ticketText}>MOUNTAIN FILE · HEAVENLY / 8,560 FT</Text></View>
        <Text style={styles.eyebrow}>● YOUR HEAVENLY DAY</Text>
        <Text style={[styles.title, compact && styles.titleMobile]}>{name}</Text>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.intro}>Run beta, mountain progress, and the people skiing here — all in one field guide.</Text>
        <View style={[styles.stats, compact && styles.statsMobile]}>
          <View style={[styles.stat, compact && styles.statMobile]}><Text style={[styles.statValue, compact && styles.statValueMobile]}>{vertical}</Text><Text style={styles.statLabel}>VERTICAL</Text></View>
          <View style={styles.statDivider} />
          <View style={[styles.stat, compact && styles.statMobile]}><Text style={[styles.statValue, compact && styles.statValueMobile]}>{trails}</Text><Text style={styles.statLabel}>TRAILS</Text></View>
          <View style={styles.statDivider} />
          <View style={[styles.stat, compact && styles.statMobile]}><Text style={[styles.statValue, compact && styles.statValueMobile]}>{peak}</Text><Text style={styles.statLabel}>PEAK</Text></View>
        </View>
      </View>

      <View style={[styles.visual, compact && styles.visualMobile]}>
        <View style={styles.tape} />
        <View style={styles.photoFrame}>
          <ImageBackground source={{ uri: image }} style={styles.photo} imageStyle={styles.photoImage}>
            <View style={styles.photoShade} />
            <View style={styles.photoLabel}><Text style={styles.photoLabelTop}>LAKE TAHOE · SAMPLE CONDITIONS</Text><Text style={styles.photoLabelMain}>Bluebird energy ↗</Text></View>
          </ImageBackground>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressTop}><Text style={styles.progressEyebrow}>YOUR EXPLORATION</Text><Text accessibilityLabel={`${explorationProgress}% explored`} style={styles.progressValue}>{explorationProgress}%</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${explorationProgress}%` }]} /></View>
          <View style={styles.progressCounts}>
            <View><Text accessibilityLabel={`${completedCount} runs completed`} style={styles.countValue}>{completedCount}</Text><Text style={styles.countLabel}>RUNS COMPLETED</Text></View>
            <View><Text accessibilityLabel={`${savedCount} runs saved`} style={styles.countValue}>{savedCount}</Text><Text style={styles.countLabel}>RUNS SAVED</Text></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Go to the Heavenly run directory" onPress={onFindRun} style={({ hovered }: any) => [styles.findButton, hovered && styles.findHover]}>
            <Text style={styles.findText}>WHAT SHOULD I SKI NEXT?</Text><Feather name="arrow-down-right" size={16} color={colors.deep} />
          </Pressable>
        </View>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.forest, minHeight: 760, overflow: 'hidden' },
  header: { alignSelf: 'center', width: '100%', maxWidth: 1240, paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  headerMobile: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  markText: { color: colors.deep, fontSize: 20, fontWeight: '900' },
  logo: { color: colors.white, fontFamily: fonts.display, fontSize: 30, letterSpacing: -1.5 },
  sampleFlag: { borderColor: '#55756c', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sampleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange },
  sampleText: { color: '#bfd0ca', fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  back: { backgroundColor: colors.lime, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backMobile: { minHeight: 44, paddingHorizontal: 11, gap: 6 },
  backHover: { transform: [{ rotate: '-1deg' }] },
  backText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  inner: { alignSelf: 'center', maxWidth: 1200, width: '100%', paddingHorizontal: 28, paddingTop: 62, paddingBottom: 95, flexDirection: 'row', alignItems: 'center', gap: 74 },
  innerMobile: { flexDirection: 'column', alignItems: 'stretch', paddingHorizontal: 20, paddingTop: 42, gap: 55 },
  copy: { flex: 1, zIndex: 3 },
  ticket: { alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 13, paddingVertical: 7, marginBottom: 25, transform: [{ rotate: '-2deg' }] },
  ticketText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.4 },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 82, lineHeight: 84, letterSpacing: -4, marginTop: 10 },
  titleMobile: { fontSize: 53, lineHeight: 56, letterSpacing: -2 },
  location: { color: colors.orange, fontFamily: fonts.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 10 },
  intro: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 16, lineHeight: 25, maxWidth: 510, marginTop: 20 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 34 },
  statsMobile: { width: '100%', gap: 9, justifyContent: 'space-between' },
  stat: { minWidth: 74 },
  statMobile: { minWidth: 0, flex: 1 },
  statValue: { color: colors.white, fontFamily: fonts.display, fontSize: 25 },
  statValueMobile: { fontSize: 20 },
  statLabel: { color: '#8ca69d', fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2, marginTop: 3 },
  statDivider: { width: 1, height: 38, backgroundColor: '#537268' },
  visual: { width: 510, minHeight: 490, transform: [{ rotate: '1deg' }] },
  visualMobile: { width: '100%', minHeight: 500 },
  tape: { position: 'absolute', zIndex: 5, top: -14, left: '39%', width: 108, height: 32, backgroundColor: '#e8d291', opacity: .86, transform: [{ rotate: '-5deg' }] },
  photoFrame: { height: 355, backgroundColor: colors.paper, padding: 11, paddingBottom: 43, shadowColor: '#000', shadowOpacity: .34, shadowRadius: 14, shadowOffset: { width: 5, height: 11 } },
  photo: { flex: 1, justifyContent: 'flex-end' },
  photoImage: { backgroundColor: '#759ca4' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,31,25,.28)' },
  photoLabel: { padding: 15 },
  photoLabelTop: { color: colors.lime, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.2 },
  photoLabelMain: { color: colors.white, fontFamily: fonts.display, fontSize: 22, marginTop: 3 },
  progressCard: { marginTop: -18, marginHorizontal: 22, backgroundColor: colors.paper, borderColor: colors.deep, borderWidth: 1.5, padding: 20, transform: [{ rotate: '-1.5deg' }], shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 7, height: 8 } },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressEyebrow: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  progressValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 22 },
  progressTrack: { height: 7, backgroundColor: '#d9d6cc', marginTop: 9, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.orange },
  progressCounts: { flexDirection: 'row', gap: 35, marginTop: 14 },
  countValue: { color: colors.forest, fontFamily: fonts.display, fontSize: 23 },
  countLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1, marginTop: 2 },
  findButton: { marginTop: 16, backgroundColor: colors.lime, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  findHover: { transform: [{ translateY: -1 }] },
  findText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
});
