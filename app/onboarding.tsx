import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, FlatList, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Lightbulb, FolderKanban, Sparkles } from 'lucide-react-native';
import { theme } from '../src/lib/theme';
import { IdeaverseLogo } from '../src/components/IdeaverseLogo';
import { markOnboardingSeen } from '../src/utils/onboarding';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    Icon: IdeaverseLogo,
    isLogo: true,
    title: 'Bem-vindo ao\nIdeaverse',
    subtitle: 'Seu universo pessoal de ideias e projetos. Tudo organizado, sempre acessível.',
    color: theme.colors.primary,
    bg: '#0F0A2A',
  },
  {
    key: '2',
    Icon: Lightbulb,
    isLogo: false,
    title: 'Capture cada\nideia',
    subtitle: 'Nunca perca uma boa ideia. Documente projetos com descrições ricas em Markdown, fotos e tags.',
    color: theme.colors.cyan,
    bg: '#0A1A2A',
  },
  {
    key: '3',
    Icon: FolderKanban,
    isLogo: false,
    title: 'Organize e\nacompanhe',
    subtitle: 'Filtre por status, categorize com tags coloridas e acompanhe seu progresso no dashboard.',
    color: theme.colors.emerald,
    bg: '#0A2A1A',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const progressAnim = useRef(SLIDES.map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    animateProgress(0);
  }, []);

  function animateProgress(index: number) {
    progressAnim.forEach((a, i) => {
      Animated.timing(a, {
        toValue: i <= index ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }

  function goNext() {
    if (current < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const next = current + 1;
      setCurrent(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      animateProgress(next);
    } else {
      finishOnboarding();
    }
  }

  async function finishOnboarding() {
    await markOnboardingSeen();
    router.replace('/auth/login');
  }

  function onScroll(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== current) {
      setCurrent(idx);
      animateProgress(idx);
    }
  }

  const slide = SLIDES[current];

  return (
    <View style={[s.container, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* Skip */}
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={s.skipBtn} onPress={finishOnboarding}>
          <Text style={s.skipTxt}>Pular</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Animated.View style={[s.slide, { opacity: item.key === slide.key ? fadeAnim : 1 }]}>
            {/* Icon area */}
            <View style={[s.iconWrap, { backgroundColor: item.color + '18' }]}>
              {item.isLogo ? (
                <IdeaverseLogo size={110} />
              ) : (
                <item.Icon size={72} color={item.color} strokeWidth={1.2} />
              )}
              {/* Glow ring */}
              <View style={[s.glowRing, { borderColor: item.color + '40' }]} />
            </View>

            {/* Text */}
            <View style={s.textBlock}>
              <Text style={[s.title, { color: item.color }]}>{item.title}</Text>
              <Text style={s.subtitle}>{item.subtitle}</Text>
            </View>
          </Animated.View>
        )}
      />

      {/* Bottom area */}
      <View style={s.bottom}>
        {/* Progress dots */}
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                s.dot,
                {
                  backgroundColor: slide.color,
                  width: progressAnim[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
                  opacity: progressAnim[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: slide.color }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={s.ctaTxt}>
            {current === SLIDES.length - 1 ? 'Começar agora' : 'Próximo'}
          </Text>
          {current === SLIDES.length - 1 && (
            <Sparkles size={16} color="#fff" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  skipTxt: { fontFamily: theme.font.medium, fontSize: 14, color: theme.colors.textSub },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 200,
  },
  iconWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
  },
  textBlock: { alignItems: 'center' },
  title: {
    fontFamily: theme.font.display,
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: theme.font.body,
    fontSize: 16,
    color: theme.colors.textSub,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 24,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  ctaBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaTxt: { fontFamily: theme.font.semibold, fontSize: 17, color: '#fff' },
});
