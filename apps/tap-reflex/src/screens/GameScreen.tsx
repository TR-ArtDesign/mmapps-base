import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Vibration, StyleSheet, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { evaluateTiming, getDynamicTargetPoint } from '@game/engine/timingEngine';
import { Accuracy } from '@game/types/game.types';
import { getDifficultyParams } from '@game/engine/difficultyEngine';
import { RootStackParamList } from '../navigation/AppNavigator';
import { triggerHaptic } from '@game/feedback/haptics';
import { triggerPerfectFeedback } from '@game/services/feedbackService';

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
    accuracyLabel,
    perfectFlash,
    perfectStreak,
    incrementPerfectStreak,
    resetPerfectStreak,
  } = useGameStore();
  
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  const splashAnim = useRef(new Animated.Value(0)).current;
  const bgFlashAnim = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const perfectShockAnim = useRef(new Animated.Value(0)).current;

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
    // Para PERFECT, deixamos o Label Service (Zustand) cuidar do texto dinâmico (com combo xN)
    // Para as demais precisões, usamos o feedbackText local.
    const text = accuracy === 'PERFECT' ? '' : accuracy;
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
    perfectShockAnim.setValue(0);

    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(perfectShockAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
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

  // Feedback de Level Up
  useEffect(() => {
    if (derivedLevel > 1) {
      levelUpAnim.setValue(0);
      Animated.sequence([
        Animated.spring(levelUpAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(levelUpAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      triggerHaptic('PERFECT'); // Usando um feedback forte para Level Up
    }
  }, [derivedLevel]);

  const handleTap = () => {
    const now = getCurrentTimeBuffer();
    const state = useGameStore.getState();
    
    // STEP 2 & 3: Normalização do progresso
    const elapsed = now - state.startTime;
    const progress = Math.min(Math.max(elapsed / state.roundDuration, 0), 1);

    // STEP 4 & 5: Cálculo do Hit Dinâmico
    const targetPoint = getDynamicTargetPoint(state.derivedLevel);
    const result = evaluateTiming(progress, targetPoint);
    
    // DEBUG VALIDATION
    setDebugInfo({ progress, distance: result.distance, accuracy: result.accuracy });
    console.log(`[DYNAMIC] Progress: ${progress.toFixed(3)} | Target: ${targetPoint.toFixed(3)} | Dist: ${result.distance.toFixed(3)} | Res: ${result.accuracy}`);
    
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

    if (result.accuracy === "PERFECT") {
      incrementPerfectStreak();
      triggerPerfectFeedback();
    } else {
      resetPerfectStreak();
      triggerHaptic(result.accuracy);
    }

    if (result.accuracy === "PERFECT") {
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
    <Pressable style={styles.rootPressable} onPress={handleTap}>
      <Animated.View 
        style={[
          styles.container, 
          { transform: [{ translateX: shakeAnim }] }
        ]}
        pointerEvents="box-none"
      >
        <Animated.View 
          style={[
            styles.bgFlash, 
            { 
              backgroundColor: getColorByAccuracy(lastAccuracy),
              opacity: bgFlashOpacity 
            }
          ]} 
        />

        {__DEV__ && (
          <View style={styles.debugPanel}>
            <Text style={styles.debugText}>
              P: {debugInfo.progress.toFixed(2)} | D: {debugInfo.distance.toFixed(2)} | {debugInfo.accuracy}
            </Text>
          </View>
        )}

        <View style={styles.header} pointerEvents="none">
          <View style={styles.scoreData}>
            <Animated.Text 
              style={[
                styles.scoreLabel, 
                { 
                  transform: [{ 
                    scale: levelUpAnim.interpolate({ 
                      inputRange: [0, 1], 
                      outputRange: [1, 1.4] 
                    }) 
                  }],
                  color: levelUpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#666', '#00FFAA']
                  })
                }
              ]}
            >
              SCORE - LV.{paddedLevel}
            </Animated.Text>
            <Text style={styles.scoreText}>{score}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: derivedProgress * 120 }]}/>
            </View>
          </View>
        </View>

        {combo > 1 && (
          <Animated.View 
            style={[
              styles.comboContainer, 
              { transform: [{ scale: comboAnim }] }
            ]} 
            pointerEvents="none"
          >
            <Text style={[styles.comboText, perfectStreak >= 2 && styles.comboTextPerfect]}>{combo}</Text>
            <Text style={[styles.comboLabel, perfectStreak >= 2 && styles.comboTextPerfect]}>COMBO</Text>
          </Animated.View>
        )}

        <View style={styles.gameArea} pointerEvents="none">
          <View style={styles.targetContainer}>
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

            {/* Onda de choque expansiva para PERFECT */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: 90,
                borderWidth: 2,
                borderColor: '#00FFAA',
                opacity: perfectShockAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: perfectShockAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 5] }) }],
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
        </View>

        <FloatingFeedback 
          text={accuracyLabel || feedbackText} 
          opacity={feedbackOpacity} 
          scale={feedbackScale}
          color={getColorByAccuracy(lastAccuracy)}
        />
      </Animated.View>
    </Pressable>
  );
}

