import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getResortCtaLabel, getResortSupportLabel, resortRegistry } from '@/data/resorts';
import { colors, fonts } from '@/theme';
import { ResortImage, ResortImageCredit } from './resort/ResortImage';
import { SectionHeading } from './SectionHeading';

export function ResortSection({ compact }: { compact: boolean }) {
  const router = useRouter();
  const [directoryMessage, setDirectoryMessage] = useState('');

  return <View style={styles.section}><View style={styles.inner}>
    <View style={[styles.headingRow, compact && styles.headingMobile]}>
      <SectionHeading eyebrow="Pick your playground" title="Mountains worth waking up early for." copy="A five-resort beta with sourced facts, honest map readiness, and no invented trail networks." />
      <View>
        <Pressable accessibilityRole="button" accessibilityLabel="About the Flurra resort beta" onPress={() => setDirectoryMessage('Five verified resort profiles are available. Heavenly has a full interactive map; the other four are transparent previews while resort-specific trail data is prepared.')} style={styles.all}>
          <Text style={styles.allText}>ABOUT THIS BETA</Text><Feather name="info" size={15} color={colors.forest} />
        </Pressable>
        {directoryMessage ? <Text accessibilityLiveRegion="polite" style={styles.allMessage}>{directoryMessage}</Text> : null}
      </View>
    </View>

    <View style={[styles.grid, compact && styles.gridMobile]}>
      {resortRegistry.map((resort, index) => {
        const primaryFact = resort.facts.verticalRise ?? resort.facts.summitElevation;
        return <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${getResortCtaLabel(resort)}: ${resort.name}. ${getResortSupportLabel(resort)}.`}
          onPress={() => router.push(resort.route as any)}
          key={resort.id}
          style={({ hovered, focused }: any) => [styles.card, compact && styles.cardMobile, (hovered || focused) && styles.cardHover]}
        >
          <View style={[styles.tape, { backgroundColor: index % 2 ? '#efab83' : '#e9dfba' }]} />
          <ResortImage image={resort.heroImage} style={[styles.image, { backgroundColor: resort.accentSoft }]} imageStyle={styles.imageStyle}>
            <View style={styles.imageShade} />
            <View style={[styles.location, { backgroundColor: resort.accent }]}><Text style={styles.locationText}>{resort.location.display.toUpperCase()}</Text></View>
            <View style={styles.status}><Text style={styles.statusText}>{getResortSupportLabel(resort).toUpperCase()}</Text></View>
          </ResortImage>
          <View style={styles.credit}><ResortImageCredit image={resort.heroImage} /></View>
          <View style={styles.cardBody}>
            <View style={styles.cardCopy}>
              <Text style={styles.name}>{resort.name}</Text>
              <Text style={styles.meta}>{primaryFact ? `${primaryFact.display} ${primaryFact.label.toLowerCase()}` : 'Official facts verified'}{resort.facts.trailCount ? ` · ${resort.facts.trailCount.display} trails` : ''}</Text>
              <Text style={styles.cta}>{getResortCtaLabel(resort).toUpperCase()}</Text>
            </View>
            <View style={styles.go}><Feather name="arrow-up-right" size={19} color={colors.white} /></View>
          </View>
        </Pressable>;
      })}
    </View>
  </View></View>;
}

const styles = StyleSheet.create({
  section: { backgroundColor: '#e9e1d3', paddingVertical: 105 },
  inner: { maxWidth: 1180, width: '100%', alignSelf: 'center', paddingHorizontal: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 55, gap: 28 },
  headingMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 25 },
  all: { borderBottomColor: colors.forest, borderBottomWidth: 1, minHeight: 44, flexDirection: 'row', gap: 8, alignItems: 'center' },
  allText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  allMessage: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, maxWidth: 340, marginTop: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  gridMobile: { flexDirection: 'column', gap: 38 },
  card: { flexGrow: 1, flexShrink: 1, flexBasis: 330, maxWidth: 570, minWidth: 280, backgroundColor: colors.paper, padding: 10, paddingBottom: 0, transform: [{ rotate: '-.35deg' }], shadowColor: '#173d33', shadowOpacity: .18, shadowRadius: 13, shadowOffset: { width: 5, height: 9 } },
  cardMobile: { width: '100%', minWidth: 0, maxWidth: '100%', transform: [{ rotate: '0deg' }] },
  cardHover: { transform: [{ translateY: -5 }, { rotate: '.2deg' }], outlineStyle: 'solid', outlineWidth: 2, outlineColor: colors.forest } as any,
  tape: { position: 'absolute', zIndex: 2, top: -14, left: '37%', width: 85, height: 28, opacity: .85, transform: [{ rotate: '-4deg' }] },
  image: { height: 250, justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden' },
  imageStyle: { objectFit: 'cover' } as any,
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,42,34,.12)' },
  location: { paddingHorizontal: 10, paddingVertical: 6, margin: 10, zIndex: 1 },
  locationText: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8, letterSpacing: .8 },
  status: { backgroundColor: colors.forest, paddingHorizontal: 10, paddingVertical: 7, margin: 10, zIndex: 1 },
  statusText: { color: colors.lime, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1 },
  credit: { minHeight: 28, justifyContent: 'center', paddingHorizontal: 3 },
  cardBody: { minHeight: 112, paddingHorizontal: 12, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardCopy: { flex: 1, minWidth: 0 },
  name: { color: colors.forest, fontFamily: fonts.display, fontSize: 24 },
  meta: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 5 },
  cta: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1, marginTop: 9 },
  go: { backgroundColor: colors.orange, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
