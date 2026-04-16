export type Accuracy = 'PERFECT' | 'GOOD' | 'ALMOST' | 'MISS';

export interface ScoreState {
  score: number;
  combo: number;
  bestCombo: number;
}

export interface TimingResult {
  accuracy: Accuracy;
  delta: number;
  nearMiss?: boolean;
}

export interface FeedbackState {
  lastAccuracy: Accuracy | null;
}

export interface LevelState {
  level: number;
  current: number;
  target: number;
}
