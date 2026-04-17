import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { useGameStore } from '@game/state/useGameStore';
import { theme } from '../theme/theme';

type Variant = 'game' | 'home';

const Star = ({ isAnimated, delay, duration, size, x, y, energy }: any) => {
  // ... (rest of the Star component same as before)
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAnimated) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        })
      ])
    );

    const timeout = setTimeout(() => {
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      loop.stop();
    };
  }, [animValue, duration, delay, isAnimated]);

  const baseOpacity = isAnimated
    ? animValue.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.08] })
    : new Animated.Value(0.03);

  const starOpacity = Animated.add(
    baseOpacity,
    energy.interpolate({ inputRange: [0, 0.25], outputRange: [0, 0.05] })
  );

  const translateY = isAnimated
    ? animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -3] })
    : 0;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: y,
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        opacity: starOpacity,
        transform: [{ translateY }]
      }}
    />
  );
};

export function Background({ variant = 'game' }: { variant?: Variant }) {
  const { lastAccuracy, combo, perfectStreak } = useGameStore((s) => ({
    lastAccuracy: s.lastAccuracy,
    combo: s.combo,
    perfectStreak: s.perfectStreak
  }));

  const reactiveOpacity = useRef(new Animated.Value(0)).current;
  const energy = useRef(new Animated.Value(0)).current;
  const currentEnergy = useRef(0);

  useEffect(() => {
    const id = energy.addListener(({ value }) => {
      currentEnergy.current = value;
    });
    return () => energy.removeListener(id);
  }, [energy]);

  const triggerPulse = () => {
    reactiveOpacity.setValue(0);
    const isUltra = perfectStreak >= 5;

    Animated.sequence([
      Animated.timing(reactiveOpacity, {
        toValue: isUltra ? 0.16 : 0.12,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(reactiveOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const increaseEnergy = () => {
    energy.stopAnimation();
    Animated.timing(energy, {
      toValue: Math.min(currentEnergy.current + 0.08, 0.25),
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (lastAccuracy === 'PERFECT') {
      triggerPulse();
    }
    const isUltra = perfectStreak >= 5;
    if (isUltra && lastAccuracy === 'PERFECT') {
      increaseEnergy();
    }
  }, [lastAccuracy, combo]);

  useEffect(() => {
    const decay = setInterval(() => {
      if (currentEnergy.current > 0) {
        energy.setValue(Math.max(currentEnergy.current - 0.01, 0));
      }
    }, 200);

    return () => clearInterval(decay);
  }, [energy]);

  const starsArray = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const numStars = variant === 'home' ? 25 : 15;
    const numAnimated = variant === 'home' ? 8 : 5;

    const elements = [];
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() > 0.8 ? 2 : 1;
      const isAnimated = i < numAnimated;
      const duration = 4000 + Math.random() * 4000;
      const delay = Math.random() * 2000;

      elements.push(
        <Star key={i} isAnimated={isAnimated} delay={delay} duration={duration} size={size} x={x} y={y} energy={energy} />
      );
    }
    return elements;
  }, [variant, energy]);

  const glow = useRef(new Animated.Value(0)).current;
  const currentGlow = useRef(0);

  useEffect(() => {
    const id = glow.addListener(({ value }) => {
      currentGlow.current = value;
    });
    return () => glow.removeListener(id);
  }, [glow]);

  useEffect(() => {
    const isUltra = perfectStreak >= 5;
    if (isUltra && lastAccuracy === 'PERFECT') {
      glow.stopAnimation();
      Animated.timing(glow, {
        toValue: Math.min(currentGlow.current + 0.1, 1),
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [perfectStreak, lastAccuracy]);

  useEffect(() => {
    const decay = setInterval(() => {
      if (currentGlow.current > 0) {
        glow.setValue(Math.max(currentGlow.current - 0.015, 0));
      }
    }, 200);
    return () => clearInterval(decay);
  }, [glow]);

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });

  const scaleAnim = useRef(new Animated.Value(1.1)).current;

  useEffect(() => {
    const zoomLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.25,
          duration: 25000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 25000,
          useNativeDriver: true,
        }),
      ])
    );
    
    zoomLoop.start();
    return () => zoomLoop.stop();
  }, [scaleAnim]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 1. Base Image Layer */}
      <Animated.Image
        source={require('../assets/images/start-bg.jpg')}
        style={[
          styles.particleImage,
          { 
            opacity: 0.2,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      />

      {/* 2. Reactive Inner Glow */}
      <Animated.View 
        style={[
          styles.innerGlow, 
          { opacity: glowOpacity }
        ]} 
      />

      {/* 3. Dark Overlay (Transparent as per user pref) */}
      <View style={styles.overlay} />

      {/* 3. Dynamic Layers */}
      <View style={styles.gradient} />
      {starsArray}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.energyLayer,
          { opacity: energy.interpolate({ inputRange: [0, 0.25], outputRange: [0, 0.15] }) },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.reactiveLayer,
          { opacity: reactiveOpacity },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    zIndex: -1,
    overflow: 'hidden',
  },
  particleImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  innerGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,136,0.15)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  reactiveLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  energyLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.perfect,
  }
});
