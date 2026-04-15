import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { score, bestCombo, resetGame } = useGameStore();

  const handleRestart = () => {
    resetGame();
    navigation.replace("Game");
  };

  return (
    <Pressable style={styles.container} onPress={handleRestart}>
      <Text style={styles.missText}>MISS</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.score}>{score}</Text>
        
        <Text style={styles.bestLabel}>BEST COMBO</Text>
        <Text style={styles.best}>{bestCombo}</Text>
      </View>

      <Text style={styles.tapToRestart}>TAP ANYWHERE TO RESTART</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000', // matches GameScreen
  },
  missText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 40,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  scoreLabel: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  score: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bestLabel: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  best: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tapToRestart: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.7,
    position: 'absolute',
    bottom: 50,
  }
});