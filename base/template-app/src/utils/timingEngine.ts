export const generateTargetTime = (level: number) => {
  const base = 1000;
  return Math.max(300, base - level * 50);
};
