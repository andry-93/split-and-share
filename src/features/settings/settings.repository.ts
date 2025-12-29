import { Settings } from '@/entities/types';
import { storage } from '@/shared/lib/storage';

const SETTINGS_KEY = 'settings';

type PersistedSettings = Pick<Settings, 'language' | 'theme' | 'defaultCurrency' | 'locale'>;

const DEFAULT_PERSISTED: PersistedSettings = {
    language: 'en',
    theme: 'light',
    defaultCurrency: 'USD',
    locale: 'en-US',
};

export const settingsRepository = {
    get(): PersistedSettings {
        return storage.get<PersistedSettings>(SETTINGS_KEY) ?? DEFAULT_PERSISTED;
    },

    save(persisted: PersistedSettings): void {
        storage.set(SETTINGS_KEY, persisted);
    },
};
