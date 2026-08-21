import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MountainReport, MountainSkier, SkiGroup } from '@/data/heavenlyResort';
import { colors, fonts } from '@/theme';
import { TopographicLines } from '../TopographicLines';

type CommunityPhoto = { id: string; label: string; author: string; image: string };

type MountainPulseProps = {
  reports: MountainReport[];
  skiers: MountainSkier[];
  groups: SkiGroup[];
  photos: CommunityPhoto[];
  compact: boolean;
};

export function MountainPulse({ reports, skiers, groups, photos, compact }: MountainPulseProps) {
  const [likedReports, setLikedReports] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<string[]>([]);
  const [followedSkiers, setFollowedSkiers] = useState<string[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0]?.id ?? '');

  const toggle = (id: string, current: string[], update: (next: string[]) => void) => {
    update(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return <View style={styles.section}>
    <TopographicLines light />
    <View style={styles.inner}>
      <View style={[styles.headingRow, compact && styles.headingMobile]}>
        <View>
          <Text style={styles.eyebrow}>● LIVE FROM THE MOUNTAIN</Text>
          <Text style={[styles.title, compact && styles.titleMobile]}>Heavenly mountain pulse.</Text>
          <Text style={styles.copy}>Reports, photos, people, and plans from a sample ski day. Nothing in this section is live yet.</Text>
        </View>
        <View style={styles.mockBadge}><View style={styles.pulse} /><Text style={styles.mockBadgeText}>SAMPLE SOCIAL ACTIVITY</Text></View>
      </View>

      <View style={[styles.reportGrid, compact && styles.stack]}>
        {reports.map((report, index) => {
          const liked = likedReports.includes(report.id);
          const saved = savedReports.includes(report.id);
          return <View key={report.id} style={[styles.reportCard, index === 1 && !compact && styles.reportOffset]}>
            <View style={styles.reportTop}>
              <View style={[styles.avatar, { backgroundColor: report.accent }]}><Text style={styles.initials}>{report.initials}</Text></View>
              <View style={styles.reportAuthor}><Text style={styles.authorName}>{report.author}</Text><Text style={styles.authorMeta}>Heavenly · {report.run} · {report.time}</Text></View>
              <Text style={styles.sampleChip}>SAMPLE</Text>
            </View>
            <Text style={styles.reportText}>“{report.text}”</Text>
            <View style={styles.reportTags}>{report.tags.map((tag) => <Text key={tag} style={styles.reportTag}>{tag}</Text>)}</View>
            <View style={styles.reportActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${liked ? 'Unlike' : 'Like'} ${report.author}'s report`} onPress={() => toggle(report.id, likedReports, setLikedReports)} style={[styles.reportButton, liked && styles.reportButtonActive]}>
                <Feather name="heart" size={13} color={colors.forest} /><Text style={styles.reportButtonText}>{report.likes + (liked ? 1 : 0)}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${report.author}'s report`} onPress={() => toggle(report.id, savedReports, setSavedReports)} style={[styles.reportButton, saved && styles.reportButtonActive]}>
                <Feather name={saved ? 'check' : 'bookmark'} size={13} color={colors.forest} /><Text style={styles.reportButtonText}>{saved ? 'SAVED' : 'SAVE'}</Text>
              </Pressable>
            </View>
          </View>;
        })}
      </View>

      <View style={styles.subsection}>
        <View style={styles.subsectionTop}><View><Text style={styles.subEyebrow}>COMMUNITY ROLL / SAMPLE</Text><Text style={styles.subTitle}>The mountain through their goggles.</Text></View><Text style={styles.handNote}>snow day evidence ↘</Text></View>
        <View style={[styles.photoGrid, compact && styles.stack]}>
          {photos.map((photo, index) => {
            const selected = selectedPhoto === photo.id;
            return <Pressable accessibilityRole="button" accessibilityLabel={`View sample photo ${photo.label}`} key={photo.id} onPress={() => setSelectedPhoto(photo.id)} style={[styles.photoFrame, index === 1 && !compact && styles.photoTilt, selected && styles.photoSelected]}>
              <ImageBackground source={{ uri: photo.image }} style={styles.photo} imageStyle={styles.photoImage}><View style={styles.photoShade} /><Text style={styles.photoSample}>SAMPLE PHOTO</Text></ImageBackground>
              <View style={styles.photoCaption}><View><Text style={styles.photoLabel}>{photo.label}</Text><Text style={styles.photoAuthor}>by {photo.author}</Text></View><Text style={styles.photoState}>{selected ? 'VIEWING' : 'OPEN'}</Text></View>
            </Pressable>;
          })}
        </View>
      </View>

      <View style={[styles.peopleGrid, compact && styles.stack]}>
        <View style={styles.peoplePanel}>
          <View style={styles.panelTop}><View><Text style={styles.subEyebrow}>SKIERS HERE NOW</Text><Text style={styles.panelTitle}>{skiers.length} sample skiers</Text></View><Text style={styles.sampleChip}>NOT LIVE</Text></View>
          {skiers.map((skier) => {
            const followed = followedSkiers.includes(skier.id);
            return <View key={skier.id} style={styles.personRow}>
              <View style={[styles.smallAvatar, { backgroundColor: skier.accent }]}><Text style={styles.smallInitials}>{skier.initials}</Text></View>
              <View style={styles.personCopy}><Text style={styles.personName}>{skier.name}</Text><Text style={styles.personStatus}>{skier.status}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel={`${followed ? 'Unfollow' : 'Follow'} ${skier.name}`} onPress={() => toggle(skier.id, followedSkiers, setFollowedSkiers)} style={[styles.follow, followed && styles.followActive]}><Text style={styles.followText}>{followed ? 'FOLLOWING' : 'FOLLOW'}</Text></Pressable>
            </View>;
          })}
        </View>

        <View style={styles.groupsPanel}>
          <View style={styles.panelTop}><View><Text style={styles.subEyebrow}>GROUPS SKIING SOON</Text><Text style={styles.panelTitle}>{groups.length} sample plans</Text></View><Text style={styles.sampleChip}>PROTOTYPE</Text></View>
          {groups.map((group) => {
            const joined = joinedGroups.includes(group.id);
            return <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupTop}><Text style={styles.groupName}>{group.name}</Text><Text style={styles.groupCount}>{group.members + (joined ? 1 : 0)} GOING</Text></View>
              <Text style={styles.groupWhen}>{group.when}</Text><Text style={styles.groupPace}>{group.pace}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`${joined ? 'Leave' : 'Join'} ${group.name}`} onPress={() => toggle(group.id, joinedGroups, setJoinedGroups)} style={[styles.join, joined && styles.joined]}><Text style={[styles.joinText, joined && styles.joinedText]}>{joined ? '✓ JOINED' : 'JOIN THIS GROUP'}</Text></Pressable>
            </View>;
          })}
        </View>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.deep, paddingVertical: 100, overflow: 'hidden' },
  inner: { alignSelf: 'center', maxWidth: 1180, width: '100%', paddingHorizontal: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 35, borderBottomColor: '#547168', borderBottomWidth: 1, paddingBottom: 26, marginBottom: 36 },
  headingMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  eyebrow: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 51, lineHeight: 55, letterSpacing: -2, marginTop: 8 },
  titleMobile: { fontSize: 39, lineHeight: 43 },
  copy: { color: '#c8d6d1', fontFamily: fonts.body, fontSize: 14, lineHeight: 22, maxWidth: 660, marginTop: 12 },
  mockBadge: { borderColor: '#547168', borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulse: { width: 8, height: 8, borderRadius: 5, backgroundColor: colors.orange },
  mockBadgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.1 },
  reportGrid: { flexDirection: 'row', alignItems: 'stretch', gap: 17 },
  stack: { flexDirection: 'column' },
  reportCard: { flex: 1, backgroundColor: colors.paper, padding: 20, minHeight: 280, transform: [{ rotate: '-.5deg' }], shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 5, height: 6 } },
  reportOffset: { transform: [{ translateY: 12 }, { rotate: '.8deg' }] },
  reportTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.deep, fontFamily: fonts.bold, fontSize: 10 },
  reportAuthor: { flex: 1, marginLeft: 10 },
  authorName: { color: colors.forest, fontFamily: fonts.bold, fontSize: 11 },
  authorMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginTop: 2 },
  sampleChip: { color: colors.deep, backgroundColor: colors.lime, fontFamily: fonts.bold, fontSize: 6, letterSpacing: .8, paddingHorizontal: 6, paddingVertical: 4 },
  reportText: { flex: 1, color: colors.forest, fontFamily: fonts.display, fontSize: 17, lineHeight: 24, marginTop: 20 },
  reportTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 14 },
  reportTag: { color: colors.forest, borderColor: '#c4c7bd', borderWidth: 1, fontFamily: fonts.bold, fontSize: 6, textTransform: 'uppercase', paddingHorizontal: 5, paddingVertical: 4 },
  reportActions: { borderTopColor: '#ddd7cb', borderTopWidth: 1, flexDirection: 'row', gap: 7, marginTop: 15, paddingTop: 12 },
  reportButton: { borderColor: colors.forest, borderWidth: 1, minHeight: 32, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportButtonActive: { backgroundColor: colors.lime },
  reportButtonText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 8 },
  subsection: { marginTop: 90 },
  subsectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  subEyebrow: { color: colors.orange, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.5 },
  subTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 31, lineHeight: 35, marginTop: 6 },
  handNote: { color: colors.lime, fontFamily: fonts.body, fontStyle: 'italic', fontSize: 11, transform: [{ rotate: '-4deg' }] },
  photoGrid: { flexDirection: 'row', gap: 17 },
  photoFrame: { flex: 1, backgroundColor: colors.paper, padding: 8, paddingBottom: 0, transform: [{ rotate: '-1deg' }], borderColor: 'transparent', borderWidth: 3 },
  photoTilt: { transform: [{ translateY: 14 }, { rotate: '1.3deg' }] },
  photoSelected: { borderColor: colors.lime },
  photo: { height: 220, justifyContent: 'flex-start', alignItems: 'flex-start' },
  photoImage: { backgroundColor: '#728f88' },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,31,25,.18)' },
  photoSample: { color: colors.deep, backgroundColor: colors.lime, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1, paddingHorizontal: 7, paddingVertical: 5, margin: 8 },
  photoCaption: { minHeight: 66, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoLabel: { color: colors.forest, fontFamily: fonts.display, fontSize: 17 },
  photoAuthor: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginTop: 2 },
  photoState: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 1 },
  peopleGrid: { flexDirection: 'row', gap: 20, marginTop: 90 },
  peoplePanel: { flex: 1, backgroundColor: colors.paper, borderColor: colors.orange, borderTopWidth: 6, padding: 24 },
  groupsPanel: { flex: 1, backgroundColor: '#d7e7e8', borderColor: colors.forest, borderWidth: 1.5, padding: 24, transform: [{ rotate: '.5deg' }] },
  panelTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15, marginBottom: 18 },
  panelTitle: { color: colors.forest, fontFamily: fonts.display, fontSize: 24, marginTop: 4 },
  personRow: { borderTopColor: '#d7d6cc', borderTopWidth: 1, minHeight: 68, flexDirection: 'row', alignItems: 'center' },
  smallAvatar: { width: 36, height: 36, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  smallInitials: { color: colors.deep, fontFamily: fonts.bold, fontSize: 8 },
  personCopy: { flex: 1, marginLeft: 10 },
  personName: { color: colors.forest, fontFamily: fonts.bold, fontSize: 10 },
  personStatus: { color: colors.muted, fontFamily: fonts.body, fontSize: 8, marginTop: 2 },
  follow: { borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  followActive: { backgroundColor: colors.lime },
  followText: { color: colors.forest, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .6 },
  groupCard: { borderTopColor: '#9eb5b4', borderTopWidth: 1, paddingVertical: 15 },
  groupTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  groupName: { color: colors.forest, fontFamily: fonts.display, fontSize: 20 },
  groupCount: { color: colors.orange, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .7 },
  groupWhen: { color: colors.forest, fontFamily: fonts.bold, fontSize: 9, marginTop: 7 },
  groupPace: { color: colors.muted, fontFamily: fonts.body, fontSize: 9, marginTop: 3 },
  join: { alignSelf: 'flex-start', backgroundColor: colors.forest, paddingHorizontal: 12, paddingVertical: 9, marginTop: 10 },
  joined: { backgroundColor: colors.lime },
  joinText: { color: colors.white, fontFamily: fonts.bold, fontSize: 7, letterSpacing: .8 },
  joinedText: { color: colors.deep },
});
