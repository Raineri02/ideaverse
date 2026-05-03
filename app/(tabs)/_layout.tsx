import { Tabs, router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Layers, Tag, BarChart2, UserCircle2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { theme } from '../../src/lib/theme';
import { useAuth } from '../../src/hooks/useAuth';

function TabIcon({ Icon, focused }: { Icon: any; focused: boolean }) {
  return (
    <View style={[s.icon, focused && s.iconActive]}>
      <Icon size={22} color={focused ? theme.colors.primary : theme.colors.textMuted} strokeWidth={focused ? 2.2 : 1.8} />
      {focused && <View style={s.dot} />}
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.replace('/auth/login');
  }, [session, loading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index"   options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Layers}      focused={focused} /> }} />
      <Tabs.Screen name="tags"    options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Tag}         focused={focused} /> }} />
      <Tabs.Screen name="stats"   options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart2}   focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={UserCircle2} focused={focused} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  icon:       { alignItems: 'center', gap: 4, padding: 4, borderRadius: theme.radius.md },
  iconActive: { backgroundColor: theme.colors.primaryGlow },
  dot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.primary },
});
