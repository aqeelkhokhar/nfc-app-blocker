import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows, gradients } from '../../styles';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getGradientColors = (): string[] => {
    if (isDisabled) return ['#4B5563', '#374151'];
    switch (variant) {
      case 'primary':
        return gradients.primary;
      case 'success':
        return gradients.success;
      case 'danger':
        return gradients.danger;
      default:
        return gradients.primary;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 18 };
      default:
        return { fontSize: 16 };
    }
  };

  if (variant === 'ghost' || variant === 'outline' || variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.button,
          getSizeStyles(),
          variant === 'outline' && styles.outlineButton,
          variant === 'secondary' && styles.secondaryButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.textSecondary} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.buttonText,
                getTextSize(),
                variant === 'outline' && styles.outlineText,
                variant === 'secondary' && styles.secondaryText,
                variant === 'ghost' && styles.ghostText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientButton,
          getSizeStyles(),
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.buttonText, getTextSize(), textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: colors.textSecondary,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundTertiary,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
