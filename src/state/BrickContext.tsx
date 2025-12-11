import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Platform, Alert } from 'react-native';
import { setScreenTimeBlockingEnabled } from '../platform/ios/ScreenTimeService';
import {
  setAndroidBlockingEnabled,
  setAndroidBlockedPackages,
  getAndroidBlockedPackages,
  isAndroidBlockingEnabled,
} from '../platform/android/AppBlockerService';
import { checkAllPermissions } from '../platform/android/PermissionsService';
import { getJson, setJson, getString, setString } from '../storage/mmkv';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type BrickStatus = 'BRICKED' | 'UNBRICKED';

export interface AppInfo {
  id: string; // bundleId on iOS, packageName on Android
  name: string;
  platform: 'ios' | 'android';
}

export interface BrickState {
  status: BrickStatus;
  blockedApps: AppInfo[];
  pairedNfcTagId?: string | null;
  // iOS-only: base64-encoded FamilyActivitySelection from Screen Time picker
  iosSelectionData?: string | null;
}

interface BrickContextValue extends BrickState {
  toggleBrick: () => void;
  setBrickStatus: (status: BrickStatus) => void;
  setBlockedApps: (apps: AppInfo[]) => void;
  setPairedNfcTagId: (id: string | null) => void;
  setIosSelectionData: (data: string | null) => void;
}

const BrickContext = createContext<BrickContextValue | undefined>(undefined);

function loadInitialState(): BrickState {
  try {
    return {
      status:
        (getString(STORAGE_KEYS.BRICK_STATUS) as BrickStatus) ?? 'UNBRICKED',
      blockedApps: getJson<AppInfo[]>(STORAGE_KEYS.BLOCKED_APPS) ?? [],
      pairedNfcTagId: getString(STORAGE_KEYS.NFC_TAG_ID),
      iosSelectionData: getString(STORAGE_KEYS.IOS_SELECTION),
    };
  } catch {
    return {
      status: 'UNBRICKED',
      blockedApps: [],
      pairedNfcTagId: null,
      iosSelectionData: null,
    };
  }
}

export function BrickProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrickState>(loadInitialState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;

    const hydrateFromNative = async () => {
      try {
        const [enabled, nativePackages] = await Promise.all([
          isAndroidBlockingEnabled(),
          getAndroidBlockedPackages(),
        ]);

        if (cancelled) return;

        if (!enabled && nativePackages.length === 0) {
          return;
        }

        let androidBlockedApps: AppInfo[] = nativePackages.map(id => ({
          id,
          name: id,
          platform: 'android',
        }));

        try {
          const {
            getInstalledApps,
          } = require('../platform/android/InstalledAppsService');
          const installedApps = await getInstalledApps();
          if (cancelled) return;
          androidBlockedApps = nativePackages.map(id => {
            const match = installedApps.find((a: any) => a.id === id);
            return {
              id,
              name: match?.name ?? id,
              platform: 'android',
            };
          });
        } catch {
          // If we can't resolve app names, fall back to package IDs as names
        }

        setState(prev => {
          const nonAndroid = prev.blockedApps.filter(
            a => a.platform !== 'android',
          );
          const next: BrickState = {
            ...prev,
            status: enabled ? 'BRICKED' : prev.status,
            blockedApps: [...nonAndroid, ...androidBlockedApps],
          };
          setJson(STORAGE_KEYS.BLOCKED_APPS, next.blockedApps);
          return next;
        });
      } catch {
        // Ignore native hydration errors to avoid breaking UI
      }
    };

    hydrateFromNative();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<BrickContextValue>(() => {
    const syncPlatforms = (next: BrickState) => {
      if (Platform.OS === 'ios' && next.iosSelectionData) {
        setScreenTimeBlockingEnabled(
          next.status === 'BRICKED',
          next.iosSelectionData,
        ).catch(() => {});
      }
      if (Platform.OS === 'android') {
        setAndroidBlockingEnabled(next.status === 'BRICKED').catch(() => {});
        const packages = next.blockedApps
          .filter(a => a.platform === 'android')
          .map(a => a.id);
        setAndroidBlockedPackages(packages).catch(() => {});
      }
    };

    const setBrickStatus = (status: BrickStatus) => {
      setState(prev => {
        const next: BrickState = { ...prev, status };
        syncPlatforms(next);
        setString(STORAGE_KEYS.BRICK_STATUS, status);
        return next;
      });
    };

    const toggleBrick = async () => {
      // For Android, check permissions before enabling blocking
      if (Platform.OS === 'android' && state.status !== 'BRICKED') {
        // Only check permissions when trying to enable blocking
        const permissions = await checkAllPermissions();

        if (
          !permissions.overlay ||
          !permissions.usage ||
          !permissions.accessibility
        ) {
          Alert.alert(
            'Permissions Required',
            'Please grant all required permissions before enabling blocking',
            [{ text: 'OK', onPress: () => {} }],
          );
          return;
        }
      }

      // If permissions are OK, or we're disabling blocking, or we're on iOS, proceed
      setBrickStatus(state.status === 'BRICKED' ? 'UNBRICKED' : 'BRICKED');
    };

    const setBlockedApps = (apps: AppInfo[]) => {
      setState(prev => {
        const next: BrickState = { ...prev, blockedApps: apps };
        syncPlatforms(next);
        setJson(STORAGE_KEYS.BLOCKED_APPS, apps);
        return next;
      });
    };

    const setPairedNfcTagId = (id: string | null) => {
      setState(prev => {
        const next: BrickState = { ...prev, pairedNfcTagId: id };
        setString(STORAGE_KEYS.NFC_TAG_ID, id);
        return next;
      });
    };

    const setIosSelectionData = (data: string | null) => {
      setState(prev => {
        const next: BrickState = { ...prev, iosSelectionData: data };
        syncPlatforms(next);
        setString(STORAGE_KEYS.IOS_SELECTION, data);
        return next;
      });
    };

    return {
      ...state,
      toggleBrick,
      setBrickStatus,
      setBlockedApps,
      setPairedNfcTagId,
      setIosSelectionData,
    };
  }, [state]);

  return (
    <BrickContext.Provider value={value}>{children}</BrickContext.Provider>
  );
}

export function useBrick() {
  const ctx = useContext(BrickContext);
  if (!ctx) {
    throw new Error('useBrick must be used within a BrickProvider');
  }
  return ctx;
}
