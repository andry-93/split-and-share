import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParticipantItem } from '@/features/events/types/events';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { parseMoneyAmount } from '@/shared/utils/money';
import { sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';

type UseAddExpenseFormInput = {
  participants: ParticipantItem[];
  currency?: string;
  fallbackCurrency: string;
  initialAmount?: string;
  initialTitle?: string;
  initialPaidById?: string;
  initialSplitBetweenIds?: string[];
};

export function useAddExpenseForm({
  participants,
  currency,
  fallbackCurrency,
  initialAmount = '',
  initialTitle = '',
  initialPaidById,
  initialSplitBetweenIds,
}: UseAddExpenseFormInput) {
  const [amount, setAmount] = useState(initialAmount);
  const [title, setTitle] = useState(initialTitle);
  const [paidById, setPaidById] = useState(initialPaidById ?? participants[0]?.id ?? '');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    initialSplitBetweenIds?.length ? initialSplitBetweenIds : participants.map((participant) => participant.id),
  );

  const participantOptions = useMemo(
    () =>
      sortPeopleWithCurrentUserFirst(participants).map((participant) => ({
        id: participant.id,
        name: participant.name,
      })),
    [participants],
  );
  const participantIds = useMemo(
    () => participantOptions.map((participant) => participant.id),
    [participantOptions],
  );
  const selectedSet = useMemo(() => new Set(selectedParticipantIds), [selectedParticipantIds]);
  const selectedCurrencyCode = useMemo(
    () => normalizeCurrencyCode(currency ?? fallbackCurrency),
    [currency, fallbackCurrency],
  );
  const paidBy = useMemo(
    () => participantOptions.find((participant) => participant.id === paidById)?.name ?? '',
    [paidById, participantOptions],
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
    if (!amount.trim() || !title.trim() || !paidById.trim()) {
      return true;
    }
    if (selectedParticipantIds.length === 0) {
      return true;
    }
    if (!Number.isFinite(parsedAmountMinor) || parsedAmountMinor <= 0) {
      return true;
    }
    return false;
  }, [amount, paidById, parsedAmountMinor, selectedParticipantIds.length, title]);

  useEffect(() => {
    setAmount(initialAmount);
    setTitle(initialTitle);
    if (initialPaidById) {
      setPaidById(initialPaidById);
    }
    setSelectedParticipantIds(
      initialSplitBetweenIds?.length
        ? initialSplitBetweenIds
        : participants.map((participant) => participant.id),
    );
  }, [initialAmount, initialPaidById, initialSplitBetweenIds, initialTitle, participants]);

  useEffect(() => {
    if (participantOptions.length === 0) {
      setPaidById('');
      setSelectedParticipantIds([]);
      return;
    }

    const participantIdSet = new Set(participantOptions.map((participant) => participant.id));
    setPaidById((prev) => (participantIdSet.has(prev) ? prev : participantOptions[0].id));
    setSelectedParticipantIds((prev) => {
      const next = prev.filter((id) => participantIdSet.has(id));
      return next.length > 0 ? next : [...participantIds];
    });
  }, [participantIds, participantOptions]);

  const toggleParticipant = useCallback((participantId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((item) => item !== participantId)
        : [...prev, participantId],
    );
  }, []);

  return {
    amount,
    title,
    paidById,
    selectedParticipantIds,
    selectedSet,
    participantOptions,
    participantIds,
    selectedCurrencyCode,
    paidBy,
    isExpression,
    calculationResult,
    parsedAmountMinor,
    isSaveDisabled,
    setAmount,
    setTitle,
    setPaidById,
    setSelectedParticipantIds,
    toggleParticipant,
  };
}

