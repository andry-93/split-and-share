import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
    List,
    RadioButton,
    Switch,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';

import { useSettings } from './SettingsContext';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

const spacing = {
    xs: 8,
    s: 16,
    m: 24,
};

export const SettingsScreen = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const {
        language,
        theme,
        defaultCurrency,
        setLanguage,
        setTheme,
        setDefaultCurrency,
    } = useSettings();

    return (
        <View style={{ flex: 1 }}>
            {/* ===== HEADER ===== */}
            <ScreenHeader title={t('settings')} />

            <View style={{ padding: spacing.s }}>
                {/* ===== LANGUAGE ===== */}
                <Text
                    variant="titleMedium"
                    style={{ marginBottom: spacing.xs }}
                >
                    {t('language')}
                </Text>

                <RadioButton.Group
                    value={language}
                    onValueChange={value =>
                        setLanguage(value as 'en' | 'ru')
                    }
                >
                    <RadioButton.Item
                        label="English"
                        value="en"
                    />
                    <RadioButton.Item
                        label="Русский"
                        value="ru"
                    />
                </RadioButton.Group>

                {/* ===== THEME ===== */}
                <View
                    style={{
                        marginTop: spacing.m,
                        paddingTop: spacing.s,
                        borderTopWidth: 1,
                        borderTopColor: colors.outlineVariant,
                    }}
                >
                    <Text
                        variant="titleMedium"
                        style={{ marginBottom: spacing.xs }}
                    >
                        {t('theme')}
                    </Text>

                    <List.Item
                        title={
                            theme === 'dark'
                                ? t('dark')
                                : t('light')
                        }
                        right={() => (
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={value =>
                                    setTheme(
                                        value
                                            ? 'dark'
                                            : 'light'
                                    )
                                }
                            />
                        )}
                    />
                </View>

                {/* ===== DEFAULT CURRENCY ===== */}
                <View
                    style={{
                        marginTop: spacing.m,
                        paddingTop: spacing.s,
                        borderTopWidth: 1,
                        borderTopColor: colors.outlineVariant,
                    }}
                >
                    <Text
                        variant="titleMedium"
                        style={{ marginBottom: spacing.xs }}
                    >
                        Currency
                    </Text>

                    <TextInput
                        label="Default currency"
                        value={defaultCurrency}
                        onChangeText={setDefaultCurrency}
                        autoCapitalize="characters"
                        maxLength={5}
                        dense
                    />
                </View>
            </View>
        </View>
    );
};
