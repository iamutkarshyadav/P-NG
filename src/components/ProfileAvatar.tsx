import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { paletteFor } from '../lib/palette';

interface ProfileAvatarProps {
  /** Signed photo URL. When missing, a generated illustration is shown instead. */
  uri?: string | null;
  /** Stable id (used to pick the fallback colours). */
  seed: string;
  size: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Round avatar: the person's photo, or a simple illustrated placeholder in their own colours. */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ uri, seed, size, style, accessibilityLabel }) => {
  const palette = paletteFor(seed);
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityLabel={accessibilityLabel}>
          <Rect width="40" height="40" fill={palette.bgFrom} />
          <Circle cx="20" cy="15" r="8" fill={palette.flat} stroke="#000" strokeWidth="1.2" />
          <Path d="M 12 14 Q 20 5 28 14 Q 24 11 20 12 Q 16 11 12 14 Z" fill={palette.hair} />
          <Path d="M 6 40 Q 8 26 20 26 Q 32 26 34 40 Z" fill={palette.jacket} stroke="#000" strokeWidth="1.2" />
        </Svg>
      )}
    </View>
  );
};
