import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// Navigation
import { RootStackParamList } from '../navigation/RootNavigator';

// State
import { useBrick, AppInfo } from '../state/BrickContext';

// Styles
import { colors, spacing, borderRadius, typography } from '../styles';

// Components
import { Button, Card } from '../components/ui';

// Hooks
// Force update
import { usePermissions } from '../hooks';

// iOS Services
import {
  openScreenTimePicker,
  requestScreenTimeAuthorization,
  ScreenTimeAuthorizationStatus,
} from '../platform/ios/ScreenTimeService';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSelection'>;

// ============================================
// Android App Selection Component
// ============================================
const AndroidAppSelection: React.FC<{
  blockedApps: AppInfo[];
  setBlockedApps: (apps: AppInfo[]) => void;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppSelection'>;
}> = ({ blockedApps, setBlockedApps, navigation }) => {
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { getInstalledApps } = require('../platform/android/InstalledAppsService');

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);
      try {
        const apps = await getInstalledApps();
        setInstalledApps(apps);
      } catch (error) {
        Alert.alert('Error', 'Failed to load installed apps');
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return installedApps;
    const lowerQuery = searchQuery.toLowerCase();
    return installedApps.filter(
      (app: any) =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.id.toLowerCase().includes(lowerQuery)
    );
  }, [installedApps, searchQuery]);

  const isAppBlocked = (appId: string) => {
    return blockedApps.some(app => app.id === appId);
  };

  const toggleAppBlock = (app: any) => {
    if (isAppBlocked(app.id)) {
      setBlockedApps(blockedApps.filter(blockedApp => blockedApp.id !== app.id));
    } else {
      setBlockedApps([
        ...blockedApps,
        { id: app.id, name: app.name, platform: 'android' },
      ]);
    }
  };

  const selectedCount = blockedApps.filter(a => a.platform === 'android').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Apps</Text>
          <Text style={styles.subtitle}>
            Choose apps to block when blocking is enabled
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {loading ? 'Loading apps...' : `${selectedCount} app${selectedCount !== 1 ? 's' : ''} selected`}
          </Text>
        </View>

        {/* App List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            selectedCount > 0 && styles.scrollContentWithFooter
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading installed apps...</Text>
            </View>
          ) : filteredApps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No apps found</Text>
            </View>
          ) : (
            filteredApps.map((app: any) => (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.appItem,
                  isAppBlocked(app.id) && styles.appItemSelected,
                ]}
                onPress={() => toggleAppBlock(app)}
                activeOpacity={0.7}
              >
                <View style={styles.appIconContainer}>
                  {app.icon ? (
                    <Image source={{ uri: app.icon }} style={styles.appIcon} />
                  ) : (
                    <View style={styles.appIconPlaceholder}>
                      <Text style={styles.appIconPlaceholderText}>
                        {app.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName} numberOfLines={1}>
                    {app.name}
                  </Text>
                  <Text style={styles.appId} numberOfLines={1}>
                    {app.id}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    isAppBlocked(app.id) && styles.checkboxSelected,
                  ]}
                >
                  {isAppBlocked(app.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Floating Done Button Footer */}
        {selectedCount > 0 && (
          <View style={styles.footer}>
             <Button 
               title="Done" 
               variant="primary" 
               onPress={() => navigation.goBack()} 
               fullWidth
             />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

// ============================================
// iOS Screen Time Setup Component
// ============================================
const IOSScreenTimeSetup: React.FC<{
  iosSelectionData: string | null;
  setIosSelectionData: (data: string | null) => void;
  status: string;
}> = ({ iosSelectionData, setIosSelectionData, status }) => {
  const [authStatus, setAuthStatus] = useState<ScreenTimeAuthorizationStatus>('unknown');
  const [loading, setLoading] = useState(false);

  const handleRequestAuthorization = async () => {
    try {
      setLoading(true);
      const statusResult = await requestScreenTimeAuthorization();
      setAuthStatus(statusResult);
      if (statusResult !== 'approved') {
        Alert.alert(
          'Screen Time not approved',
          'Go to Settings → Screen Time → App Limits / Content & Privacy to ensure this app is allowed to manage Screen Time.'
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to request Screen Time authorization.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPicker = async () => {
    try {
      setLoading(true);
      const selectionBase64 = await openScreenTimePicker();
      if (!selectionBase64) return;
      setIosSelectionData(selectionBase64);
      Alert.alert('Selection saved', 'Your Screen Time selection has been stored.');
    } catch {
      Alert.alert('Error', 'Failed to open Screen Time picker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.iosScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Screen Time Setup</Text>
            <Text style={styles.subtitle}>
              Configure which apps iOS should block when enabled
            </Text>
          </View>

          {/* Authorization Card */}
          <Card variant="gradient" style={styles.iosCard}>
            <View style={styles.iosCardContent}>
              <Text style={styles.iosCardIcon}>🔐</Text>
              <Text style={styles.iosCardTitle}>Authorization Status</Text>
              <View style={styles.iosStatusBadge}>
                <Text style={styles.iosStatusText}>{authStatus}</Text>
              </View>
              <Button
                title={loading ? 'Requesting...' : 'Request Authorization'}
                variant="primary"
                onPress={handleRequestAuthorization}
                disabled={loading}
                fullWidth
                style={styles.iosButton}
              />
            </View>
          </Card>

          {/* App Selection Card */}
          <Card variant="gradient" style={styles.iosCard}>
            <View style={styles.iosCardContent}>
              <Text style={styles.iosCardIcon}>📱</Text>
              <Text style={styles.iosCardTitle}>App Selection</Text>
              <View style={styles.iosStatusBadge}>
                <Text style={styles.iosStatusText}>
                  {iosSelectionData ? 'Configured' : 'Not configured'}
                </Text>
              </View>
              <Button
                title={loading ? 'Opening...' : 'Choose Apps to Block'}
                variant="primary"
                onPress={handleOpenPicker}
                disabled={loading}
                fullWidth
                style={styles.iosButton}
              />
            </View>
          </Card>

          {/* Info Card */}
          <Card variant="glass" style={styles.iosCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                When you toggle blocking on the Home screen, the app will ask iOS to 
                apply or remove Screen Time shields based on your selected apps.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================
// Main Component
// ============================================
const AppSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const {
    iosSelectionData,
    setIosSelectionData,
    status,
    blockedApps,
    setBlockedApps,
  } = useBrick();

  if (Platform.OS === 'android') {
    return (
      <AndroidAppSelection
        blockedApps={blockedApps}
        setBlockedApps={setBlockedApps}
        navigation={navigation}
      />
    );
  }

  return (
    <IOSScreenTimeSetup
      iosSelectionData={iosSelectionData || null}
      setIosSelectionData={setIosSelectionData}
      status={status}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    ...typography.h1,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  countText: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  scrollContentWithFooter: {
    paddingBottom: spacing.xxxl + 80, // Add extra padding for footer
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(19, 20, 31, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  emptyContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  appIconContainer: {
    marginRight: spacing.md,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
  },
  appIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconPlaceholderText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '500',
  },
  appId: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // iOS Styles
  iosScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  iosCard: {
    marginBottom: spacing.lg,
  },
  iosCardContent: {
    alignItems: 'center',
  },
  iosCardIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  iosCardTitle: {
    color: colors.textPrimary,
    ...typography.h3,
    marginBottom: spacing.md,
  },
  iosStatusBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    marginBottom: spacing.lg,
  },
  iosStatusText: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    textTransform: 'capitalize',
  },
  iosButton: {
    marginTop: spacing.sm,
  },
  infoContent: {
    padding: spacing.sm,
  },
  infoTitle: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    lineHeight: 22,
  },
});

export default AppSelectionScreen;
