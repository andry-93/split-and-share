import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ParticipantItem, PoolItem } from '@/features/events/types/events';
import { normalizeCurrencyCode } from '@/shared/utils/currency';
import { parseMoneyAmount } from '@/shared/utils/money';
import { sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';

type UseAddExpenseFormInput = {
  participants: ParticipantItem[];
  pools?: PoolItem[];
  currency?: string;
  fallbackCurrency: string;
  initialAmount?: string;
  initialTitle?: string;
  initialPaidById?: string;
  initialSplitBetweenIds?: string[];
};

export function useAddExpenseForm({
  participants,
  pools = [],
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

  const payerOptions = useMemo(
    () => [
      ...participantOptions,
      ...pools.map((pool) => ({
        id: pool.id,
        name: pool.name,
      })),
    ],
    [participantOptions, pools],
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
    () => payerOptions.find((option) => option.id === paidById)?.name ?? '',
    [paidById, payerOptions],
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

  // Track the identity of the expense being edited to avoid redundant resets
  const lastInitializedIdRef = useRef<string | undefined>(undefined);
  const currentExpenseId = initialTitle + initialAmount + initialPaidById + (initialSplitBetweenIds?.join(',') ?? '');

  useEffect(() => {
    // Only reset state if the initial values have actually changed in a way that implies a different expense
    if (lastInitializedIdRef.current === currentExpenseId) {
      return;
    }
    
    lastInitializedIdRef.current = currentExpenseId;

    setAmount(initialAmount);
    setTitle(initialTitle);
    
    if (initialPaidById !== undefined && initialPaidById !== paidById) {
      setPaidById(initialPaidById);
    }

    const defaultIds = participants.map((p) => p.id);
    const nextSelectedIds = initialSplitBetweenIds?.length ? initialSplitBetweenIds : defaultIds;
    
    setSelectedParticipantIds((prev) => {
      if (nextSelectedIds.length === prev.length && nextSelectedIds.every((v, i) => v === prev[i])) {
        return prev;
      }
      return nextSelectedIds;
    });
  }, [initialAmount, initialPaidById, initialSplitBetweenIds, initialTitle, participants, currentExpenseId]);

  useEffect(() => {
    if (payerOptions.length === 0) {
      if (paidById !== '') setPaidById('');
      if (selectedParticipantIds.length !== 0) setSelectedParticipantIds([]);
      return;
    }

    const payerOptionIds = new Set(payerOptions.map((option) => option.id));
    if (paidById && !payerOptionIds.has(paidById)) {
      setPaidById(payerOptions[0].id);
    }
    
    const participantIdSet = new Set(participantOptions.map((p) => p.id));
    setSelectedParticipantIds((prev) => {
      const next = prev.filter((id) => participantIdSet.has(id));
      const final = next.length > 0 ? next : [...participantIds];
      
      if (final.length === prev.length && final.every((v, i) => v === prev[i])) {
        return prev;
      }
      return final;
    });
  }, [participantIds, participantOptions, payerOptions]);

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
    payerOptions,
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
