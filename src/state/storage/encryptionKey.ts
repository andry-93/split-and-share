import { NativeModules, Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

const keyStorage = createMMKV({
  id: 'split-and-share-storage-keyring',
});
const STORAGE_ENCRYPTION_KEY = 'storage_encryption_key_v1';
const MMKV_KEY_LENGTH = 16;
const KEY_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

type StorageKeyStoreModule = {
  getOrCreateStorageKey: () => string | null;
};

function getAndroidHardwareBackedKey(): string | null {
  if (Platform.OS !== 'android') {
    return null;
  }

  const module = NativeModules.StorageKeyStore as StorageKeyStoreModule | undefined;
  if (!module || typeof module.getOrCreateStorageKey !== 'function') {
    return null;
  }

  const key = module.getOrCreateStorageKey();
  return typeof key === 'string' && key.length > 0 ? key : null;
}

function createSecureRandomKey() {
  const cryptoApi = (
    globalThis as unknown as {
      crypto?: {
        getRandomValues?: (array: Uint8Array) => Uint8Array;
      };
    }
  ).crypto;
  const getRandomValues = cryptoApi?.getRandomValues;

  if (typeof getRandomValues !== 'function') {
    throw new Error('Secure random generator is unavailable');
  }

  const bytes = new Uint8Array(MMKV_KEY_LENGTH);
  getRandomValues(bytes);

  let value = '';
  for (let index = 0; index < MMKV_KEY_LENGTH; index += 1) {
    value += KEY_ALPHABET.charAt(bytes[index] % KEY_ALPHABET.length);
  }
  return value;
}

export function getOrCreateStorageEncryptionKey(): string {
  const androidHardwareBackedKey = getAndroidHardwareBackedKey();
  if (androidHardwareBackedKey) {
    return androidHardwareBackedKey;
  }

  const current = keyStorage.getString(STORAGE_ENCRYPTION_KEY);
  if (current && current.length > 0) {
    return current;
  }

  const next = createSecureRandomKey();
  keyStorage.set(STORAGE_ENCRYPTION_KEY, next);
  return next;
}
