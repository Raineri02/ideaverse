import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { User, Lock, Eye, EyeOff, ChevronLeft, Save } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { toast } from '../../src/utils/toast';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName]         = useState(user?.user_metadata?.full_name || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [savingName, setSavingName]   = useState(false);
  const [savingPwd, setSavingPwd]     = useState(false);

  async function handleSaveName() {
    if (!name.trim()) { toast('O nome não pode ser vazio', 'error'); return; }
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSavingName(false);
    if (error) { toast(error.message, 'error'); }
    else { toast('Nome atualizado!'); router.back(); }
  }

  async function handleSavePassword() {
    if (!newPwd || newPwd.length < 6) {
      toast('Nova senha deve ter pelo menos 6 caracteres', 'error'); return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) { toast(error.message, 'error'); }
    else { toast('Senha atualizada!'); setCurrentPwd(''); setNewPwd(''); }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color={theme.colors.textSub} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={s.title}>Editar Perfil</Text>
        </View>

        {/* Name section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>NOME</Text>
          <View style={s.card}>
            <View style={s.inputRow}>
              <User size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={theme.colors.textMuted}
                keyboardAppearance="dark"
              />
            </View>
            <TouchableOpacity
              style={[s.saveBtn, savingName && { opacity: 0.6 }]}
              onPress={handleSaveName}
              disabled={savingName}
            >
              {savingName
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Save size={14} color="#fff" strokeWidth={2} />
                    <Text style={s.saveTxt}>Salvar nome</Text>
                  </>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Email (read-only) */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>E-MAIL</Text>
          <View style={s.card}>
            <View style={[s.inputRow, { opacity: 0.5 }]}>
              <TextInput
                style={s.input}
                value={user?.email}
                editable={false}
                placeholderTextColor={theme.colors.textMuted}
                keyboardAppearance="dark"
              />
            </View>
            <Text style={s.hint}>O e-mail não pode ser alterado</Text>
          </View>
        </View>

        {/* Password section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SENHA</Text>
          <View style={s.card}>
            <View style={s.inputRow}>
              <Lock size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
              <TextInput
                style={s.input}
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="Nova senha (mín. 6 caracteres)"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showNew}
                keyboardAppearance="dark"
              />
              <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                {showNew
                  ? <EyeOff size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
                  : <Eye    size={16} color={theme.colors.textMuted} strokeWidth={1.8} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[s.saveBtn, savingPwd && { opacity: 0.6 }]}
              onPress={handleSavePassword}
              disabled={savingPwd}
            >
              {savingPwd
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Save size={14} color="#fff" strokeWidth={2} />
                    <Text style={s.saveTxt}>Atualizar senha</Text>
                  </>}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.bg },
  scroll:       { padding: 20, gap: 0, paddingBottom: 60 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28, marginTop: 12 },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  title:        { fontFamily: theme.font.display, fontSize: 22, color: theme.colors.text },
  section:      { marginBottom: 20 },
  sectionTitle: { fontFamily: theme.font.semibold, fontSize: 11, color: theme.colors.textMuted, marginBottom: 10, letterSpacing: 1.5 },
  card:         { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 12 },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.bg, borderRadius: theme.radius.md, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border },
  input:        { flex: 1, paddingVertical: 12, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15 },
  saveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.primary, padding: 12, borderRadius: theme.radius.md, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  saveTxt:      { fontFamily: theme.font.semibold, fontSize: 14, color: '#fff' },
  hint:         { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textMuted },
});
