import { useMemo, useState } from 'react';
import { getCurrencyDisplay, normalizeCurrencyCode } from '@/shared/utils/currency';

export const EVENT_CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'RUB', 'BYN'] as const;

const EVENT_CURRENCY_LABELS: Record<string, string> = {
  USD: getCurrencyDisplay('USD'),
  EUR: getCurrencyDisplay('EUR'),
  GBP: getCurrencyDisplay('GBP'),
  RUB: getCurrencyDisplay('RUB'),
  BYN: getCurrencyDisplay('BYN'),
};

export function useEventCurrency(settingsCurrency: string) {
  const selectedCurrency = useMemo(() => {
    return normalizeCurrencyCode(settingsCurrency);
  }, [settingsCurrency]);

  const [eventCurrency, setEventCurrency] = useState<string>(selectedCurrency);

  const currencyOptions = useMemo(() => {
    if (EVENT_CURRENCY_OPTIONS.includes(eventCurrency as (typeof EVENT_CURRENCY_OPTIONS)[number])) {
      return EVENT_CURRENCY_OPTIONS;
    }
    return [...EVENT_CURRENCY_OPTIONS, eventCurrency] as readonly string[];
  }, [eventCurrency]);

  const currencyLabels = useMemo(
    () => ({
      ...EVENT_CURRENCY_LABELS,
      [eventCurrency]: getCurrencyDisplay(eventCurrency),
    }),
    [eventCurrency],
  );

  return {
    currencyOptions,
    currencyLabels,
    eventCurrency,
    setEventCurrency,
  };
}
