import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows } from '../../styles';
import { Button } from '../ui';
import { NFCScanState } from '../../hooks/useNFCScanner';

interface NFCScannerModalProps {
  visible: boolean;
  scanState: NFCScanState;
  tagId: string | null;
  error: string | null;
  onCancel: () => void;
  onClose: () => void;
  onRetry: () => void;
}

const NFCScannerModal: React.FC<NFCScannerModalProps> = ({
  visible,
  scanState,
  tagId,
  error,
  onCancel,
  onClose,
  onRetry,
}) => {
  const device = useCameraDevice('back');

  const getTitle = () => {
    switch (scanState) {
      case 'success':
        return 'Tag Paired Successfully!';
      case 'error':
        return 'Unable to Read Tag';
      default:
        return 'Scan NFC Tag';
    }
  };

  const getSubtitle = () => {
    switch (scanState) {
      case 'success':
        return 'Your phone will now use this tag to toggle app blocking.';
      case 'error':
        return 'Make sure the NFC tag is compatible and try again.';
      default:
        return 'Hold your phone near the NFC tag until detected.';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Semi-transparent background */}
        <View style={styles.dimBackground} />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(25, 25, 45, 0.98)', 'rgba(35, 35, 60, 0.95)']}
            style={styles.card}
          >
            {/* Header */}
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>

            {/* Scanner Circle */}
            <View style={styles.scannerBody}>
              {scanState === 'scanning' && (
                <>
                  <View style={styles.scannerCircle}>
                    {device && (
                      <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={visible}
                      />
                    )}
                    <View style={styles.scannerOverlay}>
                      <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                    {/* Animated border */}
                    <View style={styles.scannerBorderOuter} />
                  </View>
                  <Text style={styles.statusText}>Waiting for NFC tag...</Text>
                </>
              )}

              {scanState === 'success' && (
                <>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                    style={styles.successCircle}
                  >
                    <Text style={styles.successIcon}>✓</Text>
                  </LinearGradient>
                  {tagId && (
                    <View style={styles.tagIdContainer}>
                      <Text style={styles.tagIdLabel}>Tag ID</Text>
                      <Text style={styles.tagIdValue}>{tagId}</Text>
                    </View>
                  )}
                </>
              )}

              {scanState === 'error' && (
                <>
                  <LinearGradient
                    colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                    style={styles.errorCircle}
                  >
                    <Text style={styles.errorIcon}>!</Text>
                  </LinearGradient>
                  {error && <Text style={styles.errorText}>{error}</Text>}
                </>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {scanState === 'scanning' && (
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={onCancel}
                  fullWidth
                />
              )}

              {scanState === 'success' && (
                <Button
                  title="Done"
                  variant="success"
                  onPress={onClose}
                  fullWidth
                />
              )}

              {scanState === 'error' && (
                <>
                  <Button
                    title="Try Again"
                    variant="primary"
                    onPress={onRetry}
                    fullWidth
                  />
                  <View style={styles.actionSpacer} />
                  <Button
                    title="Close"
                    variant="ghost"
                    onPress={onClose}
                    fullWidth
                  />
                </>
              )}
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
    marginBottom: spacing.xxl,
  },
  scannerBody: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  scannerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBorderOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: colors.accent,
    opacity: 0.8,
  },
  statusText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    ...typography.bodySmall,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  successIcon: {
    fontSize: 72,
    color: colors.success,
  },
  errorCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  errorIcon: {
    fontSize: 56,
    color: colors.danger,
    fontWeight: 'bold',
  },
  tagIdContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  tagIdLabel: {
    color: colors.textMuted,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  tagIdValue: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '500',
  },
  errorText: {
    marginTop: spacing.lg,
    color: colors.dangerLight,
    ...typography.bodySmall,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.md,
  },
  actionSpacer: {
    height: spacing.md,
  },
});

export default NFCScannerModal;
