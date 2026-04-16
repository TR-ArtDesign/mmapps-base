import { theme } from './theme';

export const baseStyles = {
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};
