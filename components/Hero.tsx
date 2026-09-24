import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { resolveResortSearch, resortRegistry } from '@/data/resorts';
import { colors, fonts } from '@/theme';
import { Header } from './Header';
import { TopographicLines } from './TopographicLines';

type HeroProps = {
  compact: boolean;
  onExplore: () => void;
  onVibe: () => void;
  onMountainReport: () => void;
  onPlanSkiDay: () => void;
};

const popularResortIds = new Set(['heavenly', 'palisades-tahoe', 'mammoth-mountain']);
const popularResorts = resortRegistry.filter((resort) => popularResortIds.has(resort.id));

export function Hero({ compact, onExplore, onVibe, onMountainReport, onPlanSkiDay }: HeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const searchResorts = () => {
    const resort = query.trim();
    if (!resort) {
      setSearchMessage('Type a resort name to start exploring.');
      return;
    }

    const match = resolveResortSearch(resort);
    if (match) {
      setSearchMessage('');
      router.push(match.route as any);
      return;
    }

    setSearchMessage(`${resort} is coming soon to Flurra.`);
  };

  return <View style={styles.hero}>
    <TopographicLines light />
    <Header compact={compact} onExplore={onExplore} onVibe={onVibe} onMountainReport={onMountainReport} onPlanSkiDay={onPlanSkiDay} />
    <View style={[styles.inner, compact && styles.innerMobile]}>
      <View style={styles.copy}>
        <View style={styles.sticker}><Text style={styles.stickerText}>YOUR SKI DAY, SORTED.</Text></View>
        <Text style={[styles.title, compact && styles.titleMobile]}>Find your mountain.{`\n`}<Text style={styles.script}>Meet your people.</Text></Text>
        <Text style={styles.sub}>Sample mountain intel, runs that match your mood, and a whole crew who&apos;d rather be skiing.</Text>
        <View style={[styles.search, compact && styles.searchMobile]}><Feather name="search" size={21} color={colors.forest} /><TextInput accessibilityLabel="Search resorts" value={query} onChangeText={(value) => { setQuery(value); setSearchMessage(''); }} onSubmitEditing={searchResorts} returnKeyType="search" placeholder="Search a resort or mountain..." placeholderTextColor="#748078" style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel="Search Flurra resorts" onPress={searchResorts} style={styles.searchButton}><Text style={styles.searchText}>LET&apos;S GO</Text><Feather name="arrow-right" size={17} color={colors.deep} /></Pressable></View>
        {searchMessage ? <Text accessibilityLiveRegion="polite" style={styles.searchResult}>{searchMessage}</Text> : null}
        <View style={styles.popular}><Text style={styles.popularLabel}>POPULAR:</Text>{popularResorts.map((resort) => <Pressable accessibilityRole="link" accessibilityLabel={`Explore ${resort.name}`} key={resort.id} onPress={() => router.push(resort.route as any)} style={styles.popularButton}><Text style={styles.popularLink}>{resort.shortName}</Text></Pressable>)}</View>
      </View>
      <View style={[styles.visual, compact && styles.visualMobile]}>
        <View style={styles.tape} />
        <View style={styles.photoFrame}><View accessibilityRole="image" accessibilityLabel="Flurra branded mountain-day placeholder artwork, not a resort photograph" style={styles.photo}>
          <View style={[styles.photoContour, styles.photoContourOne]} /><View style={[styles.photoContour, styles.photoContourTwo]} /><View style={[styles.photoContour, styles.photoContourThree]} />
          <View style={styles.photoStar}><Text style={styles.photoStarText}>✳</Text></View>
          <View style={styles.photoTag}><Text style={styles.photoTagTop}>FLURRA PLACEHOLDER ART · NOT A RESORT PHOTO</Text><Text style={styles.photoTagBig}>Mountain-day energy →</Text></View>
        </View></View>
        <View style={styles.sun}><Text style={styles.sunIcon}>☀</Text><Text style={styles.sunText}>BLUEBIRD{`\n`}ENERGY</Text></View>
        <View style={styles.verticalLabel}><Text style={styles.verticalText}>GO WHERE IT FEELS GOOD</Text></View>
      </View>
    </View>
    <View style={styles.squiggle}><Text style={styles.squiggleText}>〰 〰 〰</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  hero: { backgroundColor: colors.forest, minHeight: 740, overflow: 'hidden' }, inner: { alignSelf: 'center', maxWidth: 1240, width: '100%', flexDirection: 'row', paddingHorizontal: 32, paddingTop: 64, paddingBottom: 100, gap: 70, alignItems: 'center' }, innerMobile: { flexDirection: 'column', paddingTop: 35, paddingHorizontal: 20, gap: 55 }, copy: { flex: 1, zIndex: 3 }, sticker: { alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 13, paddingVertical: 7, marginBottom: 25, transform: [{ rotate: '-2deg' }] }, stickerText: { fontFamily: fonts.bold, color: colors.deep, fontSize: 11, letterSpacing: 1.5 }, title: { color: colors.white, fontFamily: fonts.display, fontSize: 66, lineHeight: 68, letterSpacing: -3 }, titleMobile: { fontSize: 45, lineHeight: 49, letterSpacing: -2 }, script: { color: colors.lime, fontStyle: 'italic' }, sub: { color: '#d6e0dc', fontFamily: fonts.body, fontSize: 17, lineHeight: 27, maxWidth: 540, marginTop: 24 },
  search: { marginTop: 36, backgroundColor: colors.paper, borderRadius: 5, minHeight: 64, alignItems: 'center', paddingLeft: 18, paddingRight: 7, flexDirection: 'row', maxWidth: 585, shadowColor: '#000', shadowOpacity: .25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } }, searchMobile: { minHeight: 58, paddingLeft: 12 }, input: { flex: 1, minWidth: 0, height: '100%', paddingHorizontal: 10, fontFamily: fonts.body, fontSize: 15, color: colors.ink, outlineStyle: 'none' } as any, searchButton: { minHeight: 48, paddingHorizontal: 14, backgroundColor: colors.lime, alignItems: 'center', flexDirection: 'row', gap: 7, borderRadius: 3 }, searchText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10, letterSpacing: .8 }, popular: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 12 }, popularLabel: { color: '#8ca69d', fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, marginRight: 5 }, popularButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, popularLink: { color: '#c6d6d0', fontFamily: fonts.medium, fontSize: 11, textDecorationLine: 'underline' },
  searchResult: { color: colors.lime, fontFamily: fonts.medium, fontSize: 11, marginTop: 10 },
  visual: { width: 470, height: 430, transform: [{ rotate: '2deg' }] }, visualMobile: { width: '92%', maxWidth: 440, height: 370 }, tape: { position: 'absolute', zIndex: 4, top: -16, left: 160, width: 115, height: 38, backgroundColor: 'rgba(245,215,140,.8)', transform: [{ rotate: '-5deg' }] }, photoFrame: { backgroundColor: '#f7efe0', padding: 12, paddingBottom: 55, shadowColor: '#000', shadowOpacity: .3, shadowRadius: 15, shadowOffset: { width: 5, height: 12 }, height: '100%' }, photo: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#6e999b', overflow: 'hidden' }, photoContour: { position: 'absolute', borderColor: 'rgba(246,240,228,.33)', borderWidth: 2, borderRadius: 999, transform: [{ rotate: '-12deg' }] }, photoContourOne: { width: '120%', height: '55%', left: '-18%', top: '5%' }, photoContourTwo: { width: '92%', height: '43%', right: '-22%', top: '34%' }, photoContourThree: { width: '68%', height: '30%', left: '4%', bottom: '-7%' }, photoStar: { position: 'absolute', top: '26%', alignSelf: 'center', width: 86, height: 86, borderRadius: 45, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, photoStarText: { color: colors.deep, fontSize: 38, fontWeight: '900' }, photoTag: { padding: 20, zIndex: 2 }, photoTagTop: { color: colors.lime, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.2 }, photoTagBig: { color: colors.white, fontFamily: fonts.display, fontSize: 25, marginTop: 3 }, sun: { position: 'absolute', right: -35, top: 60, backgroundColor: colors.lime, width: 105, height: 105, borderRadius: 55, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '9deg' }] }, sunIcon: { fontSize: 26, color: colors.deep }, sunText: { fontFamily: fonts.bold, fontSize: 9, textAlign: 'center', color: colors.deep, letterSpacing: 1.2 }, verticalLabel: { position: 'absolute', bottom: 12, left: 28 }, verticalText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 }, squiggle: { position: 'absolute', bottom: 15, right: 35 }, squiggleText: { color: colors.orange, fontSize: 35 },
});
