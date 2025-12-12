import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows, gradients } from '../../styles';
import { StatusBadge, Button } from '../ui';
import { BrickStatus } from '../../state/BrickContext';

interface StatusCardProps {
  status: BrickStatus;
  permissionsGranted: boolean;
  onToggle: () => void;
  onSetupPermissions: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  permissionsGranted,
  onToggle,
  onSetupPermissions,
}) => {
  const isBlocked = status === 'BRICKED';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isBlocked 
          ? ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']
          : ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
        style={styles.card}
      >
        {/* Status indicator dot */}
        <View style={[styles.statusDot, isBlocked ? styles.statusDotBlocked : styles.statusDotUnblocked]} />
        
        <View style={styles.content}>
          <Text style={styles.label}>Current Status</Text>
          
          <View style={styles.statusRow}>
            <StatusBadge
              label={isBlocked ? 'BLOCKED' : 'UNBLOCKED'}
              variant={isBlocked ? 'danger' : 'success'}
              glow
            />
          </View>

          <Text style={styles.description}>
            {isBlocked 
              ? 'Selected apps are currently blocked and cannot be opened.'
              : 'All apps are accessible. Tap below to enable blocking.'}
          </Text>

          {permissionsGranted ? (
            <Button
              title={isBlocked ? 'Unblock Apps' : 'Block Apps'}
              variant={isBlocked ? 'success' : 'danger'}
              onPress={onToggle}
              fullWidth
              style={styles.actionButton}
            />
          ) : (
            <>
              <Button
                title="Setup Required"
                variant="primary"
                onPress={onSetupPermissions}
                fullWidth
                style={styles.actionButton}
              />
              <Text style={styles.warningText}>
                ⚠️ Permissions required for blocking
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotBlocked: {
    backgroundColor: colors.danger,
    ...shadows.glow(colors.danger),
  },
  statusDotUnblocked: {
    backgroundColor: colors.success,
    ...shadows.glow(colors.success),
  },
  content: {
    alignItems: 'flex-start',
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  statusRow: {
    marginBottom: spacing.lg,
  },
  description: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  warningText: {
    color: colors.warning,
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
    alignSelf: 'center',
  },
});

export default StatusCard;
