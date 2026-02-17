const MINOR_UNITS_SCALE = 100;

export function normalizeCurrencyCode(currency?: string): string {
  const value = currency?.trim().toUpperCase() ?? '';
  const normalized = value.replace(/[^A-Z0-9]/g, '');

  if (!normalized) {
    return 'USD';
  }

  return normalized.slice(0, 10);
}

export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * MINOR_UNITS_SCALE);
}

export function fromMinorUnits(amountInMinor: number): number {
  if (!Number.isFinite(amountInMinor)) {
    return 0;
  }

  return amountInMinor / MINOR_UNITS_SCALE;
}

export function roundMoney(amount: number): number {
  return fromMinorUnits(toMinorUnits(amount));
}

export function formatCurrencyAmount(currency: string, amount: number): string {
  const normalized = normalizeCurrencyCode(currency);
  const rounded = roundMoney(amount);
  return `${normalized} ${rounded.toFixed(2)}`;
}
