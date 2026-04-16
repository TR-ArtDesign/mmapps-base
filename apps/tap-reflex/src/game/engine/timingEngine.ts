import { Accuracy } from '@game/types/game.types';

/**
 * Calcula o ponto alvo dinâmico com curva em 3 fases:
 * 1. Early Game (1-10): Estabilidade e conforto.
 * 2. Mid Game (11-25): Aceleração moderada.
 * 3. Late Game (26+): Desafio agressivo de antecipação.
 */
export function getDynamicTargetPoint(level: number): number {
  const base = 0.96;   // Começa ainda mais fácil no início
  const min = 0.82;
  let decay = 0;

  if (level <= 10) {
    // Fase 1: Crescimento quase imperceptível (0.1% por nível)
    decay = level * 0.001;
  } else if (level <= 25) {
    // Fase 2: Rampa de aprendizado
    decay = 0.01 + (level - 10) * 0.0025;
  } else {
    // Fase 3: Dificuldade "Endgame"
    decay = 0.05 + (level - 25) * 0.0035;
  }

  return Math.max(base - decay, min);
}

/**
 * Avalia o tempo baseado no progresso normalizado e na curva dinâmica.
 */
export function evaluateTiming(
  progress: number, 
  level: number
): { accuracy: Accuracy; distance: number; targetPoint: number } {
  const targetPoint = getDynamicTargetPoint(level);
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const distance = Math.abs(clampedProgress - targetPoint);

  // Thresholds de precisão competitiva
  const PERFECT_THRESHOLD = 0.05;
  const GOOD_THRESHOLD = 0.12;
  const ALMOST_THRESHOLD = 0.22;

  if (distance <= PERFECT_THRESHOLD) {
    return { accuracy: 'PERFECT', distance, targetPoint };
  }

  if (distance <= GOOD_THRESHOLD) {
    return { accuracy: 'GOOD', distance, targetPoint };
  }

  if (distance <= ALMOST_THRESHOLD) {
    return { accuracy: 'ALMOST', distance, targetPoint };
  }

  return { accuracy: 'MISS', distance, targetPoint };
}
