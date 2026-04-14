import { useState } from 'react';
import { generateTargetTime } from '../utils/timingEngine';

export const useGameLogic = () => {
  const [targetTime, setTargetTime] = useState(1000);
  const [startTime, setStartTime] = useState(0);

  const startRound = (level: number) => {
    const time = generateTargetTime(level);
    setTargetTime(time);
    setStartTime(Date.now());
  };

  const registerTap = () => {
    const diff = Date.now() - startTime;

    if (Math.abs(diff - targetTime) < 80) return "PERFECT";
    if (Math.abs(diff - targetTime) < 150) return "GOOD";
    return "MISS";
  };

  return {
    startRound,
    registerTap,
  };
};
