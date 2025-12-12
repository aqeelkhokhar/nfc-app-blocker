import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

// Navigation
import { RootStackParamList } from '../navigation/RootNavigator';

// State
import { useBrick } from '../state/BrickContext';

// Hooks
import { usePermissions, useCamera, useNFCScanner } from '../hooks';

// Components
import {
  StatusCard,
  BlockedAppsSection,
  NFCControlSection,
  NFCScannerModal,
  PermissionsModal,
} from '../components/home';

// Styles
import { colors, spacing, typography } from '../styles';

// Platform services
import {
  startForegroundService,
  stopForegroundService,
} from '../platform/android/ForegroundService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // State from context
  const { status, toggleBrick, blockedApps, pairedNfcTagId } = useBrick();

  // Custom hooks
  const { permissions, allGranted, requestPermission } = usePermissions();
  const { ensurePermission: ensureCameraPermission } = useCamera();
  const {
    isSupported: nfcSupported,
    isVisible: nfcModalVisible,
    isScanning,
    scanState,
    tagId,
    error: nfcError,
    startPairing,
    cancelScanning,
    closeScanner,
    retryScanning,
  } = useNFCScanner();

  // Local state
  const [showPermissionModal, setShowPermissionModal] = useState(false);

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

  // Handlers
  const handleStartNfcPairing = async () => {
    await ensureCameraPermission();
    startPairing();
  };

  const handleManageApps = () => {
    navigation.navigate('AppSelection');
  };

  const handleToggle = () => {
    toggleBrick();
  };

  const handleRequestPermission = (type: 'overlay' | 'usage' | 'accessibility') => {
    requestPermission(type);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>App Blocker</Text>
            <Text style={styles.subtitle}>Control your digital habits</Text>
          </View>

          {/* Status Card */}
          <StatusCard
            status={status}
            permissionsGranted={Platform.OS === 'ios' || allGranted}
            onToggle={handleToggle}
            onSetupPermissions={() => setShowPermissionModal(true)}
          />

          {/* Blocked Apps Section */}
          <BlockedAppsSection
            blockedApps={blockedApps}
            onManageApps={handleManageApps}
          />

          {/* NFC Control Section */}
          <NFCControlSection
            pairedTagId={pairedNfcTagId}
            isSupported={nfcSupported}
            isScanning={isScanning}
            onPairTag={handleStartNfcPairing}
          />
        </ScrollView>
      </SafeAreaView>

      {/* NFC Scanner Modal */}
      <NFCScannerModal
        visible={nfcModalVisible}
        scanState={scanState}
        tagId={tagId}
        error={nfcError}
        onCancel={cancelScanning}
        onClose={closeScanner}
        onRetry={retryScanning}
      />

      {/* Permissions Modal (Android only) */}
      {Platform.OS === 'android' && (
        <PermissionsModal
          visible={showPermissionModal}
          permissions={permissions}
          onRequestPermission={handleRequestPermission}
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
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
});

export default HomeScreen;
