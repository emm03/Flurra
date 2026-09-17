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
        {!compact ? <View style={styles.ticket}><Text style={styles.ticketText}>MOUNTAIN FILE · HEAVENLY / 8,560 FT</Text></View> : null}
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
              <View style={styles.photoLabel}><Text style={styles.photoLabelTop}>SAMPLE EDITORIAL IMAGE · NOT LIVE</Text><Text style={styles.photoLabelMain}>Mountain-day energy ↗</Text></View>
            </ImageBackground>
          </View>
        </> : null}
        <View style={[styles.progressCard, compact && styles.progressCardMobile]}>
          <View style={styles.progressTop}><Text style={styles.progressEyebrow}>YOUR EXPLORATION</Text><Text accessibilityLabel={`${explorationProgress}% explored`} style={styles.progressValue}>{explorationProgress}%</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${explorationProgress}%` }]} /></View>
          <View style={[styles.progressBottom, compact && styles.progressBottomMobile]}>
            <View style={[styles.progressCounts, compact && styles.progressCountsMobile]}>
              <View><Text accessibilityLabel={`${completedCount} runs completed`} style={styles.countValue}>{completedCount}</Text><Text style={styles.countLabel}>{compact ? 'SKIED' : 'RUNS COMPLETED'}</Text></View>
              <View><Text accessibilityLabel={`${savedCount} runs saved`} style={styles.countValue}>{savedCount}</Text><Text style={styles.countLabel}>{compact ? 'SAVED' : 'RUNS SAVED'}</Text></View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Go to the Heavenly run explorer" onPress={onFindRun} style={({ hovered, focused }: any) => [styles.findButton, compact && styles.findButtonMobile, (hovered || focused) && styles.findHover]}>
              <Text style={styles.findText}>{compact ? 'FIND MY NEXT RUN' : 'WHAT SHOULD I SKI NEXT?'}</Text><Feather name="arrow-down-right" size={16} color={colors.deep} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.forest, overflow: 'hidden' },
  header: { alignSelf: 'center', width: 'calc(100% - 48px)' as any, maxWidth: 1370, minHeight: 52, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  headerMobile: { width: 'calc(100% - 20px)' as any, minHeight: 56, paddingVertical: 7, gap: 7 },
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
  inner: { alignSelf: 'center', maxWidth: 1340, width: 'calc(100% - 56px)' as any, paddingTop: 8, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 38 },
  innerMobile: { width: 'calc(100% - 24px)' as any, flexDirection: 'column', alignItems: 'stretch', paddingTop: 10, paddingBottom: 18, gap: 12 },
  copy: { flex: 1, zIndex: 3 },
  ticket: { alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 7, transform: [{ rotate: '-2deg' }] },
  ticketText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.4 },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 51, lineHeight: 53, letterSpacing: -2.5, marginTop: 3 },
  titleMobile: { fontSize: 37, lineHeight: 39, letterSpacing: -1.4 },
  location: { color: colors.orange, fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.35, marginTop: 4 },
  intro: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 10.5, lineHeight: 16, maxWidth: 590, marginTop: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 11 },
  statsMobile: { width: '100%', gap: 9, justifyContent: 'space-between' },
  stat: { minWidth: 74 },
  statMobile: { minWidth: 0, flex: 1 },
  statValue: { color: colors.white, fontFamily: fonts.display, fontSize: 22 },
  statValueMobile: { fontSize: 19 },
  statLabel: { color: '#8ca69d', fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1.2, marginTop: 3 },
  statDivider: { width: 1, height: 31, backgroundColor: '#537268' },
  visual: { width: 400, minHeight: 188, transform: [{ rotate: '.5deg' }] },
  visualMobile: { width: '100%', minHeight: 0, transform: [{ rotate: '0deg' }] },
  tape: { position: 'absolute', zIndex: 5, top: -8, left: '39%', width: 82, height: 18, backgroundColor: '#e8d291', opacity: .86, transform: [{ rotate: '-5deg' }] },
  photoFrame: { height: 76, backgroundColor: colors.paper, padding: 5, paddingBottom: 12, shadowColor: '#000', shadowOpacity: .28, shadowRadius: 8, shadowOffset: { width: 4, height: 6 } },
  photo: { flex: 1, justifyContent: 'flex-end' },
  photoImage: { backgroundColor: '#759ca4' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,31,25,.28)' },
  photoLabel: { padding: 7 },
  photoLabelTop: { color: colors.lime, fontFamily: fonts.bold, fontSize: 6, letterSpacing: 1 },
  photoLabelMain: { color: colors.white, fontFamily: fonts.display, fontSize: 14, marginTop: 1 },
  progressCard: { marginTop: -8, marginHorizontal: 14, backgroundColor: colors.paper, borderColor: colors.deep, borderWidth: 1.5, padding: 11, transform: [{ rotate: '-.7deg' }], shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 5, height: 6 } },
  progressCardMobile: { marginTop: 0, marginHorizontal: 0, padding: 11, transform: [{ rotate: '0deg' }], shadowOffset: { width: 4, height: 5 } },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressEyebrow: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  progressValue: { color: colors.orange, fontFamily: fonts.display, fontSize: 19 },
  progressTrack: { height: 6, backgroundColor: '#d9d6cc', marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.orange },
  progressBottom: {},
  progressBottomMobile: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  progressCounts: { flexDirection: 'row', gap: 35, marginTop: 6 },
  progressCountsMobile: { flex: 1, minWidth: 0, gap: 12, marginTop: 0 },
  countValue: { color: colors.forest, fontFamily: fonts.display, fontSize: 17 },
  countLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1, marginTop: 2 },
  findButton: { marginTop: 7, backgroundColor: colors.lime, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: colors.deep, borderWidth: 1 },
  findButtonMobile: { flex: 1, minWidth: 0, marginTop: 0, paddingHorizontal: 5, gap: 4 },
  findHover: { borderColor: colors.orange, borderWidth: 2, transform: [{ translateY: -1 }] },
  findText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
});
