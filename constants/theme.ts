/**
 * Design tokens for the Reserva app.
 * Black & White minimalistic palette, dark mode ready.
 * All screens should import from here — no hardcoded values.
 */

import { Platform } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────

export const Palette = {
  black: '#000000',
  white: '#FFFFFF',

  // Greys (light mode)
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Brand accent — modern blue
  accent: '#0A84FF',
  accentLight: '#E8F2FF',
  accentDark: '#0061CC',
  accentHover: '#0075E6',
  accentPressed: '#0052AB',

  // Legacy blue (keep for info/status)
  blue: '#0A84FF',
  blueLight: '#E8F2FF',

  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#0A84FF',
} as const;

// ─── Semantic Color Tokens ─────────────────────────────────────────────────────

export const Colors = {
  light: {
    // Backgrounds
    background: Palette.white,
    backgroundSecondary: Palette.grey50,
    backgroundTertiary: Palette.grey100,
    surface: Palette.white,
    surfaceElevated: Palette.white,

    // Text
    text: Palette.grey900,
    textSecondary: Palette.grey600,
    textTertiary: Palette.grey400,
    textInverse: Palette.white,

    // Border
    border: Palette.grey200,
    borderStrong: Palette.grey300,

    // Interactive
    tint: Palette.accent,
    tintBackground: Palette.accentLight,

    // Tab bar
    tabIconDefault: Palette.grey400,
    tabIconSelected: Palette.accent,

    // Status
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
  },
  dark: {
    // Backgrounds
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',

    // Text
    text: Palette.white,
    textSecondary: '#AEAEB2',
    textTertiary: '#636366',
    textInverse: Palette.black,

    // Border
    border: '#38383A',
    borderStrong: '#48484A',

    // Interactive
    tint: Palette.accent,
    tintBackground: 'rgba(184,175,230,0.15)',

    // Tab bar
    tabIconDefault: '#636366',
    tabIconSelected: Palette.accent,

    // Status
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
  },
} as const;

// ─── Spacing Scale ─────────────────────────────────────────────────────────────

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ─── Border Radii ──────────────────────────────────────────────────────────────

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
  // Font families (system)
  fontFamily: Platform.select({
    ios: { sans: undefined },  // uses San Francisco by default
    android: { sans: undefined },  // uses Roboto by default
    default: { sans: undefined },
  }),

  // Scale
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    // Semantic aliases
    caption: 13,
    body: 15,
    title: 17,
    heading: 24,
    display: 34,
  },

  // Weight
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const ZIndex = {
  base: 0,
  raised: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────

export const Duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Legacy export for backward compat with existing code
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "normal",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
