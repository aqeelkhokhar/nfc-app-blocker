import { useEffect, useState } from 'react';
import NfcManager, { NfcEvents, TagEvent } from 'react-native-nfc-manager';
import { useBrick } from '../state/BrickContext';
import { initNFC } from './NFCService';

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const { pairedNfcTagId, toggleBrick } = useBrick();

  useEffect(() => {
    initNFC().then(setIsSupported);

    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
      if (pairedNfcTagId && tag.id === pairedNfcTagId) {
        toggleBrick();
      }
      NfcManager.setAlertMessageIOS('Tag detected!');
      NfcManager.unregisterTagEvent().catch(() => {});
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
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
