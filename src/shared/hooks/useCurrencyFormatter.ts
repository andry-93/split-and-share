import { useCallback } from 'react';
import { useSettings } from '@/features/settings/SettingsContext';
import { formatCurrency } from '../lib/formatCurrency';

export const useCurrencyFormatter = () => {
    const { locale } = useSettings();

    return useCallback(
        (value: number, currency: string) =>
            formatCurrency(value, currency, locale),
        [locale]
    );
};
