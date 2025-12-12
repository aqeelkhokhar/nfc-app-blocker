import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows, gradients } from '../../styles';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  glow?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  glow = false,
}) => {
  const getGradientColors = (): string[] => {
    switch (variant) {
      case 'success':
        return gradients.success;
      case 'danger':
        return gradients.danger;
      case 'warning':
        return [colors.warning, colors.warningLight];
      case 'neutral':
        return [colors.backgroundTertiary, colors.backgroundSecondary];
      default:
        return gradients.primary;
    }
  };

  const getGlowColor = (): string => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[glow && shadows.glow(getGlowColor()), style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.badge,
          size === 'small' && styles.badgeSmall,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            size === 'small' && styles.badgeTextSmall,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
  },
  badgeSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeTextSmall: {
    fontSize: 12,
  },
});

export default StatusBadge;
