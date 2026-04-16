import { theme } from './theme';

export function getAccuracyColor(type: string) {
  switch (type) {
    case 'PERFECT':
      return theme.colors.perfect;
    case 'GOOD':
      return theme.colors.good;
    case 'ALMOST':
      return theme.colors.almost;
    case 'MISS':
      return theme.colors.miss;
    default:
      return theme.colors.textPrimary;
  }
}
