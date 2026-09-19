import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

export const DotGridBackground: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {/* Background base color */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgCream }]} />

      {/* Organic soft pink accent glow / shape at the top */}
      <Svg
        width="100%"
        height="320"
        style={styles.topAccent}
      >
        <Path
          d={`M 0,0 L ${screenWidth},0 L ${screenWidth},180 C ${screenWidth * 0.7},260 ${screenWidth * 0.3},160 0,240 Z`}
          fill="rgba(255, 182, 193, 0.35)"
        />
      </Svg>

      {/* Halftone / Polka dot grid */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id="dot-pattern"
            x="0"
            y="0"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <Circle cx="9" cy="9" r="1.4" fill="#000000" fillOpacity="0.14" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dot-pattern)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
