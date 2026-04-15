import { Accuracy } from '../types/game.types';

export function evaluateTiming(
  tapTime: number, 
  targetTime: number, 
  difficultyFactor: number,
  duration: number
): { accuracy: Accuracy; delta: number } {
  const delta = Math.abs(tapTime - targetTime);

  // Normalized progress (0 to 1) based on how far we are from target
  const progress = delta / duration;

  // Visual calibrated windows (matching the concentric circles)
  const perfectThreshold = 0.10 * difficultyFactor;
  const goodThreshold = 0.30 * difficultyFactor;
  const almostThreshold = 0.65 * difficultyFactor;

  if (progress <= perfectThreshold) {
    return { accuracy: 'PERFECT', delta };
  }

  if (progress <= goodThreshold) {
    return { accuracy: 'GOOD', delta };
  }

  if (progress <= almostThreshold) {
    return { accuracy: 'ALMOST', delta };
  }

  return { accuracy: 'MISS', delta };
}
