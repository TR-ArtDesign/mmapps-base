import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '@game/state/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const resetGame = useGameStore((s: any) => s.resetGame);

  return (
    <View>
      <Text>Tap Reflex</Text>
      <Button
        title="Play"
        onPress={() => {
          resetGame();
          navigation.navigate('Game');
        }}
      />
    </View>
  );
}
