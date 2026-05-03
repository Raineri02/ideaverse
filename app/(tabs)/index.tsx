import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Animated, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search, X, Plus, LayoutGrid, List,
  Lightbulb, Rocket, CheckCircle2, PauseCircle,
  Globe, ArrowUpDown, Inbox, WifiOff, RefreshCw,
} from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useProjects, useTags } from '../../src/hooks/useProjects';
import { ProjectCard } from '../../src/components/ProjectCard';
import { ProjectCardSkeleton } from '../../src/components/Skeleton';
import { Tag, ProjectStatus } from '../../src/types';

type SortBy = 'updated' | 'created' | 'title';

const STATUS_FILTERS: { label: string; value: ProjectStatus | null; Icon: any }[] = [
  { label: 'Todos',     value: null,           Icon: Globe },
  { label: 'Ideia',     value: 'ideia',        Icon: Lightbulb },
  { label: 'Progresso', value: 'em_progresso', Icon: Rocket },
  { label: 'Concluído', value: 'concluido',    Icon: CheckCircle2 },
  { label: 'Pausado',   value: 'pausado',      Icon: PauseCircle },
];

export default function HomeScreen() {
  const [search, setSearch]               = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [selectedTag, setSelectedTag]     = useState<string | undefined>();
  const [viewMode, setViewMode]           = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy]               = useState<SortBy>('updated');
  const headerAnim                        = useRef(new Animated.Value(1)).current;

  const { projects, loading, refetch } = useProjects(selectedTag, selectedStatus, search);
  const { tags }                       = useTags();

  const sorted = [...projects].sort((a, b) => {
    if (sortBy === 'title')   return a.title.localeCompare(b.title);
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const toggleView = () => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setViewMode((v) => (v === 'list' ? 'grid' : 'list'));
  };

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <ProjectCard project={item} index={index} onDeleted={refetch} viewMode={viewMode} />
    ),
    [viewMode, refetch],
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>Ideaverse</Text>
          <Text style={s.tagline}>
            {loading ? 'Carregando...' : `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconBtn} onPress={toggleView}>
            {viewMode === 'list'
              ? <LayoutGrid size={18} color={theme.colors.textSub} strokeWidth={1.8} />
              : <List       size={18} color={theme.colors.textSub} strokeWidth={1.8} />}
          </TouchableOpacity>
          <TouchableOpacity style={s.newBtn} onPress={() => router.push('/project/new')}>
            <Plus size={15} color="#fff" strokeWidth={2.5} />
            <Text style={s.newBtnText}>Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search size={15} color={theme.colors.textMuted} strokeWidth={1.8} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar projetos, tags..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={15} color={theme.colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {STATUS_FILTERS.map((f) => {
          const active = selectedStatus === f.value;
          const info   = f.value ? theme.status[f.value] : null;
          const color  = active ? (info?.color ?? theme.colors.primary) : theme.colors.textSub;
          return (
            <TouchableOpacity
              key={f.label}
              style={[s.filterChip, active && { backgroundColor: info?.bg ?? theme.colors.primaryGlow, borderColor: info?.color ?? theme.colors.primary }]}
              onPress={() => setSelectedStatus(f.value)}
            >
              <f.Icon size={12} color={color} strokeWidth={2} />
              <Text style={[s.filterChipText, { color }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tagScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity style={[s.tagChip, !selectedTag && s.tagChipActive]} onPress={() => setSelectedTag(undefined)}>
            <Text style={[s.tagChipText, !selectedTag && { color: theme.colors.primary }]}>Todas</Text>
          </TouchableOpacity>
          {tags.map((tag: Tag) => {
            const active = selectedTag === tag.id;
            return (
              <TouchableOpacity
                key={tag.id}
                style={[s.tagChip, active && { borderColor: tag.color, backgroundColor: tag.color + '20' }]}
                onPress={() => setSelectedTag(active ? undefined : tag.id)}
              >
                <View style={[s.tagDot, { backgroundColor: tag.color }]} />
                <Text style={[s.tagChipText, active && { color: tag.color }]}>{tag.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Sort */}
      <View style={s.sortRow}>
        <ArrowUpDown size={12} color={theme.colors.textMuted} strokeWidth={1.8} />
        {(['updated', 'created', 'title'] as SortBy[]).map((sortVal) => (
          <TouchableOpacity
            key={sortVal}
            style={[s.sortBtn, sortBy === sortVal && s.sortBtnActive]}
            onPress={() => setSortBy(sortVal)}
          >
            <Text style={[s.sortBtnText, sortBy === sortVal && { color: theme.colors.primary }]}>
              {sortVal === 'updated' ? 'Recente' : sortVal === 'created' ? 'Criação' : 'Nome'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 110 }}
          columnWrapperStyle={viewMode === 'grid' ? { gap: 12 } : undefined}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={theme.colors.primary} />}
          renderItem={renderItem}
          ListEmptyComponent={
            error
              ? <ErrorState message={error} onRetry={refetch} />
              : <EmptyState hasSearch={!!search || !!selectedTag || !!selectedStatus} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={s.empty}>
      <View style={[s.emptyIconWrap, { backgroundColor: theme.colors.error + '20' }]}>
        <WifiOff size={48} color={theme.colors.error} strokeWidth={1.2} />
      </View>
      <Text style={s.emptyTitle}>Ops, algo deu errado</Text>
      <Text style={s.emptySub}>{message}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
        <RefreshCw size={14} color="#fff" strokeWidth={2} />
        <Text style={s.retryTxt}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={s.empty}>
      <Animated.View style={[s.emptyIconWrap, { transform: [{ scale: pulse }] }]}>
        {hasSearch
          ? <Search size={48} color={theme.colors.primary} strokeWidth={1.2} />
          : <Inbox  size={48} color={theme.colors.primary} strokeWidth={1.2} />}
      </Animated.View>
      <Text style={s.emptyTitle}>{hasSearch ? 'Nenhum resultado' : 'Seu universo está vazio'}</Text>
      <Text style={s.emptySub}>
        {hasSearch ? 'Tente outros termos ou filtros' : 'Toque em "Novo" para criar sua primeira ideia'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: theme.colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 58, paddingBottom: 14 },
  brand:         { fontFamily: theme.font.display, fontSize: 30, color: theme.colors.text },
  tagline:       { fontFamily: theme.font.body, fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:       { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  newBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.radius.full, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  newBtnText:    { fontFamily: theme.font.semibold, fontSize: 14, color: '#fff' },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.md, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.border },
  searchInput:   { flex: 1, paddingVertical: 12, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15 },
  filterScroll:  { marginBottom: 10 },
  filterChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: theme.radius.full, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border },
  filterChipText:{ fontFamily: theme.font.medium, fontSize: 12, color: theme.colors.textSub },
  tagScroll:     { marginBottom: 10 },
  tagChip:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border },
  tagChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryGlow },
  tagChipText:   { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textSub },
  tagDot:        { width: 6, height: 6, borderRadius: 3 },
  sortRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 6 },
  sortBtn:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  sortBtnActive: { backgroundColor: theme.colors.primaryGlow },
  sortBtnText:   { fontFamily: theme.font.medium, fontSize: 12, color: theme.colors.textMuted },
  empty:         { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIconWrap: { marginBottom: 20, padding: 20, borderRadius: theme.radius.full, backgroundColor: theme.colors.primaryGlow },
  emptyTitle:    { fontFamily: theme.font.semibold, fontSize: 20, color: theme.colors.text, marginBottom: 10, textAlign: 'center' },
  retryBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: theme.colors.error, paddingHorizontal: 20, paddingVertical: 10, borderRadius: theme.radius.full },
  retryTxt:      { fontFamily: theme.font.semibold, fontSize: 14, color: '#fff' },
  emptySub:      { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textSub, textAlign: 'center', lineHeight: 22 },
});
