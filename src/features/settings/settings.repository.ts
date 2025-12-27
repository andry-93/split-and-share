import { Settings } from '@/entities/types';
import { storage } from '@/shared/lib/storage';

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: Settings = {
    language: 'en',
    theme: 'light',
};

export const settingsRepository = {
    async get(): Promise<Settings> {
        return (await storage.get<Settings>(SETTINGS_KEY)) ?? DEFAULT_SETTINGS;
    },

    async save(settings: Settings): Promise<void> {
        await storage.set(SETTINGS_KEY, settings);
    },
};
