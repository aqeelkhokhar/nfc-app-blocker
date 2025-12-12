import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import {
  hasOverlayPermission,
  requestOverlayPermission,
  hasUsageStatsPermission as checkUsageStats,
  requestUsageStatsPermission,
  hasAccessibilityPermission,
  requestAccessibilityPermission,
  checkAllPermissions,
} from '../platform/android/PermissionsService';

export interface PermissionState {
  overlay: boolean;
  usage: boolean;
  accessibility: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    overlay: false,
    usage: false,
    accessibility: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissionsStatus = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setPermissions({ overlay: true, usage: true, accessibility: true });
      setIsLoading(false);
      return;
    }

    try {
      const permStatus = await checkAllPermissions();
      setPermissions(permStatus);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissionsStatus();

    if (Platform.OS === 'android') {
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          checkPermissionsStatus();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [checkPermissionsStatus]);

  const requestPermission = useCallback(async (
    type: 'overlay' | 'usage' | 'accessibility'
  ): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

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
  }, [checkPermissionsStatus]);

  const allGranted = permissions.overlay && permissions.usage && permissions.accessibility;

  return {
    permissions,
    isLoading,
    allGranted,
    requestPermission,
    refreshPermissions: checkPermissionsStatus,
  };
}
