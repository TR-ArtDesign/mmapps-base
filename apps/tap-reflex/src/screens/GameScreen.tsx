import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Vibration, StyleSheet, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { evaluateTiming } from '@game/engine/timingEngine';
import { Accuracy } from '@game/types/game.types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation }: Props) {
  const { 
    score, 
    combo, 
    lastAccuracy, 
    targetTime, 
    roundDuration,
    setTargetRound, 
    registerHit, 
    difficultyFactor, 
    derivedLevel, 
    derivedProgress,
  } = useGameStore();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(1)).current;
  
  const [btnColor, setBtnColor] = useState('transparent');

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
    const delay = 1000 + Math.random() * 2000;
    const nextTarget = Date.now() + delay;
    setTargetRound(nextTarget, delay);

    pulseAnim.setValue(0);
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: delay,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    scheduleNext();
  }, [derivedLevel]);

  const handleTap = () => {
    pulseAnim.stopAnimation();
    const tapTime = Date.now();
    
    // Engine call with duration for visual calibration
    const result = evaluateTiming(tapTime, targetTime, difficultyFactor, roundDuration);
    registerHit(result);
    
    setBtnColor(getColorByAccuracy(result.accuracy));

    if (Platform.OS === 'android') {
      if (result.accuracy === "PERFECT") Vibration.vibrate(50);
      else if (result.accuracy === "GOOD") Vibration.vibrate(25);
      else if (result.accuracy === "ALMOST") Vibration.vibrate(15);
      else Vibration.vibrate(10);
    }

    if (result.accuracy === "PERFECT") {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 25, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 25, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 25, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 25, useNativeDriver: true })
      ]).start();
      
      Animated.sequence([
        Animated.timing(comboAnim, { toValue: 1.2, duration: 50, useNativeDriver: true }),
        Animated.spring(comboAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    if (result.accuracy === "MISS") {
      setTimeout(() => navigation.replace("Result"), 150);
    } else {
      setTimeout(() => {
        setBtnColor('transparent');
        scheduleNext();
      }, 150);
    }
  };

  const indicatorScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4.4, 1]
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.scoreData}>
          <Text style={styles.scoreLabel}>SCORE - LV.{paddedLevel}</Text>
          <Text style={styles.scoreText}>{score}</Text>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: derivedProgress * 120 }]}/>
          </View>
        </View>
      </View>

      {combo > 1 && (
        <Animated.View style={[styles.comboContainer, { transform: [{ scale: comboAnim }] }]}>
          <Text style={styles.comboText}>{combo}</Text>
          <Text style={styles.comboLabel}>COMBO</Text>
        </Animated.View>
      )}

      <View style={styles.gameArea}>
        {/* CONCENTRIC TARGETS */}
        <View style={styles.targetContainer}>
          <View style={[styles.targetZone, styles.zoneMiss]} />
          <View style={[styles.targetZone, styles.zoneAlmost]} />
          <View style={[styles.targetZone, styles.zoneGood]} />
          <View style={[styles.targetZone, styles.zonePerfect]} />
        </View>

        {/* ANIMATED INDICATOR */}
        <Animated.View 
          style={[
            styles.indicator, 
            { 
              transform: [{ scale: indicatorScale }],
              borderColor: getColorByAccuracy(lastAccuracy)
            }
          ]} 
        />
        
        {/* BUTTON */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleTap}
            style={[styles.button, { backgroundColor: btnColor, borderColor: btnColor === 'transparent' ? '#333' : btnColor }]}
          >
            <Text style={styles.tapLabel}>TAP</Text>
          </Pressable>
        </Animated.View>
      </View>

      <Text style={[styles.feedback, { color: getColorByAccuracy(lastAccuracy) }]}>
        {lastAccuracy || ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#000' },
  header: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreData: { alignItems: 'flex-start' },
  scoreLabel: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  scoreText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  progressBarBg: { height: 6, width: 120, backgroundColor: '#333', marginTop: 4, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#00FFAA' },
  
  comboContainer: { position: 'absolute', top: 120, alignItems: 'center' },
  comboText: { fontSize: 44, fontWeight: '900', color: '#60a5fa', fontStyle: 'italic' },
  comboLabel: { fontSize: 16, fontWeight: 'bold', color: '#60a5fa', letterSpacing: 2 },
  
  gameArea: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  
  targetContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  targetZone: { position: 'absolute', borderRadius: 1000 },
  zoneMiss: { width: 220, height: 220, backgroundColor: 'rgba(255, 77, 77, 0.15)' },
  zoneAlmost: { width: 160, height: 160, backgroundColor: 'rgba(255, 140, 66, 0.15)' },
  zoneGood: { width: 100, height: 100, backgroundColor: 'rgba(255, 209, 102, 0.2)' },
  zonePerfect: { width: 50, height: 50, backgroundColor: 'rgba(0, 255, 170, 0.35)' },

  indicator: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 2.5 },
  
  button: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, elevation: 5, justifyContent: 'center', alignItems: 'center' },
  tapLabel: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  
  feedback: { fontSize: 32, fontWeight: '900', position: 'absolute', bottom: 100, textTransform: 'uppercase' },
});