import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent, AccessibilityActionEvent } from 'react-native';
import { colors } from '../theme/colors';

const THUMB = 26;

interface NeoSliderProps {
  min: number;
  max: number;
  step?: number;
  /** One value = single-thumb slider filling from the left; two = a range. */
  values: [number] | [number, number];
  fillColor?: string;
  /** Smallest allowed gap between the two thumbs of a range. */
  minGap?: number;
  onChange: (values: [number] | [number, number]) => void;
  accessibilityLabel: string;
}

/** Draggable neo-brutalist slider (PanResponder only, so it works on native and web). */
export const NeoSlider: React.FC<NeoSliderProps> = ({
  min,
  max,
  step = 1,
  values,
  fillColor = colors.primaryPink,
  minGap = 0,
  onChange,
  accessibilityLabel,
}) => {
  const [width, setWidth] = useState(0);
  const latest = useRef({ values, width, min, max, step, minGap, onChange });
  latest.current = { values, width, min, max, step, minGap, onChange };
  const dragStart = useRef(0);

  const range = values.length === 2;
  const toFraction = (v: number) => (max === min ? 0 : (v - min) / (max - min));

  const setThumb = (index: 0 | 1, next: number) => {
    const cur = latest.current;
    const snapped = Math.round(next / cur.step) * cur.step;
    if (cur.values.length === 1) {
      cur.onChange([Math.min(cur.max, Math.max(cur.min, snapped))]);
      return;
    }
    const [lo, hi] = cur.values;
    if (index === 0) {
      cur.onChange([Math.min(hi - cur.minGap, Math.max(cur.min, snapped)), hi]);
    } else {
      cur.onChange([lo, Math.max(lo + cur.minGap, Math.min(cur.max, snapped))]);
    }
  };

  const responders = useMemo(
    () =>
      ([0, 1] as const).map((index) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
            dragStart.current = latest.current.values[index] ?? latest.current.values[0];
          },
          onPanResponderMove: (_e, gesture) => {
            const cur = latest.current;
            if (cur.width <= 0) return;
            const delta = (gesture.dx / cur.width) * (cur.max - cur.min);
            setThumb(index, dragStart.current + delta);
          },
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onAccessibilityAction = (index: 0 | 1) => (e: AccessibilityActionEvent) => {
    const current = values[index] ?? values[0];
    if (e.nativeEvent.actionName === 'increment') setThumb(index, current + step);
    if (e.nativeEvent.actionName === 'decrement') setThumb(index, current - step);
  };

  const startFraction = range ? toFraction(values[0]) : 0;
  const endFraction = toFraction(range ? (values as [number, number])[1] : values[0]);

  const thumbs = (range ? [0, 1] : [0]) as Array<0 | 1>;

  return (
    <View style={styles.container}>
      <View style={styles.inner} onLayout={onLayout}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: fillColor,
                left: `${startFraction * 100}%`,
                right: `${100 - endFraction * 100}%`,
              },
            ]}
          />
        </View>
        {thumbs.map((index) => {
          const fraction = toFraction(values[index] ?? values[0]);
          return (
            <View
              key={index}
              {...responders[index].panHandlers}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={
                range ? `${accessibilityLabel} ${index === 0 ? 'minimum' : 'maximum'}` : accessibilityLabel
              }
              accessibilityValue={{ min, max, now: values[index] ?? values[0] }}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={onAccessibilityAction(index)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.thumb, { left: fraction * width - THUMB / 2 }]}
            >
              <View style={styles.thumbDot} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: THUMB / 2,
    marginVertical: 4,
  },
  inner: {
    height: THUMB,
    justifyContent: 'center',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryPink,
  },
});
