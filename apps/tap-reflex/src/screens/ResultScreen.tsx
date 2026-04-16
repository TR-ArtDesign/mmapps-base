import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { score, bestCombo, highScore, isNewRecord, resetGame } = useGameStore();

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
      <Animated.Text style={[styles.gameOverText, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        GAME OVER
      </Animated.Text>
      
      <Animated.View style={[styles.statsContainer, { opacity: opacityAnim, transform: [{ translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        {isNewRecord && (
          <View style={styles.newRecordBadge}>
            <Text style={styles.newRecordText}>NEW RECORD</Text>
          </View>
        )}
        
        <Text style={styles.scoreLabel}>FINAL SCORE</Text>
        <Text style={styles.score}>{score.toLocaleString()}</Text>
        
        <View style={styles.recordsWrapper}>
          <View style={styles.recordBox}>
            <Text style={styles.recordLabel}>BEST SCORE</Text>
            <Text style={styles.recordValue}>{highScore.toLocaleString()}</Text>
          </View>
          <View style={[styles.recordBox, { borderLeftWidth: 1, borderLeftColor: '#222' }]}>
            <Text style={styles.recordLabel}>BEST STREAK</Text>
            <Text style={styles.recordValue}>{bestCombo}</Text>
          </View>
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
  gameOverText: {
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
    width: '100%',
  },
  newRecordBadge: {
    backgroundColor: '#00FFAA',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 20,
    transform: [{ rotate: '-3deg' }],
  },
  newRecordText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
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
    marginBottom: 40,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowRadius: 15,
  },
  recordsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  recordBox: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    minWidth: 140,
  },
  recordLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 5,
  },
  recordValue: {
    color: '#00FFAA',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  tapToRestart: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    position: 'absolute',
    bottom: 20,
    opacity: 0.8,
  }
});