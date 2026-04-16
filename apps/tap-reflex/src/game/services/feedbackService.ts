import { triggerHapticPerfect } from './haptics';
import { triggerVisualPerfect } from './visual';
import { triggerLabelPerfect } from './label';

export function triggerPerfectFeedback() {
  triggerHapticPerfect();
  triggerVisualPerfect();
  triggerLabelPerfect();
}
