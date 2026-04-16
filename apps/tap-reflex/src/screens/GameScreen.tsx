import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Vibration, StyleSheet, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { evaluateTiming } from '@game/engine/timingEngine';
import { Accuracy } from '@game/types/game.types';
import { getDifficultyParams } from '@game/engine/difficultyEngine';
import { RootStackParamList } from '../navigation/AppNavigator';
import { triggerHaptic } from '@game/feedback/haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
};

const TARGET_SIZE = 180;

// Utilizando performance.now() para precisão máxima
const getCurrentTimeBuffer = () => performance.now();

export default function GameScreen({ navigation }: Props) {
  const { 
    score, 
    combo, 
    lastAccuracy, 
    roundDuration,
    startTime,
    setTargetRound, 
    registerHit, 
    derivedLevel, 
    derivedProgress,
  } = useGameStore();
  
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  const splashAnim = useRef(new Animated.Value(0)).current;
  const bgFlashAnim = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(0)).current;

  // PARTICLES
  const particles = useRef([...Array(8)].map(() => ({
    pos: new Animated.ValueXY({ x: 0, y: 0 }),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(1),
  }))).current;

  const loopTimeoutRef = useRef<any>(null);

  // VISUAL REFS
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const idlePulse = useRef(new Animated.Value(1)).current;

  const [feedbackText, setFeedbackText] = useState('');
  const [btnColor, setBtnColor] = useState('transparent');
  const [debugInfo, setDebugInfo] = useState({ progress: 0, distance: 0, accuracy: '' });

  const paddedLevel = derivedLevel < 10 ? `0${derivedLevel}` : derivedLevel;

  function getColorByAccuracy(accuracy: Accuracy | null) {
    switch (accuracy) {
      case 'PERFECT': return '#00FFAA';
      case 'GOOD': return '#FFD166';
      case 'ALMOST': return '#FF8C42';
      case 'MISS': return '#FF4D4D';
      default: return '#FFFFFF';
    }
  }

  const scheduleNext = () => {
    const currentScore = useGameStore.getState().score;
    const { speed, randomness } = getDifficultyParams(currentScore);

    const variation = 1 + (Math.random() * randomness * 2 - randomness);
    const nextDelay = speed * variation;

    const now = getCurrentTimeBuffer();
    const nextTarget = now + nextDelay;
    
    // Resetar estado da rodada na store
    useGameStore.getState().setTargetRound(nextTarget, nextDelay, now);

    // Resetar animação
    pulseAnim.setValue(0);
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: nextDelay,
      easing: (v) => v,
      useNativeDriver: true,
    }).start();

    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);

    loopTimeoutRef.current = setTimeout(() => {
      scheduleNext();
    }, nextDelay);
  };

  function triggerVisualFeedback(accuracy: Accuracy) {
    let text = accuracy;
    setFeedbackText(text);

    feedbackScale.setValue(0.5);
    feedbackOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(feedbackScale, {
        toValue: accuracy === 'PERFECT' ? 1.6 : 1.2,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function triggerGlow(accuracy: Accuracy) {
    if (accuracy !== 'PERFECT') return;
    glowAnim.setValue(0);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function triggerParticles() {
    particles.forEach((p, i) => {
      p.pos.setValue({ x: 0, y: 0 });
      p.opacity.setValue(1);
      p.scale.setValue(Math.random() * 0.5 + 0.5);

      const angle = (i / particles.length) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 80 + Math.random() * 40;

      Animated.parallel([
        Animated.timing(p.pos, {
          toValue: {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
          },
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  useEffect(() => {
    scheduleNext();

    const idleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(idlePulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(idlePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    idleLoop.start();

    return () => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      idleLoop.stop();
    };
  }, []);

  const handleTap = () => {
    const now = getCurrentTimeBuffer();
    const state = useGameStore.getState();
    
    // STEP 2 & 3: Normalização do progresso
    const elapsed = now - state.startTime;
    const progress = Math.min(Math.max(elapsed / state.roundDuration, 0), 1);

    // STEP 4 & 5: Cálculo do Hit Dinâmico
    const result = evaluateTiming(progress, state.derivedLevel);
    
    // DEBUG VALIDATION
    setDebugInfo({ progress, distance: result.distance, accuracy: result.accuracy });
    console.log(`[DYNAMIC] Progress: ${progress.toFixed(3)} | Target: ${result.targetPoint.toFixed(3)} | Dist: ${result.distance.toFixed(3)} | Res: ${result.accuracy}`);
    
    registerHit(result);
    setBtnColor(getColorByAccuracy(result.accuracy));

    triggerVisualFeedback(result.accuracy);
    triggerGlow(result.accuracy);

    if (result.accuracy === 'PERFECT' || result.accuracy === 'GOOD') {
      triggerParticles();
    }

    splashAnim.setValue(0);
    Animated.timing(splashAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    triggerHaptic(result.accuracy);

    if (result.accuracy === "PERFECT") {
      bgFlashAnim.setValue(0);
      Animated.sequence([
        Animated.timing(bgFlashAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(bgFlashAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 20, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 20, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 20, useNativeDriver: true })
      ]).start();
      
      Animated.sequence([
        Animated.timing(comboAnim, { toValue: 1.5, duration: 40, useNativeDriver: true }),
        Animated.spring(comboAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
      ]).start();
    }

    if (result.accuracy === "MISS") {
      setTimeout(() => navigation.replace("Result"), 250);
    } else {
      setTimeout(() => setBtnColor('transparent'), 150);
    }
  };

  const indicatorScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6.0, 1]
  });

  const splashScale = splashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3.5]
  });

  const splashOpacity = splashAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.6, 0]
  });

  const bgFlashOpacity = bgFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4]
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      <Animated.View 
        style={[
          styles.bgFlash, 
          { 
            backgroundColor: getColorByAccuracy(lastAccuracy),
            opacity: bgFlashOpacity 
          }
        ]} 
      />

      <View style={styles.header}>
        <View style={styles.scoreData}>
          <Text style={styles.scoreLabel}>SCORE - LV.{paddedLevel}</Text>
          <Text style={styles.scoreText}>{score}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: derivedProgress * 120 }]}/>
          </View>
        </View>

        {__DEV__ && (
          <View style={styles.debugPanel}>
            <Text style={styles.debugText}>PROG: {debugInfo.progress.toFixed(2)}</Text>
            <Text style={styles.debugText}>DIST: {debugInfo.distance.toFixed(2)}</Text>
            <Text style={styles.debugTextSub}>RES: {debugInfo.accuracy}</Text>
          </View>
        )}
      </View>

      {combo > 1 && (
        <Animated.View style={[styles.comboContainer, { transform: [{ scale: comboAnim }] }]}>
          <Text style={styles.comboText}>{combo}</Text>
          <Text style={styles.comboLabel}>COMBO</Text>
        </Animated.View>
      )}

      <View style={styles.gameArea}>
        <View style={styles.targetContainer} pointerEvents="none">
          <View style={[styles.targetZone, styles.zoneMiss]} />
          <View style={[styles.targetZone, styles.zoneAlmost]} />
          <View style={[styles.targetZone, styles.zoneGood]} />
          <View style={[styles.targetZone, styles.zonePerfect]} />

          <Animated.View 
            style={[
              styles.indicator, 
              { 
                transform: [{ scale: indicatorScale }],
                borderColor: getColorByAccuracy(lastAccuracy),
                opacity: pulseAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] })
              }
            ]} 
          />

          <Animated.View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: '#00FFAA',
              opacity: glowAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.8, 0] }),
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
            }}
          />

          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#00FFAA',
                opacity: p.opacity,
                transform: [
                  { translateX: p.pos.x },
                  { translateY: p.pos.y },
                  { scale: p.scale }
                ],
              }}
            />
          ))}

          <Animated.View 
            style={[
              styles.splashRing, 
              { 
                transform: [{ scale: splashScale }], 
                borderColor: btnColor === 'transparent' ? '#fff' : btnColor,
                opacity: splashOpacity 
              }
            ]} 
          />
        </View>

        <Pressable 
          onPress={handleTap} 
          style={[StyleSheet.absoluteFill, { zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}
        >
          <View style={{ width: 1, height: 1 }} />
        </Pressable>
      </View>

      <FloatingFeedback 
        text={feedbackText} 
        opacity={feedbackOpacity} 
        scale={feedbackScale}
        color={getColorByAccuracy(lastAccuracy)}
      />
    </Animated.View>
  );
}

