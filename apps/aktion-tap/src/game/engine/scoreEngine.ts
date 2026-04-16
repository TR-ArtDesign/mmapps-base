import { Accuracy } from '../types/game.types';

const SCORE_MAP = {
  PERFECT: 100,
  GOOD: 50,
  ALMOST: 25,
  MISS: 0,
};

export function calculateScore(
  accuracy: Accuracy,
  currentCombo: number
) {
  const baseScore = SCORE_MAP[accuracy];

  if (accuracy === 'MISS') {
    return {
      score: 0,
      combo: 0,
      isMiss: true,
    };
  }

  const newCombo = currentCombo + 1;

  // Progressive multiplier (scalable)
  const multiplier = 1 + newCombo * 0.1;

  return {
    score: Math.floor(baseScore * multiplier),
    combo: newCombo,
    isMiss: false,
  };
}
