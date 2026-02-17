import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'split-and-share-storage',
});

export function readJSON<T>(key: string): T | null {
  try {
    const value = storage.getString(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function writeJSON<T>(key: string, value: T) {
  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    // ignore write errors for now
  }
}
