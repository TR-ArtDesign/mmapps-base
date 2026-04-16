import { create } from 'zustand';
import { calculateScore } from '../engine/scoreEngine';
import { getLevelFromScore, getProgressPercentage } from '../engine/levelEngine';

interface GameStore {
  score: number;
  combo: number;
  bestCombo: number;
  lastAccuracy: any;

  derivedLevel: number;
  derivedProgress: number;

  difficultyFactor: number;

  targetTime: number;
  lastTargetTime: number;
  roundDuration: number;
  startTime: number; // Single source of truth for round beginning

  setTargetRound: (time: number, duration: number, startTime: number) => void;
  registerHit: (result: any) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  combo: 0,
  bestCombo: 0,
  lastAccuracy: null,

  derivedLevel: 1,
  derivedProgress: 0,

  difficultyFactor: 1,

  targetTime: 0,
  lastTargetTime: 0,
  roundDuration: 1000,
  startTime: 0,

  setTargetRound: (time, duration, startTime) =>
    set((state) => ({
      lastTargetTime: state.targetTime,
      targetTime: time,
      roundDuration: duration,
      startTime: startTime,
    })),

  registerHit: (result) =>
    set((state) => {
      const calc = calculateScore(result.accuracy, state.combo);

      let newCombo = calc.isMiss ? 0 : calc.combo;
      let newScore = state.score + calc.score;

      const { level } = getLevelFromScore(newScore);
      const progress = getProgressPercentage(newScore);

      const newDifficulty = Math.max(
        0.5,
        1 - level * 0.05
      );

      return {
        score: newScore,
        combo: newCombo,
        bestCombo: Math.max(state.bestCombo, newCombo),
        lastAccuracy: result.accuracy,
        derivedLevel: level,
        derivedProgress: progress,
        difficultyFactor: newDifficulty,
      };
    }),

  resetGame: () =>
    set({
      score: 0,
      combo: 0,
      bestCombo: 0,
      lastAccuracy: null,
      derivedLevel: 1,
      derivedProgress: 0,
      difficultyFactor: 1,
      targetTime: 0,
      lastTargetTime: 0,
      roundDuration: 1000,
      startTime: 0,
    }),
}));
