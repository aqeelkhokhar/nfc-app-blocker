import { NativeModules, Platform } from 'react-native';

const { AppBlockerModule } = NativeModules as {
  AppBlockerModule?: {
    setBlockingEnabled: (enabled: boolean) => Promise<void>;
    setBlockedPackages: (packages: string[]) => Promise<void>;
    openAccessibilitySettings: () => Promise<void>;
    getBlockedPackages: () => Promise<string[]>;
    isBlockingEnabled: () => Promise<boolean>;
  };
};

export async function setAndroidBlockingEnabled(
  enabled: boolean,
): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.setBlockingEnabled(enabled);
}

export async function setAndroidBlockedPackages(
  packages: string[],
): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.setBlockedPackages(packages);
}

export async function openAccessibilitySettings(): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return;
  await AppBlockerModule.openAccessibilitySettings();
}

export async function getAndroidBlockedPackages(): Promise<string[]> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return [];
  try {
    return await AppBlockerModule.getBlockedPackages();
  } catch (error) {
    console.error('Error getting blocked packages from native:', error);
    return [];
  }
}

export async function isAndroidBlockingEnabled(): Promise<boolean> {
  if (Platform.OS !== 'android' || !AppBlockerModule) return false;
  try {
    return await AppBlockerModule.isBlockingEnabled();
  } catch (error) {
    console.error('Error getting blocking enabled state from native:', error);
    return false;
  }
}
