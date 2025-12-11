import { NativeModules, Platform } from 'react-native';

const { ForegroundServiceModule } = NativeModules as {
  ForegroundServiceModule?: {
    startService: () => Promise<boolean>;
    stopService: () => Promise<boolean>;
  };
};

export async function startForegroundService(): Promise<boolean> {
  if (Platform.OS !== 'android' || !ForegroundServiceModule) {
    return false;
  }

  try {
    return await ForegroundServiceModule.startService();
  } catch (error) {
    console.error('Error starting foreground service:', error);
    return false;
  }
}

export async function stopForegroundService(): Promise<boolean> {
  if (Platform.OS !== 'android' || !ForegroundServiceModule) {
    return false;
  }

  try {
    return await ForegroundServiceModule.stopService();
  } catch (error) {
    console.error('Error stopping foreground service:', error);
    return false;
  }
}
