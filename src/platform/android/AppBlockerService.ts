import { NativeModules, Platform } from 'react-native';

const { AppBlockerModule } = NativeModules as {
  AppBlockerModule?: {
    setBlockingEnabled: (enabled: boolean) => Promise<void>;
    setBlockedPackages: (packages: string[]) => Promise<void>;
    openAccessibilitySettings: () => Promise<void>;
  };
};

export async function setAndroidBlockingEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.setBlockingEnabled(enabled);
}

export async function setAndroidBlockedPackages(packages: string[]): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.setBlockedPackages(packages);
}

export async function openAccessibilitySettings(): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.openAccessibilitySettings();
}
