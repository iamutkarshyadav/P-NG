import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../theme/colors';

interface BrutalBoxProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadowOffset?: number | { x: number; y: number };
  shadowColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  overflow?: 'visible' | 'hidden';
}

export const BrutalBox: React.FC<BrutalBoxProps> = ({
  children,
  style,
  contentStyle,
  backgroundColor = colors.cardWhite,
  borderColor = colors.borderBlack,
  borderWidth = 2.5,
  borderRadius = 16,
  shadowOffset = { x: 3, y: 3 },
  shadowColor = colors.shadowBlack,
  onPress,
  disabled = false,
  overflow = 'visible',
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const offset =
    typeof shadowOffset === 'number'
      ? { x: shadowOffset, y: shadowOffset }
      : shadowOffset;

  // Split container styles (margin, size, positioning) from content styles (padding, alignment)
  // to ensure shadowLayer and innerContent stay in 100% pixel-perfect lockstep.
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const {
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    alignItems,
    justifyContent,
    ...containerStyle
  } = flattenedStyle;

  const extractedContentStyle: ViewStyle = {
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    alignItems,
    justifyContent,
  };

  const shadowLayer = (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: shadowColor,
          borderRadius,
          transform: [
            { translateX: offset.x },
            { translateY: offset.y },
          ],
        },
      ]}
    />
  );

  const innerContent = (
    <View
      style={[
        styles.foreground,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius,
          overflow,
          transform:
            isPressed && onPress
              ? [
                  { translateX: Math.min(2, offset.x) },
                  { translateY: Math.min(2, offset.y) },
                ]
              : [],
        },
        extractedContentStyle,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <View style={[styles.container, containerStyle]}>
        {shadowLayer}
        <Pressable
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          disabled={disabled}
        >
          {innerContent}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {shadowLayer}
      {innerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  foreground: {
    overflow: 'visible',
  },
});
