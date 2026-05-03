import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { toast } from '../../src/utils/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleReset() {
    if (!email.trim()) { toast('Digite seu e-mail', 'error'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'ideaverse://auth/reset',
    });
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      setSent(true);
      toast('E-mail de recuperação enviado!');
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.content}>

        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.colors.textSub} strokeWidth={2} />
        </TouchableOpacity>

        <View style={s.iconWrap}>
          <Mail size={40} color={theme.colors.primary} strokeWidth={1.3} />
        </View>

        <Text style={s.title}>Esqueceu a senha?</Text>
        <Text style={s.sub}>
          {sent
            ? 'Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.'
            : 'Digite seu e-mail e enviaremos um link para redefinir sua senha.'}
        </Text>

        {!sent && (
          <>
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

            <TouchableOpacity
              style={[s.sendBtn, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Send size={16} color="#fff" strokeWidth={2} />
                    <Text style={s.sendTxt}>Enviar link</Text>
                  </>}
            </TouchableOpacity>
          </>
        )}

        {sent && (
          <TouchableOpacity style={s.backLoginBtn} onPress={() => router.replace('/auth/login')}>
            <Text style={s.backLoginTxt}>Voltar para o login</Text>
          </TouchableOpacity>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.bg },
  content:      { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  iconWrap:     { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:        { fontFamily: theme.font.display, fontSize: 26, color: theme.colors.text, marginBottom: 12 },
  sub:          { fontFamily: theme.font.body, fontSize: 15, color: theme.colors.textSub, lineHeight: 24, marginBottom: 32 },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.md, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  input:        { flex: 1, paddingVertical: 13, color: theme.colors.text, fontFamily: theme.font.body, fontSize: 15 },
  sendBtn:      { backgroundColor: theme.colors.primary, padding: 15, borderRadius: theme.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  sendTxt:      { fontFamily: theme.font.semibold, fontSize: 16, color: '#fff' },
  backLoginBtn: { backgroundColor: theme.colors.bgCard, padding: 15, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, marginTop: 8 },
  backLoginTxt: { fontFamily: theme.font.semibold, fontSize: 15, color: theme.colors.primary },
});
