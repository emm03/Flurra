import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

export function FutureMapSection({ resortName, compact }: { resortName: string; compact: boolean }) {
  return <View style={styles.section}>
    <View style={styles.inner}>
      <View style={[styles.heading, compact && styles.headingMobile]}>
        <View>
          <Text style={styles.eyebrow}>TRAIL MAP / RESERVED</Text>
          <Text style={[styles.title, compact && styles.titleMobile]}>The real mountain belongs here.</Text>
          <Text style={styles.copy}>This space is intentionally reserved for verified trail geometry, lift connections, and real mountain data — not an invented schematic.</Text>
        </View>
        <View style={styles.ticket}><Text style={styles.ticketTop}>FUTURE BUILD</Text><Text style={styles.ticketMain}>MAP / 002</Text></View>
      </View>
      <View style={styles.mapFrame}>
        <View style={styles.tape} />
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapKicker}>FUTURE INTERACTIVE MOUNTAIN MAP</Text>
          <Text style={styles.mapTitle}>{resortName}, mapped from real trail geometry.</Text>
          <Text style={styles.mapCopy}>No fictional lines yet. This module will eventually support verified trails, lifts, difficulty layers, live operating status, and location-aware run planning.</Text>
          <View style={styles.capabilities}>
            {['VERIFIED TRAIL GEOMETRY', 'LIFT + TRAIL STATUS', 'DIFFICULTY LAYERS', 'LIVE CONDITION OVERLAYS'].map((item) => <Text key={item} style={styles.capability}>{item}</Text>)}
          </View>
          <Text style={styles.coordinate}>RESERVED CANVAS · LAKE TAHOE · DATA SOURCE TBD</Text>
        </View>
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
  mapFrame: { backgroundColor: colors.paper, padding: 12, paddingBottom: 38, transform: [{ rotate: '-.4deg' }], shadowColor: colors.forest, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 8, height: 9 } },
  tape: { position: 'absolute', zIndex: 2, top: -13, left: '45%', width: 110, height: 29, backgroundColor: '#e9d89f', opacity: .88, transform: [{ rotate: '-4deg' }] },
  mapPlaceholder: { minHeight: 420, backgroundColor: colors.blue, borderColor: colors.forest, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', padding: 35 },
  mapKicker: { color: colors.orange, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.8, textAlign: 'center' },
  mapTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 38, lineHeight: 43, textAlign: 'center', maxWidth: 720, marginTop: 14 },
  mapCopy: { color: '#416259', fontFamily: fonts.body, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 700, marginTop: 13 },
  capabilities: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 25 },
  capability: { color: colors.forest, backgroundColor: colors.paper, borderColor: colors.forest, borderWidth: 1, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .8, paddingHorizontal: 8, paddingVertical: 6 },
  coordinate: { position: 'absolute', bottom: 16, color: '#68827a', fontFamily: fonts.bold, fontSize: 6, letterSpacing: 1.2 },
});
