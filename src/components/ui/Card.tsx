import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, spacing, shadows } from '../../styles';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  style?: ViewStyle;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  noPadding = false,
}) => {
  const contentStyle = [
    styles.cardContent,
    noPadding && styles.noPadding,
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={['rgba(30, 30, 50, 0.9)', 'rgba(40, 40, 65, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        <View style={contentStyle}>{children}</View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        variant === 'glass' && styles.glassCard,
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.md,
  },
  glassCard: {
    backgroundColor: colors.cardBackgroundLight,
  },
  cardContent: {
    padding: spacing.xl,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;
