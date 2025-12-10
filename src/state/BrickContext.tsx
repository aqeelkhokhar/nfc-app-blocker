import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { setScreenTimeBlockingEnabled } from '../platform/ios/ScreenTimeService';

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

const initialState: BrickState = {
  status: 'UNBRICKED',
  blockedApps: [],
  pairedNfcTagId: null,
  iosSelectionData: null,
};

export function BrickProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrickState>(initialState);

  const value = useMemo<BrickContextValue>(() => {
    const syncPlatforms = (next: BrickState) => {
      // iOS Screen Time shields
      if (Platform.OS === 'ios' && next.iosSelectionData) {
        setScreenTimeBlockingEnabled(next.status === 'BRICKED', next.iosSelectionData).catch(() => {
          // swallow errors for now; could hook up logging
        });
      }
      // TODO: Android accessibility service sync will go here
    };

    const setBrickStatus = (status: BrickStatus) => {
      setState(prev => {
        const next: BrickState = { ...prev, status };
        syncPlatforms(next);
        return next;
      });
      // TODO: sync to MMKV
    };

    const toggleBrick = () => {
      setBrickStatus(state.status === 'BRICKED' ? 'UNBRICKED' : 'BRICKED');
    };

    const setBlockedApps = (apps: AppInfo[]) => {
      setState(prev => {
        const next: BrickState = { ...prev, blockedApps: apps };
        syncPlatforms(next);
        return next;
      });
      // TODO: sync to MMKV
    };

    const setPairedNfcTagId = (id: string | null) => {
      setState(prev => {
        const next: BrickState = { ...prev, pairedNfcTagId: id };
        // no platform sync needed yet
        return next;
      });
      // TODO: sync to MMKV
    };

    const setIosSelectionData = (data: string | null) => {
      setState(prev => {
        const next: BrickState = { ...prev, iosSelectionData: data };
        syncPlatforms(next);
        return next;
      });
      // TODO: sync to MMKV
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

  return <BrickContext.Provider value={value}>{children}</BrickContext.Provider>;
}

export function useBrick() {
  const ctx = useContext(BrickContext);
  if (!ctx) {
    throw new Error('useBrick must be used within a BrickProvider');
  }
  return ctx;
}
