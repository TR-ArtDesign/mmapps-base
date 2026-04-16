export type UltraStyle = 'ULTRA_BASE' | 'ULTRA_BORDER_LIGHT' | 'ULTRA_BORDER_STRONG' | 'ULTRA_GRADIENT' | 'ULTRA_MAX';

export function getUltraStyle(perfectStreak: number): UltraStyle {
  if (perfectStreak >= 9) {
    return 'ULTRA_MAX';
  }
  if (perfectStreak === 8) {
    return 'ULTRA_GRADIENT';
  }
  if (perfectStreak === 7) {
    return 'ULTRA_BORDER_STRONG';
  }
  if (perfectStreak === 6) {
    return 'ULTRA_BORDER_LIGHT';
  }
  return 'ULTRA_BASE';
}
