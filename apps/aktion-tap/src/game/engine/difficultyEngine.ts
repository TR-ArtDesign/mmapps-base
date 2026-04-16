/**
 * DIFFICULTY ENGINE — "ZEN START" CALIBRATION
 * Focado em uma experiência relaxada nos níveis iniciais e progressão orgânica.
 */

export function getDifficultyParams(score: number) {
  // Progressão muito mais lenta para permitir aprendizado (6000 pontos para atingir o máximo)
  const progress = 1 - Math.exp(-score / 5000);

  // Valores de velocidade muito mais amigáveis
  const startSpeed = 1800; // Bem devagar no começo (1.8 segundos)
  const midSpeed = 1100;   // Velocidade moderada
  const targetSpeed = 400; // Velocidade alta para o late game

  let speed;
  
  if (score < 500) {
    // FASE ZEN: Quase sem aceleração nos primeiros 500 pontos
    const subProgress = score / 500;
    speed = startSpeed - (startSpeed - midSpeed) * subProgress;
  } else {
    // FASE PROGRESSIVA: Aceleração suave a partir daqui
    speed = midSpeed - (midSpeed - targetSpeed) * progress;
  }

  // Randomness reduzida para não quebrar o ritmo no início
  const randomness = 0.02 + (progress * 0.10);

  return {
    speed,
    randomness,
    progress,
  };
}
