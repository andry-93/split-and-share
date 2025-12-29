import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export const StorageService = {
    setItem: (key: string, value: string) => {
        mmkv.set(key, value);
    },

    getItem: (key: string): string | null => {
        return mmkv.getString(key) ?? null;
    },

    removeItem: (key: string): boolean => {
        return mmkv.remove(key);
    },

    clear: () => {
        mmkv.clearAll();
    },

    getAllKeys: (): string[] => {
        return mmkv.getAllKeys();
    },

    contains: (key: string): boolean => {
        return mmkv.contains(key);
    },
};
