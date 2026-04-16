import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { evaluateTiming, getDynamicTargetPoint } from '@game/engine/timingEngine';
import { Accuracy } from '@game/types/game.types';
import { getDifficultyParams } from '@game/engine/difficultyEngine';
import { RootStackParamList } from '../navigation/AppNavigator';
import { triggerHaptic } from '@game/feedback/haptics';
import { triggerPerfectFeedback } from '@game/services/feedbackService';
import { theme } from '../theme/theme';
import { typography } from '../theme/typography';
import { baseStyles } from '../theme/styles';
import { UltraText } from '../components/UltraText';
import { Background } from '../components/Background';

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
  const comboAnim = useRef(new Animated.Value(1)).current; // Keep for score pulse if needed, or remove
  const scoreScaleAnim = useRef(new Animated.Value(1)).current;
  const comboOpacityAnim = useRef(new Animated.Value(0.5)).current;
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
      case 'PERFECT': return theme.colors.perfect;
      case 'GOOD': return theme.colors.good;
      case 'ALMOST': return theme.colors.almost;
      case 'MISS': return theme.colors.miss;
      default: return theme.colors.textPrimary;
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
    const text = accuracy === 'PERFECT' ? '' : accuracy;
    setFeedbackText(text);

    feedbackScale.setValue(1);
    feedbackOpacity.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(feedbackScale, {
          toValue: 1.08,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackScale, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 200,
        delay: accuracy === 'PERFECT' ? 200 : 100,
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

  useEffect(() => {
    Animated.timing(comboOpacityAnim, {
      toValue: combo > 1 ? 1 : 0.5,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [combo > 1]);

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

    if (result.accuracy !== 'MISS') {
      scoreScaleAnim.setValue(1);
      Animated.sequence([
        Animated.timing(scoreScaleAnim, { toValue: 1.05, duration: 30, useNativeDriver: true }),
        Animated.timing(scoreScaleAnim, { toValue: 1, duration: 30, useNativeDriver: true })
      ]).start();
    }

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
      
      // Removed combo scale animation as requested: "NO scale animation"
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
    <SafeAreaView style={{ flex: 1 }}>
      <Background variant="game" />
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

          <View style={styles.hudContainer} pointerEvents="none">
            <View style={styles.scoreData}>
              <Animated.Text style={styles.scoreLabel}>
                SCORE - LV.{paddedLevel}
              </Animated.Text>
              <Animated.Text style={[styles.scoreText, { transform: [{ scale: scoreScaleAnim }] }]}>{score}</Animated.Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: derivedProgress * 120 }]}/>
              </View>
            </View>

            {combo > 1 && (
              <Animated.View style={[styles.comboData, { opacity: comboOpacityAnim }]}>
                <Text style={[styles.comboLabel, { color: theme.colors.perfect }]}>COMBO</Text>
                <Text style={[styles.comboText, { color: theme.colors.perfect }]}>{combo}</Text>
              </Animated.View>
            )}
          </View>

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
                backgroundColor: theme.colors.perfect,
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
                borderColor: theme.colors.perfect,
                opacity: perfectShockAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: perfectShockAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 5] }) }],
              }}
            />

            {particles.map((p, i) => (
              <React.Fragment key={i}>
                {/* Green Base Particle */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.perfect,
                    opacity: p.opacity.interpolate({
                      inputRange: [0.5, 1],
                      outputRange: [0, 1]
                    }),
                    transform: [
                      { translateX: p.pos.x },
                      { translateY: p.pos.y },
                      { scale: p.scale }
                    ],
                  }}
                />
                {/* White Hot Transition */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#FFFFFF',
                    opacity: p.opacity.interpolate({
                      inputRange: [0, 0.4, 1],
                      outputRange: [0, 1, 0] // Fades in quickly as green fades out, then fades out at the end
                    }),
                    transform: [
                      { translateX: p.pos.x },
                      { translateY: p.pos.y },
                      { scale: p.scale }
                    ],
                  }}
                />
              </React.Fragment>
            ))}

            <Animated.View 
              style={[
                styles.splashRing, 
                { 
                  transform: [{ scale: splashScale }], 
                  borderColor: btnColor === 'transparent' ? theme.colors.textPrimary : btnColor,
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
  </SafeAreaView>
  );
}

// Pequeno componente local para manter o JSX limpo e restaurar o FloatingFeedback
const FloatingFeedback = ({ text, opacity, scale, color }: any) => {
  const isUltra = text.startsWith('ULTRA!');

  return (
    <Animated.View
      style={[
        styles.feedbackContainer,
        {
          opacity: opacity,
          transform: [{ scale: scale }],
        }
      ]}
    >
      {isUltra ? (
        <UltraText label={text} />
      ) : (
        <>
          <Text
            style={[
              styles.feedbackText,
              {
                color: color,
                fontSize: typography.size.xl,
              }
            ]}
          >
            {text}
          </Text>
          {text === 'PERFECT' && (
            <View style={{ height: 2, width: 60, backgroundColor: color, marginTop: 5 }} />
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rootPressable: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  hudContainer: { position: 'absolute', top: 0, width: '100%', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bgFlash: { ...StyleSheet.absoluteFillObject },
  
  scoreData: { alignItems: 'flex-start' },
  scoreLabel: { color: theme.colors.textSecondary, fontSize: typography.size.xs, fontWeight: typography.weight.bold, letterSpacing: 1.5, marginBottom: 2 },
  scoreText: { color: theme.colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  progressBarBg: { height: 4, width: 120, backgroundColor: theme.colors.surface, marginTop: theme.spacing.xs, borderRadius: theme.borderRadius.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.perfect },
  
  debugPanel: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.3)', padding: 2, alignItems: 'center' },
  debugText: { color: theme.colors.perfect, fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', opacity: 0.5 },

  comboData: { alignItems: 'flex-end', justifyContent: 'center' },
  comboLabel: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.bold, letterSpacing: 2, marginBottom: -2 },
  comboText: { fontSize: typography.size.md, fontWeight: typography.weight.medium },

  feedbackContainer: { position: 'absolute', top: '40%', width: '100%', alignItems: 'center' },
  feedbackText: { fontWeight: typography.weight.bold, letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase' },
  
  gameArea: { width: 350, height: 350, justifyContent: 'center', alignItems: 'center' },
  targetContainer: { width: TARGET_SIZE, height: TARGET_SIZE, justifyContent: 'center', alignItems: 'center' },
  
  targetZone: { position: 'absolute', borderRadius: 1000 },
  zoneMiss: { width: 180, height: 180, backgroundColor: 'rgba(255, 59, 48, 0.15)' },
  zoneAlmost: { width: 130, height: 130, backgroundColor: 'rgba(255, 214, 10, 0.18)' },
  zoneGood: { width: 90, height: 90, backgroundColor: 'rgba(255, 159, 28, 0.22)' },
  zonePerfect: { width: 30, height: 30, backgroundColor: theme.colors.perfect },

  indicator: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 3, shadowColor: theme.colors.textPrimary, shadowRadius: 10, shadowOpacity: 0.8 },
  splashRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 4 },
});
