import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { IdeaverseLogo } from '../../src/components/IdeaverseLogo';
import { toast } from '../../src/utils/toast';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      toast('Preencha e-mail e senha', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : error.message,
        'error',
      );
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoArea}>
          <IdeaverseLogo size={90} />
          <Text style={s.appName}>Ideaverse</Text>
          <Text style={s.tagline}>Seu universo de ideias</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Entrar</Text>

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
                placeholder="Sua senha"
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

          {/* Forgot */}
          <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/auth/forgot')}>
            <Text style={s.forgotTxt}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[s.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <LogIn size={18} color="#fff" strokeWidth={2} />
                  <Text style={s.loginTxt}>Entrar</Text>
                </>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerTxt}>ou</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Register */}
          <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/auth/register')}>
            <Text style={s.registerTxt}>
              Não tem conta? <Text style={{ color: theme.colors.primary }}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  logoArea:  { alignItems: 'center', marginBottom: 36 },
  appName:   { fontFamily: theme.font.display, fontSize: 32, color: theme.colors.text, marginTop: 16 },
  tagline:   { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { fontFamily: theme.font.display, fontSize: 24, color: theme.colors.text, marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label:     { fontFamily: theme.font.semibold, fontSize: 13, color: theme.colors.textSub, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.bg, borderRadius: theme.radius.md,
    paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.border,
  },
  input:  { flex: 1, paddingVertical: 13, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotTxt: { fontFamily: theme.font.medium, fontSize: 13, color: theme.colors.primary },
  loginBtn: {
    backgroundColor: theme.colors.primary, padding: 15, borderRadius: theme.radius.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  loginTxt:    { fontFamily: theme.font.semibold, fontSize: 16, color: '#fff' },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerTxt:  { fontFamily: theme.font.body, fontSize: 13, color: theme.colors.textMuted },
  registerBtn: { alignItems: 'center' },
  registerTxt: { fontFamily: theme.font.medium, fontSize: 14, color: theme.colors.textSub },
});
