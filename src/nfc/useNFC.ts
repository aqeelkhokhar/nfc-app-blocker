import { useEffect, useState } from 'react';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import { useBrick } from '../state/BrickContext';
import { initNFC } from './NFCService';

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const { pairedNfcTagId, toggleBrick } = useBrick();

  useEffect(() => {
    initNFC().then(setIsSupported);

    const listener = NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      if (pairedNfcTagId && tag.id === pairedNfcTagId) {
        toggleBrick();
      }
      NfcManager.setAlertMessageIOS('Tag detected!');
      NfcManager.unregisterTagEvent().catch(() => {});
    });

    return () => {
      listener?.remove?.();
      NfcManager.unregisterTagEvent().catch(() => {});
    };
  }, [pairedNfcTagId, toggleBrick]);

  const startScanning = async () => {
    try {
      await NfcManager.registerTagEvent();
    } catch {}
  };

  return { isSupported, startScanning };
}
