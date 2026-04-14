import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { showInterstitial } from '../services/adsService';

export default function ResultScreen({ navigation }: any) {
  const { score, bestScore, startGame } = useGameStore();

  const handleRetry = () => {
    showInterstitial(); // Monetization Trigger
    startGame();
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME OVER</Text>
      <Text style={styles.result}>Score: {score}</Text>
      <Text style={styles.best}>Best: {bestScore}</Text>
      
      <View style={styles.btnContainer}>
        <Button title="TRY AGAIN" onPress={handleRetry} color="#0f0" />
        <Button title="HOME" onPress={() => navigation.navigate('Home')} color="#555" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#f00', fontSize: 50, fontWeight: 'bold' },
  result: { color: '#fff', fontSize: 30, marginVertical: 10 },
  best: { color: '#aaa', fontSize: 20 },
  btnContainer: { marginTop: 40, gap: 10, width: '60%' }
});
