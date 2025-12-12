import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../styles';

interface PermissionRowProps {
  title: string;
  description?: string;
  isGranted: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  title,
  description,
  isGranted,
  onPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.statusDot,
            isGranted ? styles.statusGranted : styles.statusDenied,
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>
      {!isGranted && (
        <TouchableOpacity
          style={styles.allowButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.allowButtonText}>Allow</Text>
        </TouchableOpacity>
      )}
      {isGranted && (
        <View style={styles.checkContainer}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  statusGranted: {
    backgroundColor: colors.success,
  },
  statusDenied: {
    backgroundColor: colors.danger,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '500',
  },
  description: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  allowButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  allowButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PermissionRow;
