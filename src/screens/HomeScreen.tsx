import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBrick } from '../state/BrickContext';
import { useNFC } from '../nfc/useNFC';
import { readNFCTag, cancelNFC } from '../nfc/NFCService';
import {
  startForegroundService,
  stopForegroundService,
} from '../platform/android/ForegroundService';
import {
  hasOverlayPermission,
  requestOverlayPermission,
  hasUsageStatsPermission as checkUsageStats,
  requestUsageStatsPermission,
  hasAccessibilityPermission,
  requestAccessibilityPermission,
  checkAllPermissions,
} from '../platform/android/PermissionsService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const {
    status,
    toggleBrick,
    blockedApps,
    pairedNfcTagId,
    setPairedNfcTagId,
  } = useBrick();
  const { isSupported, startScanning } = useNFC();
  const [scanning, setScanning] = useState(false);
  const [permissions, setPermissions] = useState({
    overlay: false,
    usage: false,
    accessibility: false,
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Check permissions on mount, app focus, and when status changes
  useEffect(() => {
    if (Platform.OS === 'android') {
      checkPermissionsStatus();

      // Set up focus listener
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          // App has come to the foreground
          checkPermissionsStatus();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [status]);

  const checkPermissionsStatus = async () => {
    if (Platform.OS === 'android') {
      const permStatus = await checkAllPermissions();
      setPermissions(permStatus);
      setPermissionsGranted(
        permStatus.overlay && permStatus.usage && permStatus.accessibility,
      );
    }
  };

  const requestPermission = async (
    type: 'overlay' | 'usage' | 'accessibility',
  ) => {
    try {
      switch (type) {
        case 'overlay':
          await requestOverlayPermission();
          break;
        case 'usage':
          await requestUsageStatsPermission();
          break;
        case 'accessibility':
          await requestAccessibilityPermission();
          break;
      }

      // Check permissions again after request
      await checkPermissionsStatus();
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
    }
  };

  // Start/stop foreground service when brick status changes
  useEffect(() => {
    if (Platform.OS === 'android') {
      const toggleService = async () => {
        if (status === 'BRICKED') {
          await startForegroundService();
        } else {
          await stopForegroundService();
        }
      };
      toggleService();
    }
    return () => {
      if (Platform.OS === 'android') {
        stopForegroundService();
      }
    };
  }, [status]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>App Blocker</Text>
        <Text style={styles.subtitle}>Control your digital habits</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <View style={styles.statusDisplay}>
          <Text
            style={[
              styles.statusText,
              status === 'BRICKED' ? styles.bricked : styles.unbricked,
            ]}
          >
            {status === 'BRICKED' ? 'BLOCKED' : 'UNBLOCKED'}
          </Text>
          {Platform.OS === 'android' && !permissionsGranted ? (
            <TouchableOpacity
              style={[styles.toggleButton, styles.warningButton]}
              onPress={() => setShowPermissionModal(true)}
            >
              <Text style={styles.toggleButtonText}>Setup Required</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.toggleButton,
                status === 'BRICKED'
                  ? styles.unblockButton
                  : styles.blockButton,
              ]}
              onPress={toggleBrick}
            >
              <Text style={styles.toggleButtonText}>
                {status === 'BRICKED' ? 'Unblock Apps' : 'Block Apps'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {Platform.OS === 'android' && !permissionsGranted && (
          <Text style={styles.warningText}>
            Permissions required for blocking
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Blocked Apps</Text>
        {blockedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No apps selected for blocking
            </Text>
            <TouchableOpacity
              style={styles.selectAppsButton}
              onPress={() => navigation.navigate('AppSelection')}
            >
              <Text style={styles.selectAppsButtonText}>
                Select Apps to Block
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.blockedAppsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.blockedAppsList}
            >
              {blockedApps.map(app => (
                <View key={app.id} style={styles.blockedAppItem}>
                  <Text style={styles.blockedAppName} numberOfLines={1}>
                    {app.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AppSelection')}
            >
              <Text style={styles.actionButtonText}>Manage Apps</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>NFC Control</Text>
        <Text style={styles.paragraph}>
          Scan your NFC tag to instantly toggle blocking on/off without opening
          the app.
        </Text>

        <View style={styles.nfcStatus}>
          <Text style={styles.nfcStatusText}>
            {pairedNfcTagId ? 'Tag paired: Ready to use' : 'No NFC tag paired'}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            disabled={!isSupported || scanning}
            onPress={async () => {
              setScanning(true);
              Alert.alert('Scan NFC Tag', 'Hold your phone near the NFC tag');
              const tagId = await readNFCTag();
              setScanning(false);
              if (tagId) {
                setPairedNfcTagId(tagId);
                Alert.alert('Success', `Tag paired: ${tagId}`);
                startScanning(); // Auto-enable scanning after pairing
              } else {
                Alert.alert('Failed', 'Could not read NFC tag');
              }
            }}
          >
            <Text style={styles.actionButtonText}>
              {scanning
                ? 'Scanning...'
                : pairedNfcTagId
                ? 'Re-Pair Tag'
                : 'Pair NFC Tag'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Permission Modal */}
      {showPermissionModal && Platform.OS === 'android' && (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionDialog}>
            <Text style={styles.permissionDialogTitle}>
              Permissions Required
            </Text>

            <Text style={styles.permissionDialogText}>
              App Blocker needs these permissions to function properly:
            </Text>

            {!permissions.overlay && (
              <View style={styles.permissionRow}>
                <View
                  style={[styles.permissionStatus, styles.permissionDenied]}
                />
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
                <View
                  style={[styles.permissionStatus, styles.permissionDenied]}
                />
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
                <View
                  style={[styles.permissionStatus, styles.permissionDenied]}
                />
                <Text style={styles.permissionText}>Accessibility Service</Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => requestPermission('accessibility')}
                >
                  <Text style={styles.permissionButtonText}>Allow</Text>
                </TouchableOpacity>
              </View>
            )}

            {permissions.overlay &&
            permissions.usage &&
            permissions.accessibility ? (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.closeButtonText}>All Set! Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bricked: {
    color: '#e53935',
  },
  unbricked: {
    color: '#43a047',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  blockButton: {
    backgroundColor: '#e53935',
  },
  unblockButton: {
    backgroundColor: '#43a047',
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  blockedAppsContainer: {
    marginBottom: 16,
  },
  blockedAppsList: {
    marginBottom: 16,
  },
  blockedAppItem: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  blockedAppName: {
    fontSize: 14,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nfcStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nfcStatusText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 8,
    textAlign: 'center',
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
});

export default HomeScreen;
