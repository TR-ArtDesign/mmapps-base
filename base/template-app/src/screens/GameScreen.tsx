import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';

export default function GameScreen({ navigation }: any) {
  const { score, addPoints, endGame } = useGameStore();
  const { startNewRound, evaluateTap, targetTime } = useGameLogic();
  const [feedback, setFeedback] = useState('Wait...');

  useEffect(() => {
    startNewRound(1);
  }, []);

  const handleTap = () => {
    const result = evaluateTap();
    setFeedback(result.status);

    if (result.status === 'MISS') {
      endGame();
      navigation.navigate('Result', { status: 'MISS' });
    } else {
      addPoints(result.points);
      setTimeout(() => {
        startNewRound(1);
        setFeedback('Wait...');
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>SCORE: {score}</Text>
      <TouchableOpacity 
        style={styles.gameArea} 
        activeOpacity={0.8} 
        onPress={handleTap}
      >
        <Text style={styles.feedback}>{feedback}</Text>
        <Text style={styles.hint}>Tap at {targetTime}ms!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  score: { color: '#fff', fontSize: 24, marginBottom: 20 },
  gameArea: { 
    width: 300, 
    height: 300, 
    borderRadius: 150, 
    borderWidth: 5, 
    borderColor: '#333', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#111' 
  },
  feedback: { color: '#0f0', fontSize: 40, fontWeight: 'bold' },
  hint: { color: '#555', marginTop: 10 }
});
