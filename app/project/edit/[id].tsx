import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Lightbulb, Rocket, CheckCircle2, PauseCircle, ImageIcon, Save } from 'lucide-react-native';
import { theme } from '../../../src/lib/theme';
import { useTags, useProject } from '../../../src/hooks/useProjects';
import { supabase, uploadImage } from '../../../src/lib/supabase';
import { Tag, ProjectStatus } from '../../../src/types';
import { toast } from '../../../src/utils/toast';

const STATUSES: { value: ProjectStatus; label: string; Icon: any }[] = [
  { value: 'ideia', label: 'Ideia', Icon: Lightbulb },
  { value: 'em_progresso', label: 'Em Progresso', Icon: Rocket },
  { value: 'concluido', label: 'Concluído', Icon: CheckCircle2 },
  { value: 'pausado', label: 'Pausado', Icon: PauseCircle },
];

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project } = useProject(id);
  const { tags } = useTags();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ideia');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cover, setCover] = useState<{ uri: string; base64?: string; isNew?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setStatus(project.status);
      setSelectedTags(project.tags?.map((t: Tag) => t.id) || []);
      if (project.cover_image) setCover({ uri: project.cover_image });
    }
  }, [project]);

  function toggleTag(id: string) {
    Haptics.selectionAsync();
    setSelectedTags((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);
  }

  async function pickCover() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: true });
    if (!r.canceled) setCover({ ...r.assets[0], isNew: true });
  }

  async function handleSave() {
    if (!title.trim()) { toast('O título é obrigatório', 'error'); return; }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) { toast('Sessão expirada. Faça login novamente.', 'error'); return; }

      let coverUrl = project?.cover_image || null;
      if (cover?.isNew && cover.base64) {
        coverUrl = await uploadImage(cover.base64, `${userId}/covers/${Date.now()}.jpg`);
      }

      const { error } = await supabase
        .from('projects')
        .update({ title: title.trim(), description, status, cover_image: coverUrl })
        .eq('id', id);
      if (error) throw error;

      await supabase.from('project_tags').delete().eq('project_id', id);
      if (selectedTags.length > 0) {
        await supabase.from('project_tags').insert(
          selectedTags.map((tag_id) => ({ project_id: id, tag_id }))
        );
      }

      toast('Projeto atualizado!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      const msg = e?.message?.includes('fetch') || e?.message?.includes('network')
        ? 'Sem conexão. Verifique sua internet.'
        : e?.message || 'Erro ao salvar';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View>
          <Text style={s.label}>Título *</Text>
          <TextInput style={s.input} value={title} onChangeText={setTitle} placeholderTextColor={theme.colors.textMuted} placeholder="Título do projeto..." />
        </View>

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
                  
                  <Text style={[s.statusTxt, active && { color: info.color }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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

        <View>
          <Text style={s.label}>Descrição <Text style={s.labelHint}>(Markdown)</Text></Text>
          <TextInput
            style={[s.input, s.descInput]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholder="Descreva seu projeto..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Save size={16} color="#fff" strokeWidth={2} /><Text style={s.saveTxt}>Salvar Alterações</Text></>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 34, backgroundColor: theme.colors.bg, borderTopWidth: 1, borderTopColor: theme.colors.border },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.radius.md, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  saveTxt: { fontFamily: theme.font.semibold, fontSize: 16, color: '#fff' },
});
