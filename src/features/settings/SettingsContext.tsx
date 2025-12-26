import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

import type {
    Settings,
    Language,
    Theme,
} from '../../entities/types';

const SettingsContext =
    createContext<Settings | undefined>(undefined);

const languageToLocale: Record<Language, string> = {
    en: 'en-US',
    ru: 'ru-RU',
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] =
        useState<Language>('en');
    const [theme, setThemeState] =
        useState<Theme>('light');
    const [defaultCurrency, setDefaultCurrencyState] =
        useState<string>('BYN');
    const [ready, setReady] = useState(false);

    /* =======================
       INIT
       ======================= */

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedLang =
                    await AsyncStorage.getItem('language');
                const storedTheme =
                    await AsyncStorage.getItem('theme');
                const storedCurrency =
                    await AsyncStorage.getItem(
                        'defaultCurrency'
                    );

                if (storedLang) {
                    setLanguageState(
                        storedLang as Language
                    );
                    await i18n.changeLanguage(
                        storedLang
                    );
                }

                if (storedTheme) {
                    setThemeState(
                        storedTheme as Theme
                    );
                }

                if (storedCurrency) {
                    setDefaultCurrencyState(
                        storedCurrency
                    );
                }
            } catch (e) {
                console.warn(
                    'Failed to load settings',
                    e
                );
            } finally {
                setReady(true);
            }
        };

        loadSettings();
    }, []);

    /* =======================
       ACTIONS
       ======================= */

    const setLanguage = useCallback(
        async (lang: Language) => {
            setLanguageState(lang);
            await i18n.changeLanguage(lang);
            await AsyncStorage.setItem(
                'language',
                lang
            );
        },
        []
    );

    const setTheme = useCallback(
        async (nextTheme: Theme) => {
            setThemeState(nextTheme);
            await AsyncStorage.setItem(
                'theme',
                nextTheme
            );
        },
        []
    );

    const setDefaultCurrency = useCallback(
        async (currency: string) => {
            const next = currency
                .trim()
                .toUpperCase();

            if (!next) return;

            setDefaultCurrencyState(next);
            await AsyncStorage.setItem(
                'defaultCurrency',
                next
            );
        },
        []
    );

    /* =======================
       GUARD
       ======================= */

    if (!ready) {
        return null;
    }

    const locale = languageToLocale[language];

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
        throw new Error(
            'useSettings must be used within SettingsProvider'
        );
    }
    return ctx;
};
