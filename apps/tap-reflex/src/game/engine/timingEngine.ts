import { Accuracy } from '@game/types/game.types';

/**
 * Calcula o ponto alvo dinâmico com curva em 3 fases:
 * 1. Early Game (1-10): Estabilidade e conforto.
 * 2. Mid Game (11-25): Aceleração moderada.
 * 3. Late Game (26+): Desafio agressivo de antecipação.
 */
export function getDynamicTargetPoint(level: number): number {
  /**
   * Calibração realista:
   * - Não pode ficar colado em 1.0
   * - Precisa espaço para zonas (ALMOST / GOOD)
   */
  const base = 0.92;   // ← CORREÇÃO PRINCIPAL (antes estava alto demais)
  const min = 0.80;

  let decay = 0;

  if (level <= 10) {
    decay = level * 0.0015;
  } else if (level <= 25) {
    decay = 0.015 + (level - 10) * 0.002;
  } else {
    decay = 0.045 + (level - 25) * 0.003;
  }

  return Math.max(base - decay, min);
}

/**
 * Avalia o tempo baseado no progresso normalizado e na curva dinâmica.
 */
export function evaluateTiming(
  progress: number,
  targetPoint: number = 1.0
): { accuracy: Accuracy; distance: number } {
  const distance = Math.abs(progress - targetPoint);

  /**
   * NOVA DISTRIBUIÇÃO REAL (EXPANDIDA)
   * baseada no seu design:
   *
   * PERFECT → pequeno (preciso)
   * GOOD → médio
   * ALMOST → grande
   * MISS → restante
   */

  const PERFECT_THRESHOLD = 0.12;  // 20%
  const GOOD_THRESHOLD = 0.25;  // 30%
  const ALMOST_THRESHOLD = 0.55;  // 40%

  if (distance <= PERFECT_THRESHOLD) {
    return { accuracy: 'PERFECT', distance };
  }

  if (distance <= GOOD_THRESHOLD) {
    return { accuracy: 'GOOD', distance };
  }

  if (distance <= ALMOST_THRESHOLD) {
    return { accuracy: 'ALMOST', distance };
  }

  return { accuracy: 'MISS', distance };
}
