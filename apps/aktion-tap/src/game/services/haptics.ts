import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useGameStore } from '../state/useGameStore';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function triggerHapticPerfect() {
  const { perfectStreak } = useGameStore.getState();

  if (perfectStreak >= 5) {
    ReactNativeHapticFeedback.trigger("impactHeavy", options);
  } else if (perfectStreak >= 3) {
    ReactNativeHapticFeedback.trigger("impactMedium", options);
  } else {
    ReactNativeHapticFeedback.trigger("impactHeavy", options);
  }
}

export function triggerHapticGood() {
  ReactNativeHapticFeedback.trigger("impactMedium", options);
}

export function triggerHapticAlmost() {
  ReactNativeHapticFeedback.trigger("impactLight", options);
}
