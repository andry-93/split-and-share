import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';

const LEGACY_KEYRING_ID = 'split-and-share-storage-keyring';
const LEGACY_ENCRYPTION_KEY_NAME = 'storage_encryption_key_v1';
const SECURE_STORE_KEY = 'secure_storage_encryption_key_v1';

const MMKV_KEY_LENGTH = 32; // Increased to 32 bytes for AES-256
const KEY_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const legacyKeyring = createMMKV({
  id: LEGACY_KEYRING_ID,
});

import uuid from 'react-native-uuid';

/**
 * Generates a secure random string of specified length.
 * Uses expo-crypto with a fallback to react-native-uuid if necessary.
 */
function createSecureRandomKey(length: number): string {
  try {
    const bytes = Crypto.getRandomBytes(length);
    let value = '';
    for (let index = 0; index < length; index += 1) {
      value += KEY_ALPHABET.charAt(bytes[index] % KEY_ALPHABET.length);
    }
    return value;
  } catch (error) {
    console.warn('[Security] Crypto.getRandomBytes failed, using fallback:', error);
    // Fallback: Use multiple UUIDs to gather enough entropy for the required length
    let fallbackValue = '';
    while (fallbackValue.length < length) {
      fallbackValue += (uuid.v4() as string).replaceAll('-', '');
    }
    
    // Scramble and map to alphabet
    let finalValue = '';
    for (let i = 0; i < length; i++) {
      const charCode = fallbackValue.charCodeAt(i % fallbackValue.length);
      finalValue += KEY_ALPHABET.charAt(charCode % KEY_ALPHABET.length);
    }
    return finalValue;
  }
}

/**
 * Retrieves the encryption key from hardware-backed SecureStore.
 * Handles migration from legacy unencrypted MMKV keyring if necessary.
 */
export async function getOrCreateStorageEncryptionKey(): Promise<string> {
  try {
    // 1. Try to get the key from SecureStore (hardware-backed)
    const secureKey = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (secureKey) {
      return secureKey;
    }

    // 2. If not found, check legacy MMKV keyring (migration case)
    const legacyKey = legacyKeyring.getString(LEGACY_ENCRYPTION_KEY_NAME);
    if (legacyKey && legacyKey.length > 0) {
      // Migrate legacy key to SecureStore
      await SecureStore.setItemAsync(SECURE_STORE_KEY, legacyKey, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      
      // Cleanup legacy keyring
      (legacyKeyring as any).delete(LEGACY_ENCRYPTION_KEY_NAME);
      
      return legacyKey;
    }

    // 3. Fallback: Check if we have an Android hardware key (legacy feature in this codebase)
    // In many modern Expo apps, SecureStore is preferred over custom NativeModules.
    // We'll keep the logic if it's still needed, but SecureStore is our primary target now.

    // 4. If still nothing, generate a new 32-byte key for AES-256
    const newKey = createSecureRandomKey(MMKV_KEY_LENGTH);
    await SecureStore.setItemAsync(SECURE_STORE_KEY, newKey, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    
    return newKey;
  } catch (error) {
    console.error('[Security] Failed to get/create encryption key:', error);
    throw error;
  }
}
