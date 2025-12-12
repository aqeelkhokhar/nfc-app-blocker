import { createMMKV, type MMKV } from 'react-native-mmkv';

let storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!storage) {
    storage = createMMKV({ id: 'nfc-app-blocker' });
  }
  return storage;
}

export function getString(key: string): string | null {
  try {
    return getStorage().getString(key) ?? null;
  } catch {
    return null;
  }
}

export function setString(key: string, value: string | null) {
  try {
    const store = getStorage();
    if (value == null) {
      store.remove(key);
    } else {
      store.set(key, value);
    }
  } catch {}
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
