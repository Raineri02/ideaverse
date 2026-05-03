import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Lightbulb, Rocket, CheckCircle2, PauseCircle, TrendingUp, Tag, Sparkles } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useStats, useTags } from '../../src/hooks/useProjects';

function AnimatedBar({ value, total, color }: { value: number; total: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = total > 0 ? value / total : 0;

  useEffect(() => {
    Animated.spring(anim, { toValue: pct, tension: 60, friction: 12, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={b.track}>
      <Animated.View
        style={[
          b.fill,
          { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

function StatCard({ Icon, label, value, color, delay }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, tension: 70, friction: 12, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.statCard, { borderColor: color + '40', transform: [{ scale: anim }], opacity: anim }]}>
      <Icon size={22} color={color} strokeWidth={1.5} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const stats = useStats();
  const { tags } = useTags();

  const statusData = [
    { key: 'ideia',        label: 'Ideias',       color: theme.colors.cyan,    Icon: Lightbulb },
    { key: 'em_progresso', label: 'Em Progresso', color: theme.colors.amber,   Icon: Rocket },
    { key: 'concluido',    label: 'Concluídos',   color: theme.colors.emerald, Icon: CheckCircle2 },
    { key: 'pausado',      label: 'Pausados',     color: theme.colors.textSub, Icon: PauseCircle },
  ];

  const completionRate = stats.total > 0
    ? Math.round((stats.concluido / stats.total) * 100)
    : 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Dashboard</Text>
        <Text style={s.sub}>Visão geral dos seus projetos</Text>
      </View>

      {/* Total destaque */}
      <View style={s.heroCard}>
        <View style={s.heroGlow} />
        <Sparkles size={40} color={theme.colors.primary} strokeWidth={1.3} style={{ marginBottom: 8 }} />
        <Text style={s.heroNumber}>{stats.total}</Text>
        <Text style={s.heroLabel}>projetos no universo</Text>
        <View style={s.heroDivider} />
        <Text style={s.heroRate}>
          <Text style={{ color: theme.colors.emerald }}>{completionRate}%</Text> de conclusão
        </Text>
      </View>

      {/* Cards de status */}
      <View style={s.cardsGrid}>
        {statusData.map((item, i) => (
          <StatCard key={item.key} Icon={item.Icon} label={item.label} value={(stats as any)[item.key]} color={item.color} delay={i * 80} />
        ))}
      </View>

      {/* Barras de progresso */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <TrendingUp size={15} color={theme.colors.primary} strokeWidth={2} />
          <Text style={s.sectionTitle}>Distribuição</Text>
        </View>
        {statusData.map((item) => (
          <View key={item.key} style={s.barRow}>
            <View style={s.barLabel}>
              <item.Icon size={13} color={item.color} strokeWidth={2} />
              <Text style={s.barName}>{item.label}</Text>
              <Text style={[s.barCount, { color: item.color }]}>{(stats as any)[item.key]}</Text>
            </View>
            <AnimatedBar value={(stats as any)[item.key]} total={stats.total} color={item.color} />
          </View>
        ))}
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Tag size={15} color={theme.colors.primary} strokeWidth={2} />
            <Text style={s.sectionTitle}>Suas Tags ({tags.length})</Text>
          </View>
          <View style={s.tagsWrap}>
            {tags.map((tag) => (
              <View key={tag.id} style={[s.tagChip, { backgroundColor: tag.color + '20', borderColor: tag.color + '50' }]}>
                <View style={[s.tagDot, { backgroundColor: tag.color }]} />
                <Text style={[s.tagText, { color: tag.color }]}>{tag.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 20 },
  title: { fontFamily: theme.font.display, fontSize: 30, color: theme.colors.text },
  sub: { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  heroCard: {
    marginHorizontal: 16, marginBottom: 20, borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.borderGlow,
    padding: 28, alignItems: 'center', overflow: 'hidden',
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  heroGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: theme.colors.primaryGlow, top: -60,
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroNumber: { fontFamily: theme.font.display, fontSize: 64, color: theme.colors.primary },
  heroLabel: { fontFamily: theme.font.body, fontSize: 16, color: theme.colors.textSub, marginBottom: 16 },
  heroDivider: { width: 40, height: 1, backgroundColor: theme.colors.border, marginBottom: 16 },
  heroRate: { fontFamily: theme.font.medium, fontSize: 15, color: theme.colors.textSub },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1 },
  statValue: { fontFamily: theme.font.display, fontSize: 32 },
  statLabel: { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' },
  section: {
    marginHorizontal: 16, marginTop: 10, backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg, padding: 18, borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontFamily: theme.font.semibold, fontSize: 15, color: theme.colors.text },
  barRow: { marginBottom: 14 },
  barLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  barName: { fontFamily: theme.font.medium, fontSize: 13, color: theme.colors.textSub, flex: 1 },
  barCount: { fontFamily: theme.font.semibold, fontSize: 14 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, borderWidth: 1 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontFamily: theme.font.medium, fontSize: 13 },
});

const b = StyleSheet.create({
  track: { height: 6, backgroundColor: theme.colors.bgHover, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
