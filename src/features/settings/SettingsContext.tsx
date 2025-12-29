import React, {
    createContext,
    useMemo,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { StorageService } from '@/shared/services/StorageService';
import i18n from 'i18next';

import type {
    Settings,
    Language,
    Theme,
} from '@/entities/types';

const SettingsContext = createContext<Settings | undefined>(undefined);

const languageToLocale: Record<Language, string> = {
    en: 'en-US',
    ru: 'ru-RU',
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [theme, setThemeState] = useState<Theme>('light');
    const [defaultCurrency, setDefaultCurrencyState] = useState<string>('BYN');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedLang = StorageService.getItem('language');
                const storedTheme = StorageService.getItem('theme');
                const storedCurrency = StorageService.getItem('defaultCurrency');

                if (storedLang) {
                    setLanguageState(storedLang as Language);
                    await i18n.changeLanguage(storedLang); // ✅ теперь корректно ожидается
                }

                if (storedTheme) {
                    setThemeState(storedTheme as Theme);
                }

                if (storedCurrency) {
                    setDefaultCurrencyState(storedCurrency);
                }
            } catch (e) {
                console.warn('Failed to load settings', e);
            } finally {
                setReady(true);
            }
        };

        loadSettings();
    }, []);

    const setLanguage = useCallback(async (lang: Language) => {
        setLanguageState(lang);
        await i18n.changeLanguage(lang);
        StorageService.setItem('language', lang);
    }, []);

    const setTheme = useCallback((nextTheme: Theme) => {
        setThemeState(nextTheme);
        StorageService.setItem('theme', nextTheme);
    }, []);

    const setDefaultCurrency = useCallback((currency: string) => {
        const next = currency.trim().toUpperCase();
        if (!next) return;
        setDefaultCurrencyState(next);
        StorageService.setItem('defaultCurrency', next);
    }, []);

    const locale = useMemo(() => {
        return languageToLocale[language];
    }, [language]);

    if (!ready) return null;

    return (
        <SettingsContext.Provider
            value={{
                language,
                theme,
                defaultCurrency,
                locale,
                setLanguage,
                setTheme,
                setDefaultCurrency,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return ctx;
};
