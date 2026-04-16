import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Accuracy } from "@game/types/game.types";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Dispara feedback tátil baseado na precisão do toque.
 */
export function triggerHaptic(accuracy: Accuracy) {
  try {
    switch (accuracy) {
      case 'PERFECT':
        ReactNativeHapticFeedback.trigger("notificationSuccess", options);
        break;
      case 'GOOD':
        ReactNativeHapticFeedback.trigger("impactMedium", options);
        break;
      case 'ALMOST':
        ReactNativeHapticFeedback.trigger("impactLight", options);
        break;
      case 'MISS':
        ReactNativeHapticFeedback.trigger("longPress", options);
        break;
      default:
        ReactNativeHapticFeedback.trigger("selection", options);
    }
  } catch (error) {
    console.warn("Haptic Feedback not available:", error);
  }
}
