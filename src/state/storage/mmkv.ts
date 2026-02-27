import { createMMKV } from 'react-native-mmkv';
import { reportError } from '@/shared/monitoring/errorReporting';
import { getOrCreateStorageEncryptionKey } from '@/state/storage/encryptionKey';

export const storage = createMMKV({
  id: 'split-and-share-storage',
});

let storageInitializationError: unknown = null;

try {
  const encryptionKey = getOrCreateStorageEncryptionKey();
  storage.recrypt(encryptionKey);
} catch (error) {
  storageInitializationError = error;
  reportError(error, {
    scope: 'storage.mmkv.encryption',
    message: 'Failed to initialize encrypted MMKV',
  });
}

export function getStorageInitializationError(): unknown {
  return storageInitializationError;
}

export function readJSON<T>(key: string): T | null {
  if (storageInitializationError) {
    return null;
  }

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
  if (storageInitializationError) {
    return;
  }

  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    // ignore write errors for now
  }
}
