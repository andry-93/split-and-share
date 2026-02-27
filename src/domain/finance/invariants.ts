import { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';

type PaymentValidationResult =
  | { valid: true; normalizedAmount: number }
  | { valid: false; reason: 'invalid_amount' | 'exceeds_remaining' };

export function sanitizeSplitParticipantIds(
  splitBetweenIds: readonly string[] | undefined,
  allParticipantIds: readonly string[],
): string[] {
  const allowed = new Set(allParticipantIds.filter(Boolean));
  const sanitized = Array.from(new Set((splitBetweenIds ?? []).filter((id) => allowed.has(id))));

  if (sanitized.length > 0) {
    return sanitized;
  }

  return Array.from(new Set(allParticipantIds.filter(Boolean)));
}

export function validatePaymentAmount(amount: number, maxAmount: number): PaymentValidationResult {
  const amountMinor = toMinorUnits(amount);
  const maxMinor = toMinorUnits(maxAmount);

  if (!Number.isFinite(amount) || amountMinor <= 0) {
    return {
      valid: false,
      reason: 'invalid_amount',
    };
  }

  if (amountMinor > maxMinor) {
    return {
      valid: false,
      reason: 'exceeds_remaining',
    };
  }

  return {
    valid: true,
    normalizedAmount: fromMinorUnits(amountMinor),
  };
}
