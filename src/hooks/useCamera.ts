import { useState, useCallback } from 'react';
import { Camera } from 'react-native-vision-camera';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState(false);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }

      const newStatus = await Camera.requestCameraPermission();
      const granted = newStatus === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }, []);

  return {
    hasPermission,
    ensurePermission,
  };
}
