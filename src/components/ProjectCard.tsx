import React, { useRef, useEffect } from 'react';
import {
  Animated, TouchableOpacity, View, Text, Image,
  StyleSheet, PanResponder, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Lightbulb, Rocket, CheckCircle2, PauseCircle, Trash2 } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { ProjectWithRelations, Tag } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';

const STATUS_ICONS: Record<string, any> = {
  ideia:        Lightbulb,
  em_progresso: Rocket,
  concluido:    CheckCircle2,
  pausado:      PauseCircle,
};

interface Props {
  project: ProjectWithRelations;
  index: number;
  onDeleted: () => void;
  viewMode: 'list' | 'grid';
}

export function ProjectCard({ project, index, onDeleted, viewMode }: Props) {
  const entrance = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const statusInfo = theme.status[project.status];

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      delay: index * 60,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
    onPanResponderMove: (_, g) => {
      if (g.dx < 0) swipeX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -80) {
        Alert.alert('Excluir projeto', `Excluir "${project.title}"?`, [
          {
            text: 'Cancelar', style: 'cancel',
            onPress: () => Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start(),
          },
          {
            text: 'Excluir', style: 'destructive', onPress: async () => {
              Animated.timing(entrance, { toValue: 0, duration: 250, useNativeDriver: true }).start(async () => {
                await supabase.from('projects').delete().eq('id', project.id);
                toast('Projeto excluído', 'error');
                onDeleted();
              });
            },
          },
        ], { onDismiss: () => Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start() });
      } else {
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const handlePressIn = () =>
    Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  const handlePressOut = () =>
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();

  if (viewMode === 'grid') {
    return (
      <Animated.View
        style={[
          s.gridCard,
          {
            opacity: entrance,
            transform: [
              { scale: Animated.multiply(cardScale, entrance.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })) },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push(`/project/${project.id}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {project.cover_image ? (
            <Image source={{ uri: project.cover_image }} style={s.gridCover} />
          ) : (
            <View style={[s.gridCoverEmpty, { backgroundColor: statusInfo.bg }]}>
              {React.createElement(STATUS_ICONS[project.status], { size: 28, color: statusInfo.color, strokeWidth: 1.5 })}
            </View>
          )}
          <View style={s.gridBody}>
            <Text style={s.gridTitle} numberOfLines={2}>{project.title}</Text>
            <View style={[s.statusDot, { backgroundColor: statusInfo.color }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={s.swipeWrapper}>
      {/* Delete hint behind card */}
      <View style={s.deleteHint}>
        <Trash2 size={16} color={theme.colors.error} strokeWidth={2} />
        <Text style={s.deleteHintText}>Excluir</Text>
      </View>
      <Animated.View
        style={[
          s.cardWrapper,
          { transform: [{ translateX: swipeX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={{
            opacity: entrance,
            transform: [
              { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
              { scale: cardScale },
            ],
          }}
        >
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.95}
            onPress={() => router.push(`/project/${project.id}`)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {project.cover_image && (
              <Image source={{ uri: project.cover_image }} style={s.cover} />
            )}
            {!project.cover_image && (
              <View style={[s.coverEmpty, { backgroundColor: statusInfo.bg }]}>
                {React.createElement(STATUS_ICONS[project.status], { size: 32, color: statusInfo.color, strokeWidth: 1.5 })}
                <View style={s.coverGlow} />
              </View>
            )}
            <View style={s.body}>
              <View style={s.topRow}>
                <Text style={s.title} numberOfLines={1}>{project.title}</Text>
                <View style={[s.badge, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
                  {React.createElement(STATUS_ICONS[project.status], { size: 10, color: statusInfo.color, strokeWidth: 2.5 })}
                  <Text style={[s.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
              {!!project.description && (
                <Text style={s.desc} numberOfLines={2}>
                  {project.description.replace(/[#*`>\-\[\]]/g, '').trim()}
                </Text>
              )}
              {project.tags?.length > 0 && (
                <View style={s.tags}>
                  {project.tags.slice(0, 4).map((tag: Tag) => (
                    <View key={tag.id} style={[s.tag, { backgroundColor: tag.color + '20' }]}>
                      <View style={[s.tagDot, { backgroundColor: tag.color }]} />
                      <Text style={[s.tagText, { color: tag.color }]}>{tag.name}</Text>
                    </View>
                  ))}
                  {project.tags.length > 4 && (
                    <Text style={s.tagMore}>+{project.tags.length - 4}</Text>
                  )}
                </View>
              )}
              <Text style={s.date}>
                Atualizado {new Date(project.updated_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  swipeWrapper: { position: 'relative' },
  deleteHint: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, paddingRight: 8,
  },
  deleteHintText: { color: theme.colors.error, fontFamily: theme.font.medium, fontSize: 13 },
  cardWrapper: {},
  card: {
    backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  cover: { width: '100%', height: 170, resizeMode: 'cover' },
  coverEmpty: {
    height: 90, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  coverGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#6C63FF20' },
  body: { padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: theme.font.semibold, fontSize: 16, color: theme.colors.text, flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.full, borderWidth: 1, flexShrink: 0 },
  badgeText: { fontFamily: theme.font.medium, fontSize: 11 },
  desc: { fontFamily: theme.font.body, fontSize: 13, color: theme.colors.textSub, lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  tagText: { fontFamily: theme.font.medium, fontSize: 11 },
  tagMore: { fontFamily: theme.font.body, fontSize: 11, color: theme.colors.textMuted, alignSelf: 'center' },
  date: { fontFamily: theme.font.body, fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },

  // Grid
  gridCard: {
    flex: 1, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  gridCover: { width: '100%', height: 120, resizeMode: 'cover' },
  gridCoverEmpty: { height: 100, alignItems: 'center', justifyContent: 'center' },
  gridBody: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  gridTitle: { fontFamily: theme.font.semibold, fontSize: 13, color: theme.colors.text, flex: 1, marginRight: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
});
