import { NativeModules, Platform } from 'react-native';
import { AppInfo } from '../../state/BrickContext';

const { InstalledAppsModule } = NativeModules as {
  InstalledAppsModule?: {
    getInstalledApps: () => Promise<any[]>;
  };
};

export type InstalledAppInfo = AppInfo & {
  icon?: string; // Base64 encoded app icon
};

export async function getInstalledApps(): Promise<InstalledAppInfo[]> {
  if (Platform.OS !== 'android' || !InstalledAppsModule) {
    return [];
  }

  try {
    const apps = await InstalledAppsModule.getInstalledApps();
    return apps as InstalledAppInfo[];
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
}
