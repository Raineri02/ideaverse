import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Plus, ImageIcon, Lightbulb, Rocket, CheckCircle2, PauseCircle } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useTags } from '../../src/hooks/useProjects';
import { supabase, uploadImage } from '../../src/lib/supabase';
import { Tag, ProjectStatus } from '../../src/types';
import { toast } from '../../src/utils/toast';

const STATUSES: { value: ProjectStatus; label: string; Icon: any }[] = [
  { value: 'ideia',        label: 'Ideia',        Icon: Lightbulb },
  { value: 'em_progresso', label: 'Em Progresso', Icon: Rocket },
  { value: 'concluido',    label: 'Concluído',    Icon: CheckCircle2 },
  { value: 'pausado',      label: 'Pausado',      Icon: PauseCircle },
];

export default function NewProjectScreen() {
  const { tags } = useTags();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ideia');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cover, setCover] = useState<{ uri: string; base64?: string } | null>(null);
  const [extras, setExtras] = useState<{ uri: string; base64?: string }[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleTag(id: string) {
    Haptics.selectionAsync();
    setSelectedTags((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);
  }

  async function pickCover() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: true });
    if (!r.canceled) setCover(r.assets[0]);
  }

  async function pickExtra() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
    if (!r.canceled) setExtras((p) => [...p, r.assets[0]]);
  }

  async function handleSave() {
    if (!title.trim()) { toast('O título é obrigatório', 'error'); return; }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Get current user for user-scoped storage paths
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) { toast('Sessão expirada. Faça login novamente.', 'error'); return; }

      let coverUrl: string | null = null;
      if (cover?.base64) {
        coverUrl = await uploadImage(cover.base64, `${userId}/covers/${Date.now()}.jpg`);
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({ title: title.trim(), description, status, cover_image: coverUrl })
        .select().single();
      if (error || !project) throw error ?? new Error('Falha ao criar projeto');

      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from('project_tags').insert(
          selectedTags.map((tag_id) => ({ project_id: project.id, tag_id }))
        );
        if (tagError) console.warn('Tags não salvas:', tagError.message);
      }

      for (let i = 0; i < extras.length; i++) {
        const img = extras[i];
        if (img.base64) {
          const url = await uploadImage(img.base64, `${userId}/projects/${project.id}/${Date.now()}-${i}.jpg`);
          if (url) await supabase.from('project_images').insert({ project_id: project.id, url, order: i });
        }
      }

      toast('Projeto criado!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/project/${project.id}`);
    } catch (e: any) {
      const msg = e?.message?.includes('fetch') || e?.message?.includes('network')
        ? 'Sem conexão. Verifique sua internet.'
        : e?.message || 'Erro ao salvar projeto';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.container}>
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View>
          <Text style={s.label}>Título do projeto *</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: App de finanças pessoais..."
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Status */}
        <View>
          <Text style={s.label}>Status</Text>
          <View style={s.statusRow}>
            {STATUSES.map((opt) => {
              const active = status === opt.value;
              const info = theme.status[opt.value];
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.statusBtn, active && { backgroundColor: info.bg, borderColor: info.color }]}
                  onPress={() => { Haptics.selectionAsync(); setStatus(opt.value); }}
                >
                  <opt.Icon size={13} color={active ? info.color : theme.colors.textSub} strokeWidth={2} />
                  <Text style={[s.statusTxt, active && { color: info.color }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View>
            <Text style={s.label}>Tags</Text>
            <View style={s.tagsWrap}>
              {tags.map((tag: Tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[s.tagChip, active && { backgroundColor: tag.color + '20', borderColor: tag.color }]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <View style={[s.tagDot, { backgroundColor: tag.color }]} />
                    <Text style={[s.tagTxt, active && { color: tag.color }]}>{tag.name}</Text>
                    {active && <Text style={{ color: tag.color, fontSize: 12 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Cover */}
        <View>
          <Text style={s.label}>Imagem de Capa</Text>
          <TouchableOpacity style={s.coverPicker} onPress={pickCover}>
            {cover ? (
              <Image source={{ uri: cover.uri }} style={s.coverImg} />
            ) : (
              <View style={s.coverEmpty}>
                <ImageIcon size={36} color={theme.colors.textMuted} strokeWidth={1.3} />
                <Text style={s.coverHint}>Toque para adicionar capa</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View>
          <Text style={s.label}>Descrição <Text style={s.labelHint}>(suporta Markdown)</Text></Text>
          <TextInput
            style={[s.input, s.descInput]}
            placeholder={`# Meu Projeto\n\n## Sobre\nDescreva sua ideia aqui...\n\n## Tecnologias\n- React Native\n\n## Próximos Passos\n- [ ] Tarefa 1`}
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Extra images */}
        <View>
          <Text style={s.label}>Galeria de Imagens</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {extras.map((img, i) => (
              <Image key={i} source={{ uri: img.uri }} style={s.thumb} />
            ))}
            <TouchableOpacity style={s.addThumb} onPress={pickExtra}>
              <Text style={{ fontSize: 28, color: theme.colors.textMuted }}>+</Text>
              <Text style={s.addThumbTxt}>Foto</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Rocket size={16} color="#fff" strokeWidth={2} />
              <Text style={s.saveTxt}>Criar Projeto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  label: { fontFamily: theme.font.semibold, fontSize: 14, color: theme.colors.text, marginBottom: 10 },
  labelHint: { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textMuted },
  input: { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.md, padding: 14, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15, borderWidth: 1, borderColor: theme.colors.border },
  descInput: { minHeight: 220, lineHeight: 22 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.bgCard },
  statusTxt: { fontFamily: theme.font.medium, fontSize: 13, color: theme.colors.textSub },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.bgCard },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagTxt: { fontFamily: theme.font.body, fontSize: 13, color: theme.colors.textSub },
  coverPicker: { borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  coverEmpty: { height: 150, backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center', gap: 8 },
  coverHint: { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted },
  coverImg: { width: '100%', height: 180, resizeMode: 'cover' },
  thumb: { width: 90, height: 90, borderRadius: theme.radius.md },
  addThumb: { width: 90, height: 90, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center', gap: 2 },
  addThumbTxt: { fontFamily: theme.font.body, fontSize: 11, color: theme.colors.textMuted },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 34, backgroundColor: theme.colors.bg, borderTopWidth: 1, borderTopColor: theme.colors.border },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  saveTxt: { fontFamily: theme.font.semibold, fontSize: 16, color: '#fff' },
});
