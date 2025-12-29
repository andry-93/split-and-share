import { StorageService } from '@/shared/services/StorageService';

export const storage = {
    get<T>(key: string): T | null {
        const value = StorageService.getItem(key);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    },

    set<T>(key: string, value: T): void {
        StorageService.setItem(key, JSON.stringify(value))
    },

    remove(key: string): void {
        StorageService.removeItem(key);
    },
};
