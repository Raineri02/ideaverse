import React, { useRef, useEffect } from 'react';
import Svg, {
  Circle, Path, Defs, LinearGradient, RadialGradient,
  Stop, G, Animated as SvgAnimated,
} from 'react-native-svg';
import { Animated } from 'react-native';

interface Props { size?: number; animate?: boolean; }

const AnimatedCircle = SvgAnimated.createAnimatedComponent(Circle);

export function IdeaverseLogo({ size = 80, animate = false }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const spinReverse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 20000, useNativeDriver: true }),
    ).start();
    Animated.loop(
      Animated.timing(spinReverse, { toValue: 1, duration: 12000, useNativeDriver: true }),
    ).start();
  }, [animate]);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r  = s / 2;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#2A1F6E" />
          <Stop offset="100%" stopColor="#080810" />
        </RadialGradient>
        <RadialGradient id="glowGrad" cx="50%" cy="40%" r="50%">
          <Stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="letterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%"   stopColor="#6C63FF" />
          <Stop offset="100%" stopColor="#00D4FF" />
        </LinearGradient>
      </Defs>

      {/* BG */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#bgGrad)" />
      <Circle cx={cx} cy={cy * 0.85} r={r * 0.76} fill="url(#glowGrad)" />

      {/* Outer orbit ring */}
      <Circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke="#6C63FF" strokeWidth={s * 0.012} strokeOpacity={0.35} />
      {/* Orbit dot top */}
      <Circle cx={cx} cy={cy - r * 0.92} r={s * 0.032} fill="#6C63FF" />

      {/* Inner orbit ring */}
      <Circle cx={cx} cy={cy} r={r * 0.68} fill="none" stroke="#00D4FF" strokeWidth={s * 0.008} strokeOpacity={0.25} strokeDasharray={`${s * 0.08} ${s * 0.06}`} />
      {/* Orbit dot bottom */}
      <Circle cx={cx} cy={cy + r * 0.68} r={s * 0.022} fill="#00D4FF" />

      {/* Star dots */}
      <Circle cx={cx * 0.42} cy={cy * 0.52} r={s * 0.018} fill="#00D4FF" fillOpacity={0.85} />
      <Circle cx={cx * 1.64} cy={cy * 0.38} r={s * 0.013} fill="#6C63FF" fillOpacity={0.8} />
      <Circle cx={cx * 1.72} cy={cy * 1.56} r={s * 0.018} fill="#00D4FF" fillOpacity={0.6} />
      <Circle cx={cx * 0.30} cy={cy * 1.62} r={s * 0.013} fill="#6C63FF" fillOpacity={0.7} />
      <Circle cx={cx * 0.70} cy={cy * 0.30} r={s * 0.013} fill="#00E5A0" fillOpacity={0.7} />
      <Circle cx={cx * 1.48} cy={cy * 1.72} r={s * 0.015} fill="#00E5A0" fillOpacity={0.55} />

      {/* Core circle */}
      <Circle
        cx={cx} cy={cy} r={r * 0.44}
        fill="#0F0A2A"
        stroke="#6C63FF"
        strokeWidth={s * 0.014}
        strokeOpacity={0.6}
      />

      {/* Letter I */}
      <G>
        {/* Top bar */}
        <Path
          d={`M${cx - s * 0.10} ${cy - s * 0.17} L${cx + s * 0.10} ${cy - s * 0.17}`}
          stroke="url(#letterGrad)" strokeWidth={s * 0.055} strokeLinecap="round"
        />
        {/* Stem */}
        <Path
          d={`M${cx} ${cy - s * 0.17} L${cx} ${cy + s * 0.10}`}
          stroke="url(#letterGrad)" strokeWidth={s * 0.045} strokeLinecap="round"
        />
        {/* Bottom bar */}
        <Path
          d={`M${cx - s * 0.10} ${cy + s * 0.10} L${cx + s * 0.10} ${cy + s * 0.10}`}
          stroke="url(#letterGrad)" strokeWidth={s * 0.055} strokeLinecap="round"
        />
        {/* Shine */}
        <Path
          d={`M${cx - s * 0.04} ${cy - s * 0.14} L${cx + s * 0.02} ${cy - s * 0.08}`}
          stroke="white" strokeWidth={s * 0.018} strokeLinecap="round" strokeOpacity={0.35}
        />
      </G>
    </Svg>
  );
}

export function IdeaVerseLogoSmall({ size = 32 }: { size?: number }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r  = s / 2;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <RadialGradient id="bgS" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#2A1F6E" />
          <Stop offset="100%" stopColor="#0F0F1A" />
        </RadialGradient>
        <LinearGradient id="lgS" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%"   stopColor="#6C63FF" />
          <Stop offset="100%" stopColor="#00D4FF" />
        </LinearGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#bgS)" />
      <Circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke="#6C63FF" strokeWidth={2} strokeOpacity={0.5} />
      <Circle cx={cx} cy={cy - r * 0.92} r={s * 0.09} fill="#6C63FF" />
      <Circle cx={cx} cy={cy} r={r * 0.44} fill="#0F0A2A" stroke="#6C63FF" strokeWidth={1.5} strokeOpacity={0.5} />
      <Path d={`M${cx - s*0.10} ${cy-s*0.17} L${cx+s*0.10} ${cy-s*0.17}`} stroke="url(#lgS)" strokeWidth={s*0.055} strokeLinecap="round" />
      <Path d={`M${cx} ${cy-s*0.17} L${cx} ${cy+s*0.10}`} stroke="url(#lgS)" strokeWidth={s*0.045} strokeLinecap="round" />
      <Path d={`M${cx-s*0.10} ${cy+s*0.10} L${cx+s*0.10} ${cy+s*0.10}`} stroke="url(#lgS)" strokeWidth={s*0.055} strokeLinecap="round" />
    </Svg>
  );
}

