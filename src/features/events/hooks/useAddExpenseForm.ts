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
  const hasInitialSplitBetweenIds = initialSplitBetweenIds !== undefined;
  const [amount, setAmount] = useState(initialAmount);
  const [title, setTitle] = useState(initialTitle);
  const [paidById, setPaidById] = useState(initialPaidById ?? participants[0]?.id ?? '');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    hasInitialSplitBetweenIds
      ? [...(initialSplitBetweenIds ?? [])]
      : participants.map((participant) => participant.id),
  );

  const poolIds = useMemo(() => new Set(pools.map((p) => p.id)), [pools]);
  const paidByIsPool = useMemo(() => poolIds.has(paidById), [poolIds, paidById]);

  // Exclude the payer from the split-between list (they're already in the calculation)
  const participantOptions = useMemo(
    () =>
      sortPeopleWithCurrentUserFirst(participants)
        .filter((p) => p.id !== paidById)
        .map((participant) => ({
          id: participant.id,
          name: participant.name,
        })),
    [participants, paidById],
  );

  const payerOptions = useMemo(
    () => [
      ...sortPeopleWithCurrentUserFirst(participants).map((participant) => ({
        id: participant.id,
        name: participant.name,
      })),
      ...pools.map((pool) => ({
        id: pool.id,
        name: pool.name,
      })),
    ],
    [participants, pools],
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
    // When payer is a pool, no split-between participants are required
    if (!paidByIsPool && selectedParticipantIds.length === 0) {
      return true;
    }
    if (!Number.isFinite(parsedAmountMinor) || parsedAmountMinor <= 0) {
      return true;
    }
    return false;
  }, [amount, paidById, paidByIsPool, parsedAmountMinor, selectedParticipantIds.length, title]);

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
    const nextSelectedIds = hasInitialSplitBetweenIds
      ? [...(initialSplitBetweenIds ?? [])]
      : defaultIds;
    
    setSelectedParticipantIds((prev) => {
      if (nextSelectedIds.length === prev.length && nextSelectedIds.every((v, i) => v === prev[i])) {
        return prev;
      }
      return nextSelectedIds;
    });
  }, [
    hasInitialSplitBetweenIds,
    initialAmount,
    initialPaidById,
    initialSplitBetweenIds,
    initialTitle,
    participants,
    currentExpenseId,
  ]);

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
      const final = prev.filter((id) => participantIdSet.has(id));

      if (final.length === prev.length && final.every((v, i) => v === prev[i])) {
        return prev;
      }
      return final;
    });
  }, [participantOptions, payerOptions, paidById]);

  const toggleParticipant = useCallback((participantId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((item) => item !== participantId)
        : [...prev, participantId],
    );
  }, []);

  const changePaidById = useCallback((nextPaidById: string) => {
    setPaidById((prevPaidById) => {
      if (prevPaidById === nextPaidById) {
        return prevPaidById;
      }
      // UX: when payer changes, reset split-between selection.
      setSelectedParticipantIds([]);
      return nextPaidById;
    });
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
    paidByIsPool,
    isExpression,
    calculationResult,
    parsedAmountMinor,
    isSaveDisabled,
    setAmount,
    setTitle,
    setPaidById,
    changePaidById,
    setSelectedParticipantIds,
    toggleParticipant,
  };
}
