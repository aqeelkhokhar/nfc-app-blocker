import { NativeModules, Platform } from 'react-native';

const { ScreenTimeModule } = NativeModules as {
  ScreenTimeModule?: {
    requestAuthorization: () => Promise<string>;
    presentPicker: () => Promise<string | null>; // returns base64 of FamilyActivitySelection or null if cancelled
    setBlockingEnabled: (enabled: boolean, selectionData: string) => Promise<void>;
  };
};

export type ScreenTimeAuthorizationStatus =
  | 'approved'
  | 'denied'
  | 'notDetermined'
  | 'restricted'
  | 'unknown';

export async function requestScreenTimeAuthorization(): Promise<ScreenTimeAuthorizationStatus> {
  if (Platform.OS !== 'ios' || !ScreenTimeModule?.requestAuthorization) {
    return 'unknown';
  }

  const status = await ScreenTimeModule.requestAuthorization();
  return status as ScreenTimeAuthorizationStatus;
}

export async function openScreenTimePicker(): Promise<string | null> {
  if (Platform.OS !== 'ios' || !ScreenTimeModule?.presentPicker) {
    return null;
  }

  const result = await ScreenTimeModule.presentPicker();

  if (!result || typeof result !== 'string') {
    return null;
  }

  return result;
}

export async function setScreenTimeBlockingEnabled(
  enabled: boolean,
  selectionBase64: string,
): Promise<void> {
  if (Platform.OS !== 'ios' || !ScreenTimeModule?.setBlockingEnabled) {
    return;
  }

  await ScreenTimeModule.setBlockingEnabled(enabled, selectionBase64);
}
