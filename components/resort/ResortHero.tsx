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
        {!compact ? <>
          <View style={styles.tape} />
          <View style={styles.photoFrame}>
            <ImageBackground source={{ uri: image }} style={styles.photo} imageStyle={styles.photoImage}>
              <View style={styles.photoShade} />
              <View style={styles.photoLabel}><Text style={styles.photoLabelTop}>LAKE TAHOE · SAMPLE CONDITIONS</Text><Text style={styles.photoLabelMain}>Bluebird energy ↗</Text></View>
            </ImageBackground>
          </View>
        </> : null}
        <View style={[styles.progressCard, compact && styles.progressCardMobile]}>
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
  hero: { backgroundColor: colors.forest, minHeight: 410, overflow: 'hidden' },
  header: { alignSelf: 'center', width: 'calc(100% - 48px)' as any, maxWidth: 1370, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  headerMobile: { width: 'calc(100% - 24px)' as any, paddingVertical: 10, gap: 7 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { backgroundColor: colors.lime, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  markText: { color: colors.deep, fontSize: 20, fontWeight: '900' },
  logo: { color: colors.white, fontFamily: fonts.display, fontSize: 27, letterSpacing: -1.3 },
  sampleFlag: { borderColor: '#55756c', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sampleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange },
  sampleText: { color: '#bfd0ca', fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  back: { backgroundColor: colors.lime, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backMobile: { minHeight: 44, paddingHorizontal: 9, gap: 5 },
  backHover: { transform: [{ rotate: '-1deg' }] },
  backText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .75 },
  inner: { alignSelf: 'center', maxWidth: 1340, width: 'calc(100% - 56px)' as any, paddingTop: 22, paddingBottom: 34, flexDirection: 'row', alignItems: 'center', gap: 52 },
  innerMobile: { width: 'calc(100% - 32px)' as any, flexDirection: 'column', alignItems: 'stretch', paddingTop: 20, paddingBottom: 28, gap: 20 },
  copy: { flex: 1, zIndex: 3 },
  ticket: { alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 11, paddingVertical: 6, marginBottom: 12, transform: [{ rotate: '-2deg' }] },
  ticketText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.4 },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 61, lineHeight: 63, letterSpacing: -3, marginTop: 6 },
  titleMobile: { fontSize: 45, lineHeight: 47, letterSpacing: -1.8 },
  location: { color: colors.orange, fontFamily: fonts.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 10 },
  intro: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 13, lineHeight: 20, maxWidth: 560, marginTop: 12 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 20 },
  statsMobile: { width: '100%', gap: 9, justifyContent: 'space-between' },
  stat: { minWidth: 74 },
  statMobile: { minWidth: 0, flex: 1 },
  statValue: { color: colors.white, fontFamily: fonts.display, fontSize: 25 },
  statValueMobile: { fontSize: 20 },
  statLabel: { color: '#8ca69d', fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2, marginTop: 3 },
  statDivider: { width: 1, height: 38, backgroundColor: '#537268' },
  visual: { width: 430, minHeight: 250, transform: [{ rotate: '.7deg' }] },
  visualMobile: { width: '100%', minHeight: 0, transform: [{ rotate: '0deg' }] },
  tape: { position: 'absolute', zIndex: 5, top: -11, left: '39%', width: 92, height: 24, backgroundColor: '#e8d291', opacity: .86, transform: [{ rotate: '-5deg' }] },
  photoFrame: { height: 142, backgroundColor: colors.paper, padding: 7, paddingBottom: 22, shadowColor: '#000', shadowOpacity: .3, shadowRadius: 10, shadowOffset: { width: 4, height: 7 } },
  photo: { flex: 1, justifyContent: 'flex-end' },
  photoImage: { backgroundColor: '#759ca4' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,31,25,.28)' },
  photoLabel: { padding: 10 },
  photoLabelTop: { color: colors.lime, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.2 },
  photoLabelMain: { color: colors.white, fontFamily: fonts.display, fontSize: 18, marginTop: 2 },
  progressCard: { marginTop: -14, marginHorizontal: 17, backgroundColor: colors.paper, borderColor: colors.deep, borderWidth: 1.5, padding: 15, transform: [{ rotate: '-1deg' }], shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 6, height: 7 } },
  progressCardMobile: { marginTop: 0, marginHorizontal: 0, padding: 14, transform: [{ rotate: '0deg' }], shadowOffset: { width: 4, height: 5 } },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressEyebrow: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  progressValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 22 },
  progressTrack: { height: 7, backgroundColor: '#d9d6cc', marginTop: 9, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.orange },
  progressCounts: { flexDirection: 'row', gap: 35, marginTop: 10 },
  countValue: { color: colors.forest, fontFamily: fonts.display, fontSize: 20 },
  countLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1, marginTop: 2 },
  findButton: { marginTop: 11, backgroundColor: colors.lime, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  findHover: { transform: [{ translateY: -1 }] },
  findText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
});
