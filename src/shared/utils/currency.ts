const SUPPORTED_CURRENCY_CODES = new Set(['USD', 'EUR', 'GBP', 'RUB']);

export function normalizeCurrencyCode(currency?: string): string {
  if (!currency) {
    return 'USD';
  }

  return SUPPORTED_CURRENCY_CODES.has(currency) ? currency : 'USD';
}

export function formatCurrencyAmount(currency: string, amount: number): string {
  return `${normalizeCurrencyCode(currency)} ${amount.toFixed(2)}`;
}
