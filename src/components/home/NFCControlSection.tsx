import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows } from '../../styles';
import { Button, Card } from '../ui';

interface NFCControlSectionProps {
  pairedTagId: string | null | undefined;
  isSupported: boolean;
  isScanning: boolean;
  onPairTag: () => void;
}

const NFCControlSection: React.FC<NFCControlSectionProps> = ({
  pairedTagId,
  isSupported,
  isScanning,
  onPairTag,
}) => {
  const isPaired = !!pairedTagId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NFC Control</Text>
        <Text style={styles.subtitle}>Quick toggle with NFC tag</Text>
      </View>

      <Card variant="gradient">
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={isPaired 
                ? ['rgba(34, 211, 238, 0.2)', 'rgba(34, 211, 238, 0.1)']
                : ['rgba(113, 113, 122, 0.2)', 'rgba(113, 113, 122, 0.1)']}
              style={styles.iconBg}
            >
              <Text style={styles.icon}>📡</Text>
            </LinearGradient>
          </View>

          <View style={styles.textContent}>
            <Text style={styles.statusTitle}>
              {isPaired ? 'Tag Paired' : 'No Tag Paired'}
            </Text>
            <Text style={styles.description}>
              {isPaired 
                ? 'Tap your NFC tag to quickly toggle app blocking on/off.'
                : 'Pair an NFC tag to toggle blocking without opening the app.'}
            </Text>
          </View>

          {isPaired && (
            <View style={styles.tagIdBadge}>
              <Text style={styles.tagIdLabel}>Tag ID</Text>
              <Text style={styles.tagIdValue} numberOfLines={1}>
                {pairedTagId}
              </Text>
            </View>
          )}

          <Button
            title={isScanning ? 'Scanning...' : isPaired ? 'Re-Pair Tag' : 'Pair NFC Tag'}
            variant={isPaired ? 'secondary' : 'primary'}
            onPress={onPairTag}
            disabled={!isSupported || isScanning}
            loading={isScanning}
            fullWidth
            style={styles.pairButton}
          />

          {!isSupported && (
            <Text style={styles.unsupportedText}>
              NFC is not supported on this device
            </Text>
          )}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    ...typography.h3,
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  icon: {
    fontSize: 36,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusTitle: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  tagIdBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    maxWidth: '100%',
  },
  tagIdLabel: {
    color: colors.textMuted,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  tagIdValue: {
    color: colors.accent,
    ...typography.bodySmall,
    fontWeight: '500',
  },
  pairButton: {
    marginTop: spacing.sm,
  },
  unsupportedText: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.md,
  },
});

export default NFCControlSection;
