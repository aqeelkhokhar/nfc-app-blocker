import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from './theme';

// Common styles that can be used across the app
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  
  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardGlass: {
    backgroundColor: colors.cardBackgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Text
  heading: {
    color: colors.textPrimary,
    ...typography.h1,
  },
  subheading: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    ...typography.h3,
    marginBottom: spacing.md,
  },
  bodyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  caption: {
    color: colors.textMuted,
    ...typography.caption,
  },
  
  // Flex utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Spacing
  mt_sm: { marginTop: spacing.sm },
  mt_md: { marginTop: spacing.md },
  mt_lg: { marginTop: spacing.lg },
  mt_xl: { marginTop: spacing.xl },
  mb_sm: { marginBottom: spacing.sm },
  mb_md: { marginBottom: spacing.md },
  mb_lg: { marginBottom: spacing.lg },
  mb_xl: { marginBottom: spacing.xl },
});
