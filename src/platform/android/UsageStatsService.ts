import { NativeModules, Platform } from 'react-native';

const { UsageStatsModule } = NativeModules as {
  UsageStatsModule?: {
    checkPermission: () => Promise<boolean>;
    openUsageAccessSettings: () => Promise<boolean>;
    getForegroundApp: () => Promise<string | null>;
  };
};

export async function hasUsageStatsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return false;
  }

  try {
    return await UsageStatsModule.checkPermission();
  } catch (error) {
    console.error('Error checking usage stats permission:', error);
    return false;
  }
}

export async function openUsageAccessSettings(): Promise<boolean> {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return false;
  }

  try {
    return await UsageStatsModule.openUsageAccessSettings();
  } catch (error) {
    console.error('Error opening usage access settings:', error);
    return false;
  }
}

export async function getForegroundApp(): Promise<string | null> {
  if (Platform.OS !== 'android' || !UsageStatsModule) {
    return null;
  }

  try {
    return await UsageStatsModule.getForegroundApp();
  } catch (error) {
    console.error('Error getting foreground app:', error);
    return null;
  }
}
