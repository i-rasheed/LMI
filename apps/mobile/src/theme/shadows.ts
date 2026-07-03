import { ViewStyle } from 'react-native';

export const shadows = {
  card: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: '#0A8F52',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;
