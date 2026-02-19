import { useMemo, useState } from 'react';
import { getCurrencyDisplay, normalizeCurrencyCode, SUPPORTED_CURRENCY_CODES } from '@/shared/utils/currency';

export const EVENT_CURRENCY_OPTIONS = SUPPORTED_CURRENCY_CODES;

const EVENT_CURRENCY_LABELS: Record<string, string> = EVENT_CURRENCY_OPTIONS.reduce(
  (acc, code) => {
    acc[code] = getCurrencyDisplay(code);
    return acc;
  },
  {} as Record<string, string>,
);

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
