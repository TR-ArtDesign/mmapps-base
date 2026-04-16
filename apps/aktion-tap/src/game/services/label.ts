import { useGameStore } from '../state/useGameStore';
import { getUltraStyle } from './ultraStyle';

export function triggerLabelPerfect() {
  const state = useGameStore.getState();
  const { perfectStreak } = state;

  let label = 'PERFECT';

  if (perfectStreak >= 5) {
    label = 'ULTRA!';
    const style = getUltraStyle(perfectStreak);
    state.setUltraStyle(style);
  } else if (perfectStreak >= 2) {
    label = `PERFECT x${perfectStreak}`;
  }

  state.setAccuracyLabel(label);

  setTimeout(() => {
    state.clearAccuracyLabel();
  }, 300);
}
