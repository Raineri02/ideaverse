import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, Animated,
} from 'react-native';
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useTags } from '../../src/hooks/useProjects';
import { supabase } from '../../src/lib/supabase';
import { Tag } from '../../src/types';
import { toast } from '../../src/utils/toast';

const COLORS = [
  '#6C63FF','#00D4FF','#FF6B9D','#FFB547',
  '#00E5A0','#FF4D6A','#A78BFA','#34D399',
  '#FBBF24','#60A5FA','#F472B6','#FB923C',
];

function TagRow({ tag, onDelete }: { tag: Tag; onDelete: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 70, friction: 12, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.row, { transform: [{ scale }] }]}>
      <View style={[s.rowLeft, { backgroundColor: tag.color + '15', borderColor: tag.color + '40' }]}>
        <View style={[s.dot, { backgroundColor: tag.color }]} />
        <Text style={[s.tagName, { color: tag.color }]}>{tag.name}</Text>
      </View>
      <TouchableOpacity style={s.deleteBtn} onPress={() => Alert.alert('Excluir tag', `Excluir "${tag.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: onDelete }])}>
        <Trash2 size={16} color={theme.colors.error} strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TagsScreen() {
  const { tags, refetch } = useTags();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('tags').insert({ name: name.trim(), color });
    setSaving(false);
    if (!error) {
      toast('Tag criada! 🏷️');
      setName(''); setColor(COLORS[0]); setModal(false); refetch();
    } else {
      toast(error.message, 'error');
    }
  }

  async function deleteTag(tag: Tag) {
    await supabase.from('tags').delete().eq('id', tag.id);
    toast(`Tag "${tag.name}" removida`, 'error');
    refetch();
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Tags</Text>
          <Text style={s.sub}>{tags.length} categorias</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Plus size={14} color="#fff" strokeWidth={2.5} />
          <Text style={s.addBtnTxt}>Nova Tag</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tags}
        keyExtractor={(t: Tag) => t.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        renderItem={({ item }: { item: Tag }) => (
          <TagRow tag={item} onDelete={() => deleteTag(item)} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <TagIcon size={40} color={theme.colors.primary} strokeWidth={1.3} />
            </View>
            <Text style={s.emptyTitle}>Sem tags ainda</Text>
            <Text style={s.emptySub}>Crie tags para organizar seus projetos</Text>
          </View>
        }
      />

      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Nova Tag</Text>

            <TextInput
              style={s.input}
              placeholder="Nome da tag..."
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            {/* Preview */}
            {!!name && (
              <View style={[s.preview, { backgroundColor: color + '20', borderColor: color + '50' }]}>
                <View style={[s.dot, { backgroundColor: color }]} />
                <Text style={[s.tagName, { color }]}>{name}</Text>
              </View>
            )}

            <Text style={s.colorLabel}>Cor</Text>
            <View style={s.colorGrid}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorBtn, { backgroundColor: c }, color === c && s.colorBtnActive]}
                  onPress={() => setColor(c)}
                >
                  {color === c && <Text style={{ fontSize: 12 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.actions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(false)}>
                <Text style={s.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={create} disabled={saving}>
                <Text style={s.saveTxt}>{saving ? 'Criando...' : 'Criar Tag'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 58, paddingBottom: 16 },
  title: { fontFamily: theme.font.display, fontSize: 30, color: theme.colors.text },
  sub: { fontFamily: theme.font.body, fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.radius.full, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  addBtnTxt: { fontFamily: theme.font.semibold, fontSize: 14, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: theme.radius.md, borderWidth: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tagName: { fontFamily: theme.font.medium, fontSize: 15 },
  deleteBtn: { padding: 12, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIconWrap: { padding: 20, borderRadius: theme.radius.full, backgroundColor: theme.colors.primaryGlow, marginBottom: 4 },
  emptyTitle: { fontFamily: theme.font.semibold, fontSize: 18, color: theme.colors.text },
  emptySub: { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textSub, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: theme.font.display, fontSize: 22, color: theme.colors.text, marginBottom: 16 },
  input: { backgroundColor: theme.colors.bg, borderRadius: theme.radius.md, padding: 14, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 16 },
  colorLabel: { fontFamily: theme.font.medium, fontSize: 13, color: theme.colors.textSub, marginBottom: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  colorBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  colorBtnActive: { borderWidth: 3, borderColor: '#fff' },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  cancelTxt: { fontFamily: theme.font.medium, fontSize: 15, color: theme.colors.textSub },
  saveBtn: { flex: 1, padding: 14, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  saveTxt: { fontFamily: theme.font.semibold, fontSize: 15, color: '#fff' },
});
