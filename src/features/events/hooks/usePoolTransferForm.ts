import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParticipantItem, PoolItem } from '@/features/events/types/events';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { parseMoneyAmount } from '@/shared/utils/money';
import { sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';

type UsePoolTransferFormInput = {
  participants: ParticipantItem[];
  currency?: string;
  fallbackCurrency: string;
};

export function usePoolTransferForm({
  participants,
  currency,
  fallbackCurrency,
}: UsePoolTransferFormInput) {
  const [amount, setAmount] = useState('');
  const [contributorId, setContributorId] = useState(participants[0]?.id ?? '');

  const contributorOptions = useMemo(
    () => sortPeopleWithCurrentUserFirst(participants),
    [participants],
  );

  const selectedCurrencyCode = useMemo(
    () => normalizeCurrencyCode(currency ?? fallbackCurrency),
    [currency, fallbackCurrency],
  );

  const contributorName = useMemo(
    () => contributorOptions.find((option) => option.id === contributorId)?.name ?? '',
    [contributorId, contributorOptions],
  );

  const { isExpression, calculationResult, parsedAmountMinor } = useMemo(() => {
    const normalized = amount.trim();
    const hasOperators = /[+\-*/()]/.test(normalized);
    const parsed = parseMoneyAmount(normalized);
    const isValid = Number.isFinite(parsed) && parsed > 0;

    return {
      isExpression: hasOperators,
      calculationResult: hasOperators && isValid ? parsed : null,
      parsedAmountMinor: isValid ? Math.round(parsed * 100) : Number.NaN,
    };
  }, [amount]);

  const isSaveDisabled = useMemo(() => {
    if (!amount.trim() || !contributorId.trim()) {
      return true;
    }
    if (!Number.isFinite(parsedAmountMinor) || parsedAmountMinor <= 0) {
      return true;
    }
    return false;
  }, [amount, contributorId, parsedAmountMinor]);

  useEffect(() => {
    if (contributorOptions.length > 0 && !contributorOptions.some((c) => c.id === contributorId)) {
      setContributorId(contributorOptions[0].id);
    }
  }, [contributorId, contributorOptions]);

  return {
    amount,
    setAmount,
    contributorId,
    setContributorId,
    contributorOptions,
    selectedCurrencyCode,
    contributorName,
    isExpression,
    calculationResult,
    parsedAmountMinor,
    isSaveDisabled,
  };
}
