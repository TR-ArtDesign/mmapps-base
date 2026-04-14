import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation }: Props) {
  const { level, registerScore, lastAccuracy } = useGameStore();
  const { startRound, registerTap } = useGameLogic(level);

  useEffect(() => {
    startRound();
  }, [level]);

  const handleTap = () => {
    const result = registerTap();
    registerScore(result);

    if (result === "MISS") {
      navigation.replace("Result");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Level: {level}</Text>
      <Text>Tap at the right moment!</Text>

      <Pressable
        onPress={handleTap}
        style={{
          width: 150,
          height: 150,
          backgroundColor: "black",
          marginTop: 40,
        }}
      />

      <Text>{lastAccuracy}</Text>
    </View>
  );
}