import { create } from 'zustand';

type GameState = {
  score: number;
  bestScore: number;
  level: number;
  streak: number;
  isPlaying: boolean;

  startGame: () => void;
  endGame: () => void;
  addScore: () => void;
};

export const useGameStore = create<GameState>((set: any) => ({
  score: 0,
  bestScore: 0,
  level: 1,
  streak: 0,
  isPlaying: false,

  startGame: () =>
    set({ score: 0, level: 1, isPlaying: true }),

  endGame: () =>
    set((state: any) => ({
      isPlaying: false,
      bestScore: Math.max(state.score, state.bestScore),
    })),

  addScore: () =>
    set((state: any) => ({
      score: state.score + 1,
      level: Math.floor(state.score / 5) + 1,
    })),
}));
