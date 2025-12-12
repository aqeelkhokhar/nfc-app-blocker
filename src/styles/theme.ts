// Modern Dark Theme with Gradients and Glassmorphism
export const colors = {
  // Primary palette
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Accent colors
  accent: '#22D3EE',
  accentLight: '#67E8F9',
  
  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  
  // Background colors (dark theme)
  background: '#0F0F1A',
  backgroundSecondary: '#1A1A2E',
  backgroundTertiary: '#252540',
  
  // Card backgrounds (glassmorphism)
  cardBackground: 'rgba(30, 30, 50, 0.8)',
  cardBackgroundLight: 'rgba(40, 40, 65, 0.6)',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  
  // Border colors
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const gradients = {
  primary: ['#6366F1', '#8B5CF6'],
  accent: ['#06B6D4', '#22D3EE'],
  success: ['#059669', '#10B981'],
  danger: ['#DC2626', '#EF4444'],
  background: ['#0F0F1A', '#1A1A2E'],
  card: ['rgba(30, 30, 50, 0.9)', 'rgba(40, 40, 65, 0.7)'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  }),
};