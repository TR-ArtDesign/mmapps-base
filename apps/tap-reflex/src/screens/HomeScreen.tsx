import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
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
