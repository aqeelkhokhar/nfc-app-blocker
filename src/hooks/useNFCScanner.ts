import { useState, useCallback } from 'react';
import { readNFCTag, cancelNFC } from '../nfc/NFCService';
import { useNFC as useNFCBase } from '../nfc/useNFC';
import { useBrick } from '../state/BrickContext';

export type NFCScanState = 'idle' | 'scanning' | 'success' | 'error';

export function useNFCScanner() {
  const { isSupported, startScanning } = useNFCBase();
  const { setPairedNfcTagId } = useBrick();
  
  const [isVisible, setIsVisible] = useState(false);
  const [scanState, setScanState] = useState<NFCScanState>('idle');
  const [tagId, setTagId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startPairing = useCallback(async () => {
    setIsScanning(true);
    setIsVisible(true);
    setScanState('scanning');
    setTagId(null);
    setError(null);

    const detectedTagId = await readNFCTag();

    setIsScanning(false);

    if (detectedTagId) {
      setPairedNfcTagId(detectedTagId);
      setTagId(detectedTagId);
      setScanState('success');
      startScanning();
    } else {
      setError('Could not read NFC tag. Please try again.');
      setScanState('error');
    }
  }, [setPairedNfcTagId, startScanning]);

  const cancelScanning = useCallback(() => {
    cancelNFC();
    setIsVisible(false);
    setScanState('idle');
    setTagId(null);
    setError(null);
    setIsScanning(false);
  }, []);

  const closeScanner = useCallback(() => {
    setIsVisible(false);
    setScanState('idle');
    setTagId(null);
    setError(null);
  }, []);

  const retryScanning = useCallback(() => {
    startPairing();
  }, [startPairing]);

  return {
    isSupported,
    isVisible,
    isScanning,
    scanState,
    tagId,
    error,
    startPairing,
    cancelScanning,
    closeScanner,
    retryScanning,
  };
}
