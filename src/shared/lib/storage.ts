import { StorageService } from '@/shared/services/StorageService';

export const storage = {
    get<T>(key: string): T | null {
        const value = StorageService.getItem(key);
        try {
            return value ? JSON.parse(value) : null;
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
