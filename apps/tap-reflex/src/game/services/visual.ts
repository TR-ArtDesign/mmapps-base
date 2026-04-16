import { useGameStore } from '../state/useGameStore';

export function triggerVisualPerfect() {
  const store = useGameStore.getState();
  store.setPerfectFlash(true);

  setTimeout(() => {
    useGameStore.getState().setPerfectFlash(false);
  }, 80);
}
