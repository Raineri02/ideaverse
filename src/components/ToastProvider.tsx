import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { registerToast } from '../utils/toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastMsg { id: number; msg: string; type: ToastType; }

const TOAST_ICONS: Record<ToastType, any> = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const counter = useRef(0);

  const show = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => { registerToast(show); }, [show]);

  return (
    <View style={s.container} pointerEvents="none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </View>
  );
}

function ToastItem({ toast }: { toast: ToastMsg }) {
  const anim = useRef(new Animated.Value(0)).current;
  const colors: Record<ToastType, string> = {
    success: theme.colors.emerald,
    error:   theme.colors.error,
    info:    theme.colors.cyan,
  };
  const IconComponent = TOAST_ICONS[toast.type];

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.delay(2200),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.toast,
        { borderLeftColor: colors[toast.type] },
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
      ]}
    >
      <IconComponent size={16} color={colors[toast.type]} strokeWidth={2} />
      <Text style={s.msg}>{toast.msg}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 9999, gap: 8 },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md, padding: 14,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
  },
  msg: { fontFamily: theme.font.medium, fontSize: 14, color: theme.colors.text, flex: 1 },
});
