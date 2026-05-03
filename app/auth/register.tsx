import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { IdeaverseLogo } from '../../src/components/IdeaverseLogo';
import { toast } from '../../src/utils/toast';

export default function RegisterScreen() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      toast('Preencha todos os campos', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);

    if (error) {
      toast(
        error.message === 'User already registered'
          ? 'Este e-mail já está cadastrado'
          : error.message,
        'error',
      );
    } else {
      toast('Conta criada! Verifique seu e-mail ✉️');
      router.replace('/auth/login');
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoArea}>
          <IdeaverseLogo size={72} />
          <Text style={s.appName}>Criar conta</Text>
          <Text style={s.tagline}>Junte-se ao Ideaverse</Text>
        </View>

        {/* Card */}
        <View style={s.card}>

          {/* Name */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Nome</Text>
            <View style={s.inputRow}>
              <User size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
              <TextInput
                style={s.input}
                placeholder="Seu nome"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                keyboardAppearance="dark"
              />
            </View>
          </View>

          {/* Email */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>E-mail</Text>
            <View style={s.inputRow}>
              <Mail size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
              <TextInput
                style={s.input}
                placeholder="seu@email.com"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                keyboardAppearance="dark"
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Senha</Text>
            <View style={s.inputRow}>
              <Lock size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
              <TextInput
                style={s.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                keyboardAppearance="dark"
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                {showPwd
                  ? <EyeOff size={16} color={theme.colors.textMuted} strokeWidth={1.8} />
                  : <Eye    size={16} color={theme.colors.textMuted} strokeWidth={1.8} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[s.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <UserPlus size={18} color="#fff" strokeWidth={2} />
                  <Text style={s.registerTxt}>Criar conta</Text>
                </>}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity style={s.loginLink} onPress={() => router.back()}>
            <Text style={s.loginLinkTxt}>
              Já tem conta? <Text style={{ color: theme.colors.primary }}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.bg },
  scroll:      { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  logoArea:    { alignItems: 'center', marginBottom: 32 },
  appName:     { fontFamily: theme.font.display, fontSize: 28, color: theme.colors.text, marginTop: 14 },
  tagline:     { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  card:        { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: 24, borderWidth: 1, borderColor: theme.colors.border },
  fieldWrap:   { marginBottom: 16 },
  label:       { fontFamily: theme.font.semibold, fontSize: 13, color: theme.colors.textSub, marginBottom: 8 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.bg, borderRadius: theme.radius.md, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.border },
  input:       { flex: 1, paddingVertical: 13, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15 },
  registerBtn: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: theme.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  registerTxt: { fontFamily: theme.font.semibold, fontSize: 16, color: '#fff' },
  loginLink:   { alignItems: 'center', marginTop: 20 },
  loginLinkTxt:{ fontFamily: theme.font.medium, fontSize: 14, color: theme.colors.textSub },
});
