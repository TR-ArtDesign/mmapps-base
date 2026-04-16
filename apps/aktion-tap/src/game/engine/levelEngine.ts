const BASE_XP = 500;
const GROWTH_FACTOR = 1.35;
const MAX_LEVEL = 99;

export function getLevelFromScore(score: number) {
  let level = 1;
  let threshold = BASE_XP;
  let xpRequiredForNextLevel = BASE_XP;
  let prevThreshold = 0;

  while (score >= threshold && level < MAX_LEVEL) {
    level++;
    prevThreshold = threshold;
    xpRequiredForNextLevel = Math.floor(xpRequiredForNextLevel * GROWTH_FACTOR);
    threshold += xpRequiredForNextLevel;
  }

  return {
    level,
    currentLevelXP: score - prevThreshold,
    nextLevelXP: xpRequiredForNextLevel,
  };
}

export function getProgressPercentage(score: number): number {
  const { level, currentLevelXP, nextLevelXP } = getLevelFromScore(score);
  
  if (level === MAX_LEVEL) return 1;
  
  return Math.max(0, Math.min(1, currentLevelXP / nextLevelXP));
}
