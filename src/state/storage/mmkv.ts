import { createMMKV, MMKV } from 'react-native-mmkv';
import { reportError } from '@/shared/monitoring/errorReporting';
import { getOrCreateStorageEncryptionKey } from '@/state/storage/encryptionKey';

let storageInitializationError: unknown = null;
let isStorageInitialized = false;

// Initialize dynamically when encryption key is available
export let storage: MMKV;

/**
 * Initializes the storage by retrieving/creating the encryption key
 * and applying it safely to the MMKV instance on creation.
 */
export async function initializeStorage(): Promise<void> {
  if (isStorageInitialized) return;

  try {
    const encryptionKey = await getOrCreateStorageEncryptionKey();
    
    // We MUST initialize MMKV with the key. Using recrypt on an unencrypted instance 
    // wipes previously encrypted data.
    storage = createMMKV({
      id: 'split-and-share-storage',
      encryptionKey,
    });
    
    isStorageInitialized = true;
  } catch (error) {
    storageInitializationError = error;
    reportError(error, {
      scope: 'storage.mmkv.encryption',
      message: 'Failed to initialize encrypted MMKV',
    });
    throw error;
  }
}

export function getIsStorageInitialized(): boolean {
  return isStorageInitialized;
}

export function getStorageInitializationError(): unknown {
  return storageInitializationError;
}

export function readJSON<T>(key: string): T | null {
  if (storageInitializationError || !isStorageInitialized) {
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
  if (storageInitializationError || !isStorageInitialized) {
    return;
  }

  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    // ignore write errors for now
  }
}
