import { NativeModules, Platform } from 'react-native';

const { PermissionsModule } = NativeModules as {
  PermissionsModule?: {
    checkOverlayPermission: () => Promise<boolean>;
    requestOverlayPermission: () => Promise<boolean>;
    checkUsageStatsPermission: () => Promise<boolean>;
    requestUsageStatsPermission: () => Promise<boolean>;
    checkAccessibilityPermission: () => Promise<boolean>;
    requestAccessibilityPermission: () => Promise<boolean>;
  };
};

export async function hasOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.checkOverlayPermission();
  } catch (error) {
    console.error('Error checking overlay permission:', error);
    return false;
  }
}

export async function requestOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.requestOverlayPermission();
  } catch (error) {
    console.error('Error requesting overlay permission:', error);
    return false;
  }
}

export async function hasUsageStatsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.checkUsageStatsPermission();
  } catch (error) {
    console.error('Error checking usage stats permission:', error);
    return false;
  }
}

export async function requestUsageStatsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.requestUsageStatsPermission();
  } catch (error) {
    console.error('Error requesting usage stats permission:', error);
    return false;
  }
}

export async function hasAccessibilityPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.checkAccessibilityPermission();
  } catch (error) {
    console.error('Error checking accessibility permission:', error);
    return false;
  }
}

export async function requestAccessibilityPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !PermissionsModule) {
    return false;
  }

  try {
    return await PermissionsModule.requestAccessibilityPermission();
  } catch (error) {
    console.error('Error requesting accessibility permission:', error);
    return false;
  }
}

// Helper to check all required permissions at once
export async function checkAllPermissions(): Promise<{
  overlay: boolean;
  usage: boolean;
  accessibility: boolean;
}> {
  if (Platform.OS !== 'android') {
    return { overlay: false, usage: false, accessibility: false };
  }

  const [overlay, usage, accessibility] = await Promise.all([
    hasOverlayPermission(),
    hasUsageStatsPermission(),
    hasAccessibilityPermission(),
  ]);

  return { overlay, usage, accessibility };
}
