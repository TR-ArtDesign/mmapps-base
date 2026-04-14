import { useState } from 'react';
import { generateTargetTime } from '../utils/timingEngine';

export const useGameLogic = (level: number) => {
  const [targetTime, setTargetTime] = useState(1000);
  const [startTime, setStartTime] = useState(0);

  const startRound = () => {
    const time = generateTargetTime(level);
    setTargetTime(time);
    setStartTime(Date.now());
  };

  const registerTap = () => {
    const diff = Date.now() - startTime;
    const delta = Math.abs(diff - targetTime);

    if (delta < 60) return "PERFECT";
    if (delta < 140) return "GOOD";
    return "MISS";
  };

  return {
    startRound,
    registerTap,
  };
};