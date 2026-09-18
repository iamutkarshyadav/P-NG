import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Text as SvgText, G, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BrutalBox } from './BrutalBox';

export const PingLogoHeader: React.FC = () => {
  return (
    <View style={styles.outerWrapper}>
      {/* Main Pink Card */}
      <BrutalBox
        backgroundColor={colors.primaryPink}
        borderColor={colors.borderBlack}
        borderWidth={2.8}
        borderRadius={22}
        shadowOffset={{ x: 3.5, y: 3.5 }}
        style={styles.cardContainer}
        contentStyle={styles.cardContent}
      >
        {/* SVG Typographic Logo for "P!NG" with decreased letter spacing matching reference */}
        <Svg width="146" height="68" viewBox="0 0 146 68">
          {/* Extruded Deep Shadow */}
          <G transform="translate(3, 3.5)">
            <SvgText
              x="14"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              P
            </SvgText>
            <SvgText
              x="46"
              y="52"
              fontSize="54"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              !
            </SvgText>
            <SvgText
              x="66"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              N
            </SvgText>
            <SvgText
              x="94"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              G
            </SvgText>
          </G>

          {/* Black Stroke Outlines */}
          <G>
            <SvgText
              x="14"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              P
            </SvgText>
            <SvgText
              x="46"
              y="52"
              fontSize="54"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              !
            </SvgText>
            <SvgText
              x="66"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              N
            </SvgText>
            <SvgText
              x="94"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#000000"
              stroke="#000000"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              G
            </SvgText>
          </G>

          {/* Letter Foreground Fills: P (white), ! (bright yellow), N (white), G (white) */}
          <G>
            <SvgText
              x="14"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#FFFFFF"
            >
              P
            </SvgText>
            <SvgText
              x="46"
              y="52"
              fontSize="54"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill={colors.neonYellow}
            >
              !
            </SvgText>
            <SvgText
              x="66"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#FFFFFF"
            >
              N
            </SvgText>
            <SvgText
              x="94"
              y="52"
              fontSize="52"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              fill="#FFFFFF"
            >
              G
            </SvgText>
          </G>
        </Svg>
      </BrutalBox>

      {/* Floating Circular Heart Badge (Top Right) */}
      <View style={styles.heartBadgeContainer}>
        <BrutalBox
          backgroundColor={colors.primaryPink}
          borderColor={colors.borderBlack}
          borderWidth={2.4}
          borderRadius={24}
          shadowOffset={{ x: 2.5, y: 2.5 }}
          style={styles.heartBadge}
          contentStyle={styles.heartBadgeInner}
        >
          <Ionicons name="heart" size={22} color="#FFFFFF" />
          {/* Sparkle star at the top right */}
          <View style={styles.sparkle}>
            <Svg width="12" height="12" viewBox="0 0 12 12">
              <Path
                d="M 6 0 Q 6 6 12 6 Q 6 6 6 12 Q 6 6 0 6 Q 6 6 6 0 Z"
                fill={colors.accentYellow}
              />
            </Svg>
          </View>
        </BrutalBox>
      </View>

      {/* Overlapping Angled "★ 100% REAL" Badge (Bottom Left) */}
      <View style={styles.realBadgeContainer}>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.2}
          borderRadius={999}
          shadowOffset={{ x: 2.5, y: 2.5 }}
          contentStyle={styles.realBadgeContent}
        >
          <Text style={styles.realBadgeText}>★ 100% REAL</Text>
        </BrutalBox>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  cardContainer: {
    width: '100%',
  },
  cardContent: {
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBadgeContainer: {
    position: 'absolute',
    top: -12,
    right: -6,
    zIndex: 20,
  },
  heartBadge: {
    width: 44,
    height: 44,
  },
  heartBadgeInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  realBadgeContainer: {
    position: 'absolute',
    bottom: -10,
    left: -4,
    zIndex: 20,
    transform: [{ rotate: '-6deg' }],
  },
  realBadgeContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  realBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
});
