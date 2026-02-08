import type { MMKV as MMKVInstance } from 'react-native-mmkv';

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

const memoryStorage = new Map<string, string>();

const fallbackStorage: StorageLike = {
  getString: (key) => memoryStorage.get(key),
  set: (key, value) => {
    memoryStorage.set(key, value);
  },
};

let storageInstance: StorageLike = fallbackStorage;

try {
  const { MMKV } = require('react-native-mmkv') as {
    MMKV: new (...args: never[]) => MMKVInstance;
  };
  storageInstance = new MMKV();
} catch {
  storageInstance = fallbackStorage;
}

export const storage = storageInstance;

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
