import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows } from '../../styles';
import { Button, PermissionRow } from '../ui';
import { PermissionState } from '../../hooks/usePermissions';

interface PermissionsModalProps {
  visible: boolean;
  permissions: PermissionState;
  onRequestPermission: (type: 'overlay' | 'usage' | 'accessibility') => void;
  onClose: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  visible,
  permissions,
  onRequestPermission,
  onClose,
}) => {
  const allGranted = permissions.overlay && permissions.usage && permissions.accessibility;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dimBackground} />
        
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(25, 25, 45, 0.98)', 'rgba(35, 35, 60, 0.95)']}
            style={styles.card}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>

            <Text style={styles.title}>Permissions Required</Text>
            <Text style={styles.subtitle}>
              App Blocker needs these permissions to function properly:
            </Text>

            <View style={styles.permissionsList}>
              <PermissionRow
                title="Draw Over Apps"
                description="Display blocking overlay"
                isGranted={permissions.overlay}
                onPress={() => onRequestPermission('overlay')}
              />
              <PermissionRow
                title="Usage Statistics"
                description="Detect when blocked apps open"
                isGranted={permissions.usage}
                onPress={() => onRequestPermission('usage')}
              />
              <PermissionRow
                title="Accessibility Service"
                description="Intercept app launches"
                isGranted={permissions.accessibility}
                onPress={() => onRequestPermission('accessibility')}
                style={styles.lastPermission}
              />
            </View>

            <View style={styles.actions}>
              <Button
                title={allGranted ? "All Set! Continue" : "Close"}
                variant={allGranted ? 'success' : 'secondary'}
                onPress={onClose}
                fullWidth
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContainer: {
    width: '88%',
    maxWidth: 360,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: colors.textPrimary,
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionsList: {
    marginBottom: spacing.xl,
  },
  lastPermission: {
    borderBottomWidth: 0,
  },
  actions: {
    marginTop: spacing.md,
  },
});

export default PermissionsModal;
