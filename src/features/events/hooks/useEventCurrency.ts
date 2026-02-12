import { useMemo, useState } from 'react';

export const EVENT_CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'RUB'] as const;

export type EventCurrencyCode = (typeof EVENT_CURRENCY_OPTIONS)[number];

const EVENT_CURRENCY_LABELS: Record<EventCurrencyCode, string> = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  RUB: 'RUB',
};

export function useEventCurrency(settingsCurrency: string) {
  const selectedCurrency = useMemo<EventCurrencyCode>(() => {
    if (EVENT_CURRENCY_OPTIONS.includes(settingsCurrency as EventCurrencyCode)) {
      return settingsCurrency as EventCurrencyCode;
    }
    return 'USD';
  }, [settingsCurrency]);

  const [eventCurrency, setEventCurrency] = useState<EventCurrencyCode>(selectedCurrency);

  return {
    currencyOptions: EVENT_CURRENCY_OPTIONS,
    currencyLabels: EVENT_CURRENCY_LABELS,
    eventCurrency,
    setEventCurrency,
  };
}
