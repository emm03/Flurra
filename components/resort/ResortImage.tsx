import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';
import type { ResortImageMetadata } from '@/data/resorts';
import { colors, fonts } from '@/theme';

type ResortImageProps = {
  image: ResortImageMetadata;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
  showFallbackLabel?: boolean;
};

export function ResortImage({ image, style, imageStyle, children, showFallbackLabel = true }: ResortImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [image]);

  if (image.kind === 'branded-placeholder' || failed) {
    return <View
      accessibilityRole="image"
      accessibilityLabel={failed ? `${image.alt} Image unavailable; branded placeholder shown.` : image.alt}
      style={[styles.placeholder, style]}
    >
      <View style={[styles.contour, styles.contourOne]} />
      <View style={[styles.contour, styles.contourTwo]} />
      <View style={[styles.contour, styles.contourThree]} />
      <View style={styles.placeholderCopy}>
        <Text style={styles.placeholderMark}>✳</Text>
        {showFallbackLabel ? <>
          <Text style={styles.placeholderTitle}>Resort photography pending</Text>
          <Text style={styles.placeholderText}>Intentional Flurra placeholder · never a substitute resort photo</Text>
        </> : null}
      </View>
      {children}
    </View>;
  }

  return <ImageBackground
    accessibilityRole="image"
    accessibilityLabel={image.alt}
    source={{ uri: image.uri }}
    onError={() => setFailed(true)}
    resizeMode="cover"
    style={style}
    imageStyle={imageStyle}
  >{children}</ImageBackground>;
}

export function ResortImageCredit({ image, inverse = false }: { image: ResortImageMetadata; inverse?: boolean }) {
  if (image.kind !== 'verified-photo') {
    return <Text style={[styles.creditText, inverse && styles.creditTextInverse]}>{image.creditLine}</Text>;
  }

  return <Pressable
    accessibilityRole="link"
    accessibilityLabel={`Open photo source for ${image.resortId}. ${image.creditLine}`}
    onPress={() => void Linking.openURL(image.sourceUrl)}
    style={({ focused, hovered }: any) => [styles.credit, (focused || hovered) && styles.creditActive]}
  >
    <Text numberOfLines={2} style={[styles.creditText, inverse && styles.creditTextInverse]}>{image.creditLine}</Text>
    <Feather name="external-link" size={12} color={inverse ? colors.white : colors.forest} />
  </Pressable>;
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: '#6f999b', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  contour: { position: 'absolute', borderColor: 'rgba(246,240,228,.34)', borderWidth: 2, borderRadius: 999, transform: [{ rotate: '-12deg' }] },
  contourOne: { width: '120%', height: '58%', left: '-18%', top: '8%' },
  contourTwo: { width: '94%', height: '46%', right: '-22%', bottom: '8%' },
  contourThree: { width: '62%', height: '30%', left: '8%', bottom: '-9%' },
  placeholderCopy: { alignItems: 'center', maxWidth: 290, padding: 20, zIndex: 2 },
  placeholderMark: { color: colors.lime, fontSize: 29, fontWeight: '900' },
  placeholderTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 20, textAlign: 'center', marginTop: 6 },
  placeholderText: { color: '#e5efeb', fontFamily: fonts.medium, fontSize: 9, lineHeight: 14, letterSpacing: .7, textAlign: 'center', textTransform: 'uppercase', marginTop: 6 },
  credit: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 2 },
  creditActive: { opacity: .68 },
  creditText: { color: colors.forest, fontFamily: fonts.medium, fontSize: 8, lineHeight: 12, letterSpacing: .2, flexShrink: 1 },
  creditTextInverse: { color: colors.white },
});
