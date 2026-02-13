import { useCallback, useEffect, useMemo, useState } from 'react';
import { ParticipantItem } from '../types/events';
import { normalizeCurrencyCode } from '../../../shared/utils/currency';
import { sortPeopleWithCurrentUserFirst } from '../../../shared/utils/people';

type UseAddExpenseFormInput = {
  participants: ParticipantItem[];
  currency?: string;
  fallbackCurrency: string;
  initialAmount?: string;
  initialTitle?: string;
  initialPaidById?: string;
};

export function useAddExpenseForm({
  participants,
  currency,
  fallbackCurrency,
  initialAmount = '',
  initialTitle = '',
  initialPaidById,
}: UseAddExpenseFormInput) {
  const [amount, setAmount] = useState(initialAmount);
  const [title, setTitle] = useState(initialTitle);
  const [paidById, setPaidById] = useState(initialPaidById ?? participants[0]?.id ?? '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    participants.map((participant) => participant.name),
  );

  const participantOptions = useMemo(
    () =>
      sortPeopleWithCurrentUserFirst(participants).map((participant) => ({
        id: participant.id,
        name: participant.name,
      })),
    [participants],
  );
  const participantNames = useMemo(
    () => participantOptions.map((participant) => participant.name),
    [participantOptions],
  );
  const selectedSet = useMemo(() => new Set(selectedParticipants), [selectedParticipants]);
  const selectedCurrency = useMemo(
    () => normalizeCurrencyCode(currency ?? fallbackCurrency),
    [currency, fallbackCurrency],
  );
  const paidBy = useMemo(
    () => participantOptions.find((participant) => participant.id === paidById)?.name ?? '',
    [paidById, participantOptions],
  );
  const parsedAmount = useMemo(() => Number(amount.replace(',', '.')), [amount]);

  const isSaveDisabled = useMemo(() => {
    if (!amount.trim() || !title.trim() || !paidById.trim()) {
      return true;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return true;
    }
    return false;
  }, [amount, paidById, parsedAmount, title]);

  useEffect(() => {
    setAmount(initialAmount);
    setTitle(initialTitle);
    if (initialPaidById) {
      setPaidById(initialPaidById);
    }
  }, [initialAmount, initialPaidById, initialTitle]);

  useEffect(() => {
    if (participantOptions.length === 0) {
      setPaidById('');
      setSelectedParticipants([]);
      return;
    }

    const participantIds = new Set(participantOptions.map((participant) => participant.id));
    setPaidById((prev) => (participantIds.has(prev) ? prev : participantOptions[0].id));
    setSelectedParticipants((prev) => {
      const next = prev.filter((name) => participantNames.includes(name));
      return next.length > 0 ? next : [...participantNames];
    });
  }, [participantNames, participantOptions]);

  const toggleParticipant = useCallback((name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  }, []);

  return {
    amount,
    title,
    paidById,
    selectedParticipants,
    selectedSet,
    participantOptions,
    participantNames,
    selectedCurrency,
    paidBy,
    parsedAmount,
    isSaveDisabled,
    setAmount,
    setTitle,
    setPaidById,
    setSelectedParticipants,
    toggleParticipant,
  };
}
