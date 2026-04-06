import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const MASTER_PASSWORD_KEY = 'master_password_v1';

async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

export async function setMasterPassword(password: string): Promise<void> {
  const hashed = await hashPassword(password);
  await SecureStore.setItemAsync(MASTER_PASSWORD_KEY, hashed, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getMasterPassword(): Promise<string | null> {
  return await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
}

export async function deleteMasterPassword(): Promise<void> {
  await SecureStore.deleteItemAsync(MASTER_PASSWORD_KEY);
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
  const stored = await getMasterPassword();
  if (!stored) return false;
  const hashed = await hashPassword(password);
  return stored === hashed;
}
