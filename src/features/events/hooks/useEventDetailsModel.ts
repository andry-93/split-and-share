import { useMemo } from 'react';
import { EventItem } from '../types/events';
import {
  PaymentEntry,
  selectDetailedDebts,
  selectEffectiveRawDebts,
  selectOutstandingPeopleCount,
  selectOutstandingTotal,
  selectOutstandingTransfersCount,
  selectPayments,
  selectRawDebts,
  selectSimplifiedDebts,
} from '../../../state/events/eventsSelectors';
import { EventsState } from '../../../state/events/eventsTypes';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../../../shared/utils/currency';

type UseEventDetailsModelInput = {
  event: EventItem;
  eventsState: EventsState;
  settingsCurrency: string;
};

export function useEventDetailsModel({ event, eventsState, settingsCurrency }: UseEventDetailsModelInput) {
  const currencyCode = useMemo(
    () => normalizeCurrencyCode(event.currency ?? settingsCurrency),
    [event.currency, settingsCurrency],
  );

  const rawDebts = useMemo(() => selectRawDebts(event), [event]);
  const payments = useMemo<PaymentEntry[]>(
    () => selectPayments(eventsState, event.id),
    [event.id, eventsState],
  );
  const effectiveRawDebts = useMemo(
    () => selectEffectiveRawDebts(rawDebts, payments),
    [payments, rawDebts],
  );

  const totalAmount = useMemo(() => selectOutstandingTotal(effectiveRawDebts), [effectiveRawDebts]);
  const participantsCount = useMemo(
    () => selectOutstandingPeopleCount(effectiveRawDebts),
    [effectiveRawDebts],
  );
  const expensesCount = useMemo(
    () => selectOutstandingTransfersCount(effectiveRawDebts),
    [effectiveRawDebts],
  );
  const totalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, totalAmount),
    [currencyCode, totalAmount],
  );

  const detailedDebts = useMemo(() => selectDetailedDebts(effectiveRawDebts), [effectiveRawDebts]);
  const simplifiedDebts = useMemo(() => selectSimplifiedDebts(effectiveRawDebts), [effectiveRawDebts]);

  const baseDetailedCount = useMemo(() => selectDetailedDebts(rawDebts).length, [rawDebts]);
  const baseSimplifiedCount = useMemo(() => selectSimplifiedDebts(rawDebts).length, [rawDebts]);
  const paidDetailedCount = Math.max(0, baseDetailedCount - detailedDebts.length);
  const paidSimplifiedCount = Math.max(0, baseSimplifiedCount - simplifiedDebts.length);

  const participantBalanceMap = useMemo(() => {
    const balanceById = new Map<string, number>();
    event.participants.forEach((participant) => {
      balanceById.set(participant.id, 0);
    });
    effectiveRawDebts.forEach((debt) => {
      balanceById.set(debt.from.id, (balanceById.get(debt.from.id) ?? 0) - debt.amount);
      balanceById.set(debt.to.id, (balanceById.get(debt.to.id) ?? 0) + debt.amount);
    });
    return balanceById;
  }, [effectiveRawDebts, event.participants]);

  return {
    currencyCode,
    rawDebts,
    payments,
    effectiveRawDebts,
    totalAmount,
    totalAmountDisplay,
    participantsCount,
    expensesCount,
    detailedDebts,
    simplifiedDebts,
    baseDetailedCount,
    baseSimplifiedCount,
    paidDetailedCount,
    paidSimplifiedCount,
    participantBalanceMap,
  };
}

