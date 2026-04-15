import React from 'react';
import { View, Text, Button } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export default function HomeScreen({ navigation }: any) {
  const startGame = useGameStore((s: any) => s.startGame);

  return (
    <View>
      <Text>Tap Reflex</Text>
      <Button
        title="Play"
        onPress={() => {
          startGame();
          navigation.navigate('Game');
        }}
      />
    </View>
  );
}
