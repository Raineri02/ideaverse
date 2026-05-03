import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch,
} from 'react-native';
import { router } from 'expo-router';
import {
  LogOut, User, Mail, Shield, ChevronRight,
  Bell, Moon, Info, Pencil,
} from 'lucide-react-native';
import { theme } from '../../src/lib/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useStats } from '../../src/hooks/useProjects';
import { IdeaverseLogo } from '../../src/components/IdeaverseLogo';
import { toast } from '../../src/utils/toast';

function SettingRow({ Icon, label, value, onPress, danger, toggle, toggleValue, onToggle }: any) {
  return (
    <TouchableOpacity style={[s.settingRow, danger && { borderColor: theme.colors.error + '30' }]} onPress={onPress} disabled={!!toggle}>
      <View style={[s.settingIcon, danger && { backgroundColor: theme.colors.error + '15' }]}>
        <Icon size={18} color={danger ? theme.colors.error : theme.colors.textSub} strokeWidth={1.8} />
      </View>
      <View style={s.settingContent}>
        <Text style={[s.settingLabel, danger && { color: theme.colors.error }]}>{label}</Text>
        {value && <Text style={s.settingValue}>{value}</Text>}
      </View>
      {toggle
        ? <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ true: theme.colors.primary }} thumbColor="#fff" />
        : <ChevronRight size={16} color={theme.colors.textMuted} strokeWidth={1.8} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const stats = useStats();
  const [notifications, setNotifications] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          await signOut();
          toast('Até logo! 👋');
        },
      },
    ]);
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Perfil</Text>
      </View>

      {/* Avatar + Info */}
      <View style={s.profileCard}>
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.avatarLogo}>
            <IdeaverseLogo size={28} />
          </View>
        </View>
        <Text style={s.displayName}>{displayName}</Text>
        <Text style={s.emailTxt}>{user?.email}</Text>

        {/* Mini stats */}
        <View style={s.miniStats}>
          <View style={s.miniStat}>
            <Text style={[s.miniStatVal, { color: theme.colors.primary }]}>{stats.total}</Text>
            <Text style={s.miniStatLbl}>Projetos</Text>
          </View>
          <View style={s.miniStatDivider} />
          <View style={s.miniStat}>
            <Text style={[s.miniStatVal, { color: theme.colors.emerald }]}>{stats.concluido}</Text>
            <Text style={s.miniStatLbl}>Concluídos</Text>
          </View>
          <View style={s.miniStatDivider} />
          <View style={s.miniStat}>
            <Text style={[s.miniStatVal, { color: theme.colors.amber }]}>{stats.em_progresso}</Text>
            <Text style={s.miniStatLbl}>Em progresso</Text>
          </View>
        </View>
      </View>

      {/* Account section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Conta</Text>
        <View style={s.settingsCard}>
          <SettingRow Icon={User}   label="Nome"   value={displayName} onPress={() => router.push('/profile/edit')} />
          <SettingRow Icon={Mail}   label="E-mail" value={user?.email} onPress={() => router.push('/profile/edit')} />
          <SettingRow Icon={Shield} label="Senha"  value="Alterar senha" onPress={() => router.push('/profile/edit')} />
        </View>
      </View>

      {/* Preferences */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Preferências</Text>
        <View style={s.settingsCard}>
          <SettingRow
            Icon={Bell} label="Notificações"
            toggle toggleValue={notifications}
            onToggle={setNotifications}
          />
          <SettingRow Icon={Moon} label="Tema escuro" toggle toggleValue={true} onToggle={() => {}} />
        </View>
      </View>

      {/* About */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Sobre</Text>
        <View style={s.settingsCard}>
          <SettingRow Icon={Info} label="Versão" value="2.1.0" onPress={() => {}} />
        </View>
      </View>

      {/* Logout */}
      <View style={s.section}>
        <View style={s.settingsCard}>
          <SettingRow Icon={LogOut} label="Sair da conta" onPress={handleSignOut} danger />
        </View>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.colors.bg },
  header:         { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 16 },
  title:          { fontFamily: theme.font.display, fontSize: 30, color: theme.colors.text },
  profileCard:    { marginHorizontal: 16, backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.xl, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderGlow, marginBottom: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  avatarWrap:     { position: 'relative', marginBottom: 14 },
  avatar:         { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryGlow, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontFamily: theme.font.display, fontSize: 28, color: theme.colors.primary },
  avatarLogo:     { position: 'absolute', bottom: -4, right: -4, borderRadius: 14, overflow: 'hidden' },
  displayName:    { fontFamily: theme.font.display, fontSize: 22, color: theme.colors.text, marginBottom: 4 },
  emailTxt:       { fontFamily: theme.font.body, fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  miniStats:      { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around' },
  miniStat:       { alignItems: 'center', flex: 1 },
  miniStatVal:    { fontFamily: theme.font.display, fontSize: 24 },
  miniStatLbl:    { fontFamily: theme.font.body, fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  miniStatDivider:{ width: 1, height: 32, backgroundColor: theme.colors.border },
  section:        { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle:   { fontFamily: theme.font.semibold, fontSize: 13, color: theme.colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  settingsCard:   { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  settingRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  settingIcon:    { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.bgHover, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingLabel:   { fontFamily: theme.font.medium, fontSize: 15, color: theme.colors.text },
  settingValue:   { fontFamily: theme.font.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
