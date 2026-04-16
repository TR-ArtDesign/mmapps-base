import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const resetGame = useGameStore((s) => s.resetGame);
  const bestCombo = useGameStore((s) => s.bestCombo);

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
      {/* Elemento de fundo pulsante */}
      <Animated.View 
        style={[
          styles.bgOrb, 
          { transform: [{ scale: pulseAnim }], opacity: 0.1 }
        ]} 
      />

      <Animated.View style={[styles.content, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
        <Text style={styles.titleMain}>TAP</Text>
        <Text style={styles.titleSub}>REFLEX</Text>
        
        <View style={styles.separator} />
        
        <Text style={styles.tagline}>MASTER YOUR TIMING</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>START MISSION</Text>
        </Pressable>

        {bestCombo > 0 && (
          <Text style={styles.bestCombo}>BEST STREAK: {bestCombo}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00FFAA',
  },
  content: {
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 82,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 10,
    lineHeight: 82,
  },
  titleSub: {
    fontSize: 52,
    fontWeight: '900',
    color: '#00FFAA',
    letterSpacing: 4,
    lineHeight: 52,
    textShadowColor: 'rgba(0, 255, 170, 0.5)',
    textShadowRadius: 20,
  },
  separator: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  tagline: {
    color: '#666',
    fontSize: 12,
    fontWeight: '900',
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
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00FFAA',
    shadowColor: '#00FFAA',
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  startText: {
    color: '#00FFAA',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  bestCombo: {
    marginTop: 20,
    color: '#444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
