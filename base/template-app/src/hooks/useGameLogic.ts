import { useState, useCallback } from 'react';
import { generateTargetTime } from '../utils/timingEngine';

export const useGameLogic = () => {
  const [startTime, setStartTime] = useState(0);
  const [targetTime, setTargetTime] = useState(0);

  const startNewRound = useCallback((level: number) => {
    const nextTarget = generateTargetTime(level);
    setTargetTime(nextTarget);
    setStartTime(Date.now());
    return nextTarget;
  }, []);

  const evaluateTap = useCallback(() => {
    const reactionTime = Date.now() - startTime;
    const diff = Math.abs(reactionTime - targetTime);

    if (diff < 80) return { status: 'PERFECT', points: 3 };
    if (diff < 150) return { status: 'GOOD', points: 1 };
    return { status: 'MISS', points: 0 };
  }, [startTime, targetTime]);

  return { startNewRound, evaluateTap, targetTime };
};
