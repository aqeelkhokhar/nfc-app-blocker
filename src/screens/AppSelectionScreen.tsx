import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBrick, AppInfo } from '../state/BrickContext';
import {
  openScreenTimePicker,
  requestScreenTimeAuthorization,
  ScreenTimeAuthorizationStatus,
} from '../platform/ios/ScreenTimeService';
import { hasUsageStatsPermission } from '../platform/android/UsageStatsService';
import {
  hasOverlayPermission,
  requestOverlayPermission,
  hasUsageStatsPermission as checkUsageStats,
  requestUsageStatsPermission,
  hasAccessibilityPermission,
  requestAccessibilityPermission,
  checkAllPermissions,
} from '../platform/android/PermissionsService';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSelection'>;

const AppSelectionScreen: React.FC<Props> = () => {
  const {
    iosSelectionData,
    setIosSelectionData,
    status,
    blockedApps,
    setBlockedApps,
  } = useBrick();
  const [authStatus, setAuthStatus] =
    useState<ScreenTimeAuthorizationStatus>('unknown');
  const [loading, setLoading] = useState(false);
  const [packageInput, setPackageInput] = useState('');

  if (Platform.OS === 'android') {
    const [installedApps, setInstalledApps] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [permissions, setPermissions] = useState({
      overlay: false,
      usage: false,
      accessibility: false,
    });
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const {
      getInstalledApps,
    } = require('../platform/android/InstalledAppsService');

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

      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          checkPermissionsStatus();
        }
      });

      loadApps();
      checkPermissionsStatus();

      return () => {
        subscription.remove();
      };
    }, [checkPermissionsStatus]);

    const checkPermissionsStatus = useCallback(async () => {
      const permissionStatus = await checkAllPermissions();
      setPermissions(permissionStatus);

      if (
        permissionStatus.overlay &&
        permissionStatus.usage &&
        permissionStatus.accessibility
      ) {
        setShowPermissionPrompt(false);
      }
    }, []);

    const requestPermission = async (
      type: 'overlay' | 'usage' | 'accessibility',
    ) => {
      try {
        let granted = false;

        switch (type) {
          case 'overlay':
            granted = await requestOverlayPermission();
            break;
          case 'usage':
            granted = await requestUsageStatsPermission();
            break;
          case 'accessibility':
            granted = await requestAccessibilityPermission();
            break;
        }

        await checkPermissionsStatus();
        return granted;
      } catch (error) {
        console.error(`Error requesting ${type} permission:`, error);
        return false;
      }
    };

    const filteredApps = React.useMemo(() => {
      if (!searchQuery.trim()) return installedApps;

      const lowerQuery = searchQuery.toLowerCase();
      return installedApps.filter(
        app =>
          app.name.toLowerCase().includes(lowerQuery) ||
          app.id.toLowerCase().includes(lowerQuery),
      );
    }, [installedApps, searchQuery]);

    const isAppBlocked = (appId: string) => {
      return blockedApps.some(app => app.id === appId);
    };

    const toggleAppBlock = (app: any) => {
      if (isAppBlocked(app.id)) {
        // Remove from blocked apps
        setBlockedApps(
          blockedApps.filter(blockedApp => blockedApp.id !== app.id),
        );
      } else {
        // Add to blocked apps
        setBlockedApps([
          ...blockedApps,
          {
            id: app.id,
            name: app.name,
            platform: 'android',
          },
        ]);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Apps to Block</Text>

        <Text style={styles.paragraph}>
          Select apps below that should be blocked when brick is activated.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search apps..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Text style={styles.label}>
          {loading
            ? 'Loading apps...'
            : `Select apps to block (${
                blockedApps.filter(a => a.platform === 'android').length
              } selected)`}
        </Text>

        <View style={{ flex: 1, marginTop: 10 }}>
          {loading ? (
            <Text>Loading installed apps...</Text>
          ) : filteredApps.length === 0 ? (
            <Text>No apps found</Text>
          ) : (
            <ScrollView>
              {filteredApps.map(app => (
                <View key={app.id} style={styles.appItem}>
                  {app.icon ? (
                    <Image source={{ uri: app.icon }} style={styles.appIcon} />
                  ) : (
                    <View
                      style={[styles.appIcon, { backgroundColor: '#ddd' }]}
                    />
                  )}
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{app.name}</Text>
                    <Text style={styles.appId}>{app.id}</Text>
                  </View>
                  <View style={styles.checkbox}>
                    <Button
                      title={isAppBlocked(app.id) ? 'Unblock' : 'Block'}
                      onPress={() => toggleAppBlock(app)}
                      color={isAppBlocked(app.id) ? '#f44336' : '#2196F3'}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Permission prompt dialog */}
        {showPermissionPrompt && (
          <View style={styles.permissionOverlay}>
            <View style={styles.permissionDialog}>
              <Text style={styles.permissionDialogTitle}>
                Permissions Required
              </Text>

              <Text style={styles.permissionDialogText}>
                App Blocker needs these permissions to function properly:
              </Text>

              {/* Only show permissions that haven't been granted yet */}
              {!permissions.overlay && (
                <View style={styles.permissionRow}>
                  <View style={styles.permissionStatus} />
                  <Text style={styles.permissionText}>Draw Over Apps</Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={() => requestPermission('overlay')}
                  >
                    <Text style={styles.permissionButtonText}>Allow</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!permissions.usage && (
                <View style={styles.permissionRow}>
                  <View style={styles.permissionStatus} />
                  <Text style={styles.permissionText}>Usage Statistics</Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={() => requestPermission('usage')}
                  >
                    <Text style={styles.permissionButtonText}>Allow</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!permissions.accessibility && (
                <View style={styles.permissionRow}>
                  <View style={styles.permissionStatus} />
                  <Text style={styles.permissionText}>
                    Accessibility Service
                  </Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={() => requestPermission('accessibility')}
                  >
                    <Text style={styles.permissionButtonText}>Allow</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* All permissions granted */}
              {permissions.overlay &&
              permissions.usage &&
              permissions.accessibility ? (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPermissionPrompt(false)}
                >
                  <Text style={styles.closeButtonText}>All Set! Continue</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.permissionNote}>
                  These permissions are required for app blocking to work
                  properly.
                </Text>
              )}

              {/* Show close button even if not all permissions granted */}
              {(permissions.overlay ||
                permissions.usage ||
                permissions.accessibility) &&
                !(
                  permissions.overlay &&
                  permissions.usage &&
                  permissions.accessibility
                ) && (
                  <TouchableOpacity
                    style={styles.laterButton}
                    onPress={() => setShowPermissionPrompt(false)}
                  >
                    <Text style={styles.laterButtonText}>
                      Continue (Not All Permissions Granted)
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        )}
      </View>
    );
  }

  const handleRequestAuthorization = async () => {
    try {
      setLoading(true);
      const statusResult = await requestScreenTimeAuthorization();
      setAuthStatus(statusResult);
      if (statusResult !== 'approved') {
        Alert.alert(
          'Screen Time not approved',
          'Go to Settings → Screen Time → App Limits / Content & Privacy to ensure this app is allowed to manage Screen Time.',
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
      if (!selectionBase64) {
        return;
      }
      setIosSelectionData(selectionBase64);
      Alert.alert(
        'Selection saved',
        'Your Screen Time selection has been stored locally.',
      );
    } catch {
      Alert.alert('Error', 'Failed to open Screen Time picker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Screen Time Setup</Text>
      <Text style={styles.paragraph}>
        This screen configures which apps iOS Screen Time should block when the
        Brick state is enabled.
      </Text>

      <Text style={styles.label}>Current Screen Time authorization:</Text>
      <Text style={styles.value}>{authStatus}</Text>

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Requesting…' : 'Request Screen Time Authorization'}
          onPress={handleRequestAuthorization}
          disabled={loading}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Opening picker…' : 'Choose Apps to Block'}
          onPress={handleOpenPicker}
          disabled={loading}
        />
      </View>

      <Text style={styles.label}>Stored iOS selection:</Text>
      <Text style={styles.value}>
        {iosSelectionData ? 'Configured' : 'Not configured yet'}
      </Text>

      <Text style={styles.label}>Current brick state:</Text>
      <Text style={styles.value}>{status}</Text>

      <Text style={styles.paragraphSmall}>
        When you toggle Brick on the Home screen, the app will ask iOS to apply
        or remove Screen Time shields based on your selected apps.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 16,
  },
  paragraphSmall: {
    fontSize: 12,
    marginTop: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    marginTop: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  appInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
  },
  appId: {
    fontSize: 12,
    color: '#777',
  },
  checkbox: {
    width: 80,
  },
  advancedSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: '#888',
    marginBottom: 12,
  },
  settingsButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#555',
  },
  settingsButtonEnabled: {
    backgroundColor: '#e0f2e9',
  },
  permissionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  permissionDialog: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionDialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionDialogText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  permissionStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  permissionGranted: {
    backgroundColor: '#43a047',
  },
  permissionDenied: {
    backgroundColor: '#e53935',
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  permissionNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#43a047',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  laterButton: {
    backgroundColor: '#9e9e9e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 12,
    alignSelf: 'center',
  },
  laterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AppSelectionScreen;
