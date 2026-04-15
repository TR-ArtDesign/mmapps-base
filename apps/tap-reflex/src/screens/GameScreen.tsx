import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Vibration, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation }: Props) {
  const { level, registerScore, lastAccuracy } = useGameStore();
  const { startRound, registerTap, targetTime, startTime } = useGameLogic(level);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [btnColor, setBtnColor] = useState('#222');

  const triggerAnimation = () => {
    pulseAnim.setValue(0);
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: targetTime,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    triggerAnimation();
  }, [startTime, targetTime]);

  useEffect(() => {
    startRound();
  }, [level]);

  const handleTap = () => {
    pulseAnim.stopAnimation();
    const result = registerTap();
    registerScore(result);

    // Color feedback
    if (result === "PERFECT") setBtnColor('#4ade80');
    else if (result === "GOOD") setBtnColor('#facc15');
    else setBtnColor('#f87171');

    // Haptic feedback
    if (result === "PERFECT") Vibration.vibrate(50);
    else if (result === "GOOD") Vibration.vibrate(20);
    else Vibration.vibrate(10);

    // Visual scale
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    if (result === "MISS") {
      setTimeout(() => navigation.replace("Result"), 150);
    } else {
      setTimeout(() => {
        setBtnColor('#222');
        startRound();
      }, 150);
    }
  };

  const indicatorScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 1]
  });

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Level: {level}</Text>

      <View style={styles.gameArea}>
        <Animated.View style={[styles.indicator, { transform: [{ scale: indicatorScale }] }]} />
        <View style={styles.perfectZone} />
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleTap}
            style={[styles.button, { backgroundColor: btnColor }]}
          />
        </Animated.View>
      </View>

      <Text style={[styles.feedback, 
        lastAccuracy === "PERFECT" ? {color: '#4ade80'} : 
        lastAccuracy === "GOOD" ? {color: '#facc15'} : {color: '#f87171'}
      ]}>{lastAccuracy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#000' },
  level: { fontSize: 24, color: 'white', position: 'absolute', top: 60, fontWeight: 'bold' },
  gameArea: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  indicator: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  perfectZone: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#4ade80', borderStyle: 'dashed' },
  button: { width: 100, height: 100, borderRadius: 50, elevation: 5 },
  feedback: { fontSize: 28, fontWeight: 'bold', position: 'absolute', bottom: 100, textTransform: 'uppercase' },
});