/**
 * Shimmering skeleton placeholder for loading states.
 *
 * Pure React Native `Animated` — no external animation dep. Runs a
 * perpetual pulse between 0.55 and 1.0 opacity, ~1.2s per cycle.
 * All skeletons in a screen share the same animated value (via
 * context? no — kept local for simplicity), so they pulse in sync.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  style?: ViewStyle | ViewStyle[];
  /** Width of the skeleton block. Number (px) or percent string. */
  width?: number | `${number}%`;
  /** Height of the skeleton block. Defaults to 14 (text line height). */
  height?: number;
  /** Corner radius. Defaults to 6. */
  radius?: number;
}

export function Skeleton({ style, width, height = 14, radius = 6 }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const computedStyle: any = {
    width: width as number | string | undefined,
    height,
    borderRadius: radius,
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        computedStyle,
        { opacity },
        style as ViewStyle,
      ]}
    />
  );
}

/** A vertical stack of skeleton lines — useful for paragraphs. */
export function SkeletonLines({
  lines,
  lastWidth = '60%',
  gap = 8,
}: {
  lines: number;
  lastWidth?: `${number}%`;
  gap?: number;
}) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastWidth : '100%'}
          height={12}
          style={{ marginTop: i === 0 ? 0 : gap }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(28, 25, 23, 0.09)',
  },
});