// Pequeno componente local para manter o JSX limpo e restaurar o FloatingFeedback
const FloatingFeedback = ({ text, opacity, scale, color }: any) => {
  const ultraStyle = useGameStore(s => s.ultraStyle);
  const isUltra = text === 'ULTRA!';

  let extraStyles: any = {};
  if (isUltra) {
    switch (ultraStyle) {
      case 'ULTRA_BORDER_LIGHT':
        extraStyles = { borderWidth: 1, borderColor: 'rgba(0, 255, 170, 0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 };
        break;
      case 'ULTRA_BORDER_STRONG':
        extraStyles = { borderWidth: 2, borderColor: 'rgba(0, 255, 170, 0.6)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 };
        break;
      case 'ULTRA_GRADIENT':
        extraStyles = { borderWidth: 2, borderColor: '#00FFAA', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0, 255, 170, 0.08)' };
        break;
      case 'ULTRA_MAX':
        extraStyles = { 
          borderWidth: 2, 
          borderColor: '#00FFAA', 
          paddingHorizontal: 24, 
          paddingVertical: 10, 
          borderRadius: 12, 
          backgroundColor: 'rgba(0, 255, 170, 0.15)',
          shadowColor: '#00FFAA',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
        };
        break;
    }
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: '35%',
          opacity: opacity,
          transform: [{ scale: scale }],
          alignItems: 'center',
          justifyContent: 'center',
        },
        extraStyles
      ]}
    >
      <Text
        style={{
          color: color,
          fontSize: isUltra ? 52 : 42,
          fontWeight: '900',
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadowColor: color,
          textShadowRadius: isUltra ? 20 : 0,
        }}
      >
        {text}
      </Text>
      {text === 'PERFECT' && (
        <View style={{ height: 2, width: 60, backgroundColor: color, marginTop: 5 }} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rootPressable: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  bgFlash: { ...StyleSheet.absoluteFillObject },
  header: { position: 'absolute', top: 60, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreData: { alignItems: 'flex-start' },
  scoreLabel: { color: '#666', fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
  scoreText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  progressBarBg: { height: 4, width: 140, backgroundColor: '#222', marginTop: 8, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00FFAA', shadowColor: '#00FFAA', shadowRadius: 10, shadowOpacity: 0.5 },
  
  debugPanel: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.3)', padding: 2, alignItems: 'center' },
  debugText: { color: '#00FFAA', fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', opacity: 0.5 },

  comboContainer: { position: 'absolute', top: 60, right: 30, alignItems: 'flex-end' },
  comboText: { fontSize: 42, fontWeight: '900', color: '#60a5fa', fontStyle: 'italic', textShadowColor: 'rgba(96, 165, 250, 0.5)', textShadowRadius: 15 },
  comboTextPerfect: { color: '#00FFAA', textShadowColor: 'rgba(0, 255, 170, 0.6)' },
  comboLabel: { fontSize: 10, fontWeight: '900', color: '#60a5fa', letterSpacing: 2, marginTop: -5 },
  
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
