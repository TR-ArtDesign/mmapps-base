import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { typography } from '../theme/typography';
import { Background } from '../components/Background';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const resetGame = useGameStore((s) => s.resetGame);
  const highScore = useGameStore((s) => s.highScore);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Título flutuando/aparecendo
    Animated.spring(titleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Pulsação contínua do fundo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    resetGame();
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Background variant="home" />
      {/* Elemento de fundo pulsante */}
      <Animated.View 
        style={[
          styles.bgOrb, 
          { transform: [{ scale: pulseAnim }], opacity: 0.1 }
        ]} 
      />

      <Animated.View style={[styles.content, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
        <Text style={styles.titleMain}>AKTION</Text>
        <Text style={styles.titleSub}>TAP</Text>
        
        <View style={styles.separator} />
        
        <Text style={styles.tagline}>MASTER YOUR TIMING</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>START MISSION</Text>
        </Pressable>

        {highScore > 0 && (
          <Text style={styles.bestScore}>PERSONAL BEST: {highScore.toLocaleString()}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.perfect,
  },
  content: {
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 64,
    fontWeight: typography.weight.bold,
    color: theme.colors.textPrimary,
    letterSpacing: 4,
    lineHeight: 70,
  },
  titleSub: {
    fontSize: typography.size.display + 10,
    fontWeight: typography.weight.bold,
    color: theme.colors.perfect,
    letterSpacing: 4,
    lineHeight: 52,
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowRadius: 20,
  },
  separator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: theme.spacing.xl,
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl + 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.perfect,
    shadowColor: theme.colors.perfect,
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  startText: {
    color: theme.colors.perfect,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: 3,
  },
  bestScore: {
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
    fontSize: typography.size.xs - 1,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
  }
});
