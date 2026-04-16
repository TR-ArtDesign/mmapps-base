import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useGameStore } from '@game/state/useGameStore';
import { theme } from '../theme/theme';
import { typography } from '../theme/typography';

export function UltraText({ label }: { label: string }) {
  const ultraStyle = useGameStore((s) => s.ultraStyle);

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ultraStyle !== 'ULTRA_BASE') {
      scale.setValue(1);
      opacity.setValue(0.6);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [ultraStyle]);

  const getStrokeColor = () => {
    switch (ultraStyle) {
      case 'ULTRA_MAX':
        return theme.colors.perfect; // Texto é branco, a borda fica verde neon
      case 'ULTRA_GRADIENT':
      case 'ULTRA_BORDER_STRONG':
        return 'rgba(255, 255, 255, 0.8)'; // Texto é verde, a borda fica branca nítida
      case 'ULTRA_BORDER_LIGHT':
        return 'rgba(255, 255, 255, 0.4)'; // Texto é verde, borda branca suave
      default:
        return 'transparent';
    }
  };

  const currentStrokeColor = getStrokeColor();

  const renderStroke = (offsetX: number, offsetY: number) => (
    <Text
      key={`${offsetX}-${offsetY}`}
      style={[
        styles.strokeText,
        {
          left: offsetX,
          top: offsetY,
          color: currentStrokeColor,
        }
      ]}
    >
      {label}
    </Text>
  );

  const getStrokeLayers = () => {
    switch (ultraStyle) {
      case 'ULTRA_BORDER_LIGHT':
        return [renderStroke(1, 1), renderStroke(-1, -1)];

      case 'ULTRA_BORDER_STRONG':
      case 'ULTRA_GRADIENT':
      case 'ULTRA_MAX':
        return [
          renderStroke(1, 1),
          renderStroke(-1, -1),
          renderStroke(1, -1),
          renderStroke(-1, 1),
        ];

      default:
        return [];
    }
  };

  const animatedStyle = {
    transform: [{ scale }],
    opacity,
  };

  const getTextColor = () => {
    switch (ultraStyle) {
      case 'ULTRA_MAX':
        return '#FFFFFF';
      case 'ULTRA_BORDER_STRONG':
      case 'ULTRA_GRADIENT':
        return '#88FFCC';
      default:
        return theme.colors.perfect;
    }
  };

  const currentTextColor = getTextColor();

  return (
    <View style={styles.container}>
      {/* Stroke Layers */}
      {getStrokeLayers()}

      {/* Main Text */}
      <Text style={[styles.mainText, { color: currentTextColor }]}>{label}</Text>

      {/* Ghost Animation Layer */}
      <Animated.View style={[styles.ghostContainer, animatedStyle]} pointerEvents="none">
        <Text style={[styles.mainText, { color: currentTextColor }]}>{label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostContainer: {
    position: 'absolute',
  },
  mainText: {
    color: theme.colors.perfect,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.display,
    fontFamily: typography.fontFamily.primary,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  strokeText: {
    position: 'absolute',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.display,
    fontFamily: typography.fontFamily.primary,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  }
});
