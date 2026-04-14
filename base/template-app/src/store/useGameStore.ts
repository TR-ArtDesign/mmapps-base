import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GameState = {
  score: number;
  bestScore: number;
  coins: number;
  dailyStreak: number;
  isPlaying: boolean;

  addPoints: (points: number) => void;
  addCoins: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetScore: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set: any) => ({
      score: 0,
      bestScore: 0,
      coins: 0,
      dailyStreak: 1,
      isPlaying: false as boolean,

      startGame: () => set({ isPlaying: true, score: 0 }),
      
      endGame: () => set((state: any) => ({ 
        isPlaying: false, 
        bestScore: Math.max(state.score, state.bestScore) 
      })),

      addPoints: (points: number) => set((state: any) => ({ score: state.score + points })),
      
      addCoins: (amount: number) => set((state: any) => ({ coins: state.coins + amount })),

      resetScore: () => set({ score: 0 }),
    }),
    {
      name: 'mmapps-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
