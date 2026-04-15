import { create } from 'zustand';

type Accuracy = "PERFECT" | "GOOD" | "MISS";

type GameState = {
  score: number;
  bestScore: number;
  level: number;
  streak: number;
  coins: number;
  isPlaying: boolean;
  lastAccuracy: Accuracy | null;

  startGame: () => void;
  endGame: () => void;
  registerScore: (accuracy: Accuracy) => void;
};

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  bestScore: 0,
  level: 1,
  streak: 0,
  coins: 0,
  isPlaying: false,
  lastAccuracy: null,

  startGame: () =>
    set({
      score: 0,
      level: 1,
      isPlaying: true,
    }),

  endGame: () =>
    set((state) => ({
      isPlaying: false,
      bestScore: Math.max(state.score, state.bestScore),
    })),

  registerScore: (accuracy) =>
    set((state) => {
      if (accuracy === "MISS") {
        return {
          isPlaying: false,
          bestScore: Math.max(state.score, state.bestScore),
          lastAccuracy: accuracy,
        };
      }

      const newScore = state.score + (accuracy === "PERFECT" ? 2 : 1);

      return {
        score: newScore,
        level: Math.floor(newScore / 5) + 1,
        coins: state.coins + (accuracy === "PERFECT" ? 3 : 1),
        lastAccuracy: accuracy,
      };
    }),
}));