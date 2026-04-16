import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { score, bestCombo, resetGame } = useGameStore();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleRestart = () => {
    resetGame();
    navigation.replace("Game");
  };

  return (
    <Pressable style={styles.container} onPress={handleRestart}>
      <Animated.Text style={[styles.missText, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        GAME OVER
      </Animated.Text>
      
      <Animated.View style={[styles.statsContainer, { opacity: opacityAnim, transform: [{ translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <Text style={styles.scoreLabel}>FINAL SCORE</Text>
        <Text style={styles.score}>{score.toLocaleString()}</Text>
        
        <View style={styles.bestContainer}>
          <Text style={styles.bestLabel}>BEST STREAK</Text>
          <Text style={styles.best}>{bestCombo}</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.tapToRestart, { transform: [{ scale: pulseAnim }] }]}>
        TAP ANYWHERE TO REPLAY
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000',
  },
  missText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#ff4d4d',
    fontStyle: 'italic',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 77, 77, 0.5)',
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  scoreLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 10,
  },
  score: {
    color: '#fff',
    fontSize: 82,
    fontWeight: '900',
    marginBottom: 30,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowRadius: 15,
  },
  bestContainer: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  bestLabel: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  best: {
    color: '#60a5fa',
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  tapToRestart: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    position: 'absolute',
    bottom: 120,
    opacity: 0.8,
  }
});