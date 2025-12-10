import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'nfc-app-blocker' });

export function getString(key: string): string | null {
  try {
    return storage.getString(key) ?? null;
  } catch {
    return null;
  }
}

export function setString(key: string, value: string | null) {
  try {
    if (value == null) {
      storage.delete(key);
    } else {
      storage.set(key, value);
    }
  } catch {
    // ignore for now; could add logging
  }
}

export function getJson<T>(key: string): T | null {
  const raw = getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(key: string, value: unknown) {
  if (value == null) {
    setString(key, null);
    return;
  }
  setString(key, JSON.stringify(value));
}
