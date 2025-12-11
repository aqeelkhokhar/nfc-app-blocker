import { NativeModules, Platform } from 'react-native';

const { BlockOverlayModule } = NativeModules as {
  BlockOverlayModule?: {
    showOverlay: (packageName: string, appName: string) => Promise<boolean>;
    hideOverlay: () => Promise<boolean>;
  };
};

export async function showBlockOverlay(
  packageName: string,
  appName: string,
): Promise<boolean> {
  if (Platform.OS !== 'android' || !BlockOverlayModule) {
    return false;
  }

  try {
    return await BlockOverlayModule.showOverlay(packageName, appName);
  } catch (error) {
    console.error('Error showing block overlay:', error);
    return false;
  }
}

export async function hideBlockOverlay(): Promise<boolean> {
  if (Platform.OS !== 'android' || !BlockOverlayModule) {
    return false;
  }

  try {
    return await BlockOverlayModule.hideOverlay();
  } catch (error) {
    console.error('Error hiding block overlay:', error);
    return false;
  }
}
