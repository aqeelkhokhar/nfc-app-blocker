import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export async function initNFC(): Promise<boolean> {
  try {
    await NfcManager.start();
    console.log('nfc status',await NfcManager.isEnabled())
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

export async function readNFCTag(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    return tag?.id ?? null;
  } catch {
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export function cancelNFC() {
  NfcManager.cancelTechnologyRequest().catch(() => {});
}
