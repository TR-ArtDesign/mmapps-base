import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation }: Props) {
  const { score, bestScore, startGame } = useGameStore();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Score: {score}</Text>
      <Text>Best: {bestScore}</Text>

      <Button
        title="Try Again"
        onPress={() => {
          startGame();
          navigation.replace("Game");
        }}
      />
    </View>
  );
}