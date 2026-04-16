import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { typography } from '../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { score, bestCombo, highScore, isNewRecord, bestPerfectStreak, resetGame } = useGameStore();

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
            <Text style={[styles.recordValue, { color: theme.colors.good }]}>{highScore.toLocaleString()}</Text>
          </View>
          <View style={[styles.recordBox, { borderLeftWidth: 1, borderLeftColor: theme.colors.surface, borderRightWidth: 1, borderRightColor: theme.colors.surface }]}>
            <Text style={styles.recordLabel}>BEST COMBO</Text>
            <Text style={[styles.recordValue, { color: theme.colors.almost }]}>{bestCombo}</Text>
          </View>
          <View style={styles.recordBox}>
            <Text style={styles.recordLabel}>PERFECTS!</Text>
            <Text style={[styles.recordValue, { color: theme.colors.perfect }]}>{bestPerfectStreak}</Text>
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
    backgroundColor: theme.colors.background,
  },
  gameOverText: {
    fontSize: typography.size.display + 20,
    fontWeight: typography.weight.bold,
    color: theme.colors.miss,
    fontStyle: 'italic',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 59, 48, 0.5)',
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 60,
    width: '100%',
  },
  newRecordBadge: {
    backgroundColor: theme.colors.perfect,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 20,
    transform: [{ rotate: '-3deg' }],
  },
  newRecordText: {
    color: theme.colors.background,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
    letterSpacing: 2,
  },
  scoreLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: 4,
    marginBottom: 10,
  },
  score: {
    color: theme.colors.textPrimary,
    fontSize: typography.size.display * 2,
    fontWeight: typography.weight.bold,
    marginBottom: 40,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowRadius: 15,
  },
  recordsWrapper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  recordBox: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    flex: 1,
  },
  recordLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.size.xs - 2,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
    marginBottom: 5,
  },
  recordValue: {
    color: theme.colors.perfect,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    fontStyle: 'italic',
  },
  tapToRestart: {
    color: theme.colors.textPrimary,
    fontSize: typography.size.sm + 2,
    fontWeight: typography.weight.bold,
    letterSpacing: 3,
    position: 'absolute',
    bottom: 20,
    opacity: 0.8,
  }
});