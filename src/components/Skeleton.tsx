import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../lib/theme';

interface SkeletonProps { width?: number | string; height?: number; radius?: number; style?: ViewStyle; }

export function Skeleton({ width = '100%', height = 16, radius = theme.radius.sm, style }: SkeletonProps) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius: radius, backgroundColor: theme.colors.bgHover, opacity: anim }, style]}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton height={160} radius={0} />
      <View style={s.body}>
        <View style={s.row}>
          <Skeleton width="60%" height={18} />
          <Skeleton width={80} height={24} radius={theme.radius.full} />
        </View>
        <Skeleton height={13} style={{ marginTop: 8 }} />
        <Skeleton width="80%" height={13} style={{ marginTop: 4 }} />
        <View style={s.tags}>
          <Skeleton width={60} height={22} radius={theme.radius.full} />
          <Skeleton width={80} height={22} radius={theme.radius.full} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  body: { padding: 14, gap: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: 6, marginTop: 10 },
});