// Pequeno componente local para manter o JSX limpo e restaurar o FloatingFeedback
const FloatingFeedback = ({ text, opacity, scale, color }: any) => (
  <Animated.Text
    style={{
      position: 'absolute',
      top: '35%',
      color: color,
      fontSize: 42,
      fontWeight: 'bold',
      opacity: opacity,
      transform: [{ scale: scale }],
      textAlign: 'center',
      textTransform: 'uppercase',
    }}
  >
    {text}
  </Animated.Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#000' },
  bgFlash: { ...StyleSheet.absoluteFillObject },
  header: { position: 'absolute', top: 60, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreData: { alignItems: 'flex-start' },
  scoreLabel: { color: '#666', fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
  scoreText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  progressBarBg: { height: 4, width: 140, backgroundColor: '#222', marginTop: 8, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00FFAA', shadowColor: '#00FFAA', shadowRadius: 10, shadowOpacity: 0.5 },
  
  debugPanel: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 5, borderRadius: 5, borderWidth: 1, borderColor: '#333' },
  debugText: { color: '#00FFAA', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  debugTextSub: { color: '#fff', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  comboContainer: { position: 'absolute', top: 140, alignItems: 'center' },
  comboText: { fontSize: 64, fontWeight: '900', color: '#60a5fa', fontStyle: 'italic', textShadowColor: 'rgba(96, 165, 250, 0.5)', textShadowRadius: 15 },
  comboLabel: { fontSize: 18, fontWeight: '900', color: '#60a5fa', letterSpacing: 4, marginTop: -10 },
  
  gameArea: { width: 350, height: 350, justifyContent: 'center', alignItems: 'center' },
  targetContainer: { width: TARGET_SIZE, height: TARGET_SIZE, justifyContent: 'center', alignItems: 'center' },
  
  targetZone: { position: 'absolute', borderRadius: 1000 },
  zoneMiss: { width: 180, height: 180, backgroundColor: 'rgba(255, 77, 77, 0.15)' },
  zoneAlmost: { width: 130, height: 130, backgroundColor: 'rgba(255, 140, 66, 0.18)' },
  zoneGood: { width: 90, height: 90, backgroundColor: 'rgba(255, 209, 102, 0.22)' },
  zonePerfect: { width: 30, height: 30, backgroundColor: '#00FFAA' },

  indicator: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 3, shadowColor: '#fff', shadowRadius: 10, shadowOpacity: 0.8 },
  splashRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 4 },
});
