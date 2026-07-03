import { TextStyle } from 'react-native';

/** Plus Jakarta Sans — load custom font in a later milestone; system fallback for M04. */
export const fontFamily = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
} as const satisfies Record<string, TextStyle>;
