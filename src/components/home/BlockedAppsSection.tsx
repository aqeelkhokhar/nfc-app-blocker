import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows } from '../../styles';
import { Button, Card } from '../ui';
import { AppInfo } from '../../state/BrickContext';

interface BlockedAppsSectionProps {
  blockedApps: AppInfo[];
  onManageApps: () => void;
}

const BlockedAppsSection: React.FC<BlockedAppsSectionProps> = ({
  blockedApps,
  onManageApps,
}) => {
  const hasApps = blockedApps.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Blocked Apps</Text>
          <Text style={styles.subtitle}>
            {hasApps 
              ? `${blockedApps.length} app${blockedApps.length > 1 ? 's' : ''} selected`
              : 'No apps selected'}
          </Text>
        </View>
        {hasApps && (
          <TouchableOpacity onPress={onManageApps} activeOpacity={0.7}>
            <Text style={styles.manageLink}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>

      <Card variant="gradient" style={styles.card}>
        {!hasApps ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No Apps Selected</Text>
            <Text style={styles.emptyDescription}>
              Choose which apps to block when you enable blocking mode.
            </Text>
            <Button
              title="Select Apps"
              variant="primary"
              onPress={onManageApps}
              style={styles.selectButton}
            />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.appsList}
          >
            {blockedApps.map((app, index) => (
              <View key={app.id} style={styles.appChip}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)']}
                  style={styles.appChipGradient}
                >
                  <Text style={styles.appChipText} numberOfLines={1}>
                    {app.name}
                  </Text>
                </LinearGradient>
              </View>
            ))}
            <TouchableOpacity onPress={onManageApps} activeOpacity={0.7}>
              <View style={styles.addChip}>
                <Text style={styles.addChipText}>+ Add</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  manageLink: {
    color: colors.primary,
    ...typography.bodySmall,
    fontWeight: '600',
  },
  card: {
    minHeight: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  selectButton: {
    minWidth: 140,
  },
  appsList: {
    paddingVertical: spacing.sm,
  },
  appChip: {
    marginRight: spacing.sm,
  },
  appChipGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  appChipText: {
    color: colors.textPrimary,
    ...typography.bodySmall,
    fontWeight: '500',
    maxWidth: 120,
  },
  addChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addChipText: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
});

export default BlockedAppsSection;
