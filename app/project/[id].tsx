import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Animated, Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import {
  ChevronLeft, Pencil, Trash2, Lightbulb, Rocket,
  CheckCircle2, PauseCircle, Calendar, Clock, Images,
} from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useProject } from '../../src/hooks/useProjects';
import { supabase } from '../../src/lib/supabase';
import { Tag, ProjectImage } from '../../src/types';
import { toast } from '../../src/utils/toast';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const STATUS_ICONS: Record<string, any> = {
  ideia:        Lightbulb,
  em_progresso: Rocket,
  concluido:    CheckCircle2,
  pausado:      PauseCircle,
};

const { width, height } = Dimensions.get('window');
const HEADER_H = 280;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project, loading } = useProject(id);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.3, 1], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [HEADER_H - 100, HEADER_H], outputRange: [1, 0], extrapolate: 'clamp' });

  async function handleDelete() {
    Alert.alert('Excluir projeto', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          await supabase.from('projects').delete().eq('id', id);
          toast('Projeto excluído', 'error');
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <Lightbulb size={40} color={theme.colors.primary} strokeWidth={1.3} />
        <Text style={s.loadingTxt}>Carregando...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.loadingTxt}>Projeto não encontrado</Text>
      </View>
    );
  }

  const statusInfo = theme.status[project.status];

  return (
    <View style={s.container}>
      {/* Parallax Header */}
      <Animated.View style={[s.headerImg, { transform: [{ scale: headerScale }] }]}>
        {project.cover_image ? (
          <AnimatedImage source={{ uri: project.cover_image }} style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]} resizeMode="cover" />
        ) : (
          <View style={[s.headerEmpty, { backgroundColor: statusInfo.bg }]}>
            {React.createElement(STATUS_ICONS[project.status], { size: 56, color: statusInfo.color, strokeWidth: 1.3 })}
            <View style={s.headerGlow} />
          </View>
        )}
        <View style={s.headerOverlay} />
      </Animated.View>

      {/* Back + Actions */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.topActions}>
          <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/project/edit/${id}`)}>
            <Pencil size={16} color={theme.colors.textSub} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { borderColor: theme.colors.error + '50' }]} onPress={handleDelete}>
            <Trash2 size={16} color={theme.colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_H - 20, paddingBottom: 60 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.content}>
          {/* Title block */}
          <View style={s.titleBlock}>
            <View style={[s.badge, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
              <Text style={[s.badgeTxt, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
            <Text style={s.title}>{project.title}</Text>

            {project.tags?.length > 0 && (
              <View style={s.tags}>
                {project.tags.map((tag: Tag) => (
                  <View key={tag.id} style={[s.tag, { backgroundColor: tag.color + '20', borderColor: tag.color + '50' }]}>
                    <View style={[s.tagDot, { backgroundColor: tag.color }]} />
                    <Text style={[s.tagTxt, { color: tag.color }]}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.dates}>
              <View style={s.dateRow}>
                <Calendar size={11} color={theme.colors.textMuted} strokeWidth={2} />
                <Text style={s.dateTxt}>{new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
              </View>
              <View style={s.dateRow}>
                <Clock size={11} color={theme.colors.textMuted} strokeWidth={2} />
                <Text style={s.dateTxt}>Atualizado {new Date(project.updated_at).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {!!project.description && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Descrição</Text>
              <Markdown style={mdStyles}>{project.description}</Markdown>
            </View>
          )}

          {!project.description && (
            <View style={s.emptyDesc}>
              <Text style={s.emptyDescTxt}>Sem descrição. Edite para adicionar.</Text>
            </View>
          )}

          {/* Gallery */}
          {project.images?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Galeria ({project.images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                {project.images.map((img: ProjectImage) => (
                  <Image key={img.id} source={{ uri: img.url }} style={s.galleryImg} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const mdStyles: any = {
  body: { color: theme.colors.textSub, fontFamily: theme.font.body, fontSize: 15, lineHeight: 26 },
  heading1: { color: theme.colors.text, fontFamily: theme.font.display, fontSize: 22, marginTop: 20, marginBottom: 8 },
  heading2: { color: theme.colors.text, fontFamily: theme.font.semibold, fontSize: 18, marginTop: 16, marginBottom: 6 },
  heading3: { color: theme.colors.text, fontFamily: theme.font.semibold, fontSize: 16, marginTop: 12, marginBottom: 4 },
  code_inline: { backgroundColor: theme.colors.bgElevated, color: theme.colors.cyan, borderRadius: 4, paddingHorizontal: 6, fontFamily: 'monospace' },
  fence: { backgroundColor: theme.colors.bgElevated, borderRadius: 10, padding: 14, marginVertical: 8 },
  blockquote: { backgroundColor: theme.colors.primaryGlow, borderLeftColor: theme.colors.primary, borderLeftWidth: 3, paddingLeft: 14, paddingVertical: 4, borderRadius: 4, marginVertical: 8 },
  link: { color: theme.colors.primary },
  hr: { backgroundColor: theme.colors.border, marginVertical: 16 },
  list_item: { color: theme.colors.textSub },
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingTxt: { fontFamily: theme.font.body, fontSize: 16, color: theme.colors.textSub, marginTop: 12 },
  headerImg: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_H, overflow: 'hidden' },
  headerEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#6C63FF20' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,16,0.4)' },
  topBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,8,16,0.7)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  topActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,8,16,0.7)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  content: { backgroundColor: theme.colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: height, padding: 20 },
  titleBlock: { marginBottom: 20 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, borderWidth: 1, marginBottom: 12 },
  badgeTxt: { fontFamily: theme.font.medium, fontSize: 12 },
  title: { fontFamily: theme.font.display, fontSize: 28, color: theme.colors.text, lineHeight: 36, marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, borderWidth: 1 },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  tagTxt: { fontFamily: theme.font.medium, fontSize: 12 },
  dates: { gap: 5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateTxt: { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textMuted },
  section: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontFamily: theme.font.semibold, fontSize: 15, color: theme.colors.text },
  emptyDesc: { padding: 20, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginBottom: 20 },
  emptyDescTxt: { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted },
  galleryImg: { width: width * 0.65, height: 180, borderRadius: theme.radius.lg, resizeMode: 'cover' },
});
