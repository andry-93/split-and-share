import { useMemo } from 'react';
import { EventItem } from '@/features/events/types/events';
import { useSelectorFactory } from '@/shared/hooks/useSelectorFactory';
import {
  createEventDetailsSelectors,
  PaymentEntry,
} from '@/state/events/eventsSelectors';
import { EventsState } from '@/state/events/eventsTypes';
import { getCurrencyDisplay } from '@/shared/utils/currency';
import { formatCurrencyAmount } from '@/shared/utils/money';

type UseEventDetailsModelInput = {
  event: EventItem;
  eventsState: EventsState;
  settingsCurrency: string;
};

export function useEventDetailsModel({ event, eventsState, settingsCurrency }: UseEventDetailsModelInput) {
  const selectors = useSelectorFactory(createEventDetailsSelectors);

  const currencyCode = useMemo(
    () => getCurrencyDisplay(event.currency ?? settingsCurrency),
    [event.currency, settingsCurrency],
  );

  const rawDebts = useMemo(() => selectors.selectRawDebtsMemo(event), [event, selectors]);
  const payments = useMemo<PaymentEntry[]>(
    () => selectors.selectPaymentsMemo(eventsState, event.id),
    [event.id, eventsState, selectors],
  );
  const effectiveRawDebts = useMemo(
    () => selectors.selectEffectiveRawDebtsMemo(rawDebts, payments),
    [payments, rawDebts, selectors],
  );

  const outstandingTotalAmount = useMemo(
    () => selectors.selectOutstandingTotalMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const outstandingParticipantsCount = useMemo(
    () => selectors.selectOutstandingPeopleCountMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const outstandingTransfersCount = useMemo(
    () => selectors.selectOutstandingTransfersCountMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const outstandingTotalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, outstandingTotalAmount),
    [currencyCode, outstandingTotalAmount],
  );
  const eventStats = useMemo(
    () => selectors.selectEventStatsMemo(event),
    [event, selectors],
  );
  const eventTotalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, eventStats.totalAmount),
    [currencyCode, eventStats.totalAmount],
  );

  const detailedDebts = useMemo(
    () => selectors.selectDetailedDebtsMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const simplifiedDebts = useMemo(
    () => selectors.selectSimplifiedDebtsMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );

  const baseDetailedCount = useMemo(
    () => selectors.selectDetailedDebtsMemo(rawDebts).length,
    [rawDebts, selectors],
  );
  const baseSimplifiedCount = useMemo(
    () => selectors.selectSimplifiedDebtsMemo(rawDebts).length,
    [rawDebts, selectors],
  );
  const paidDetailedCount = Math.max(0, baseDetailedCount - detailedDebts.length);
  const paidSimplifiedCount = Math.max(0, baseSimplifiedCount - simplifiedDebts.length);

  const participantBalanceMap = useMemo(
    () => selectors.selectParticipantBalanceMapMemo(event.participants, effectiveRawDebts),
    [effectiveRawDebts, event.participants, selectors],
  );

  const poolBalanceMap = useMemo(
    () => selectors.selectPoolBalanceMapMemo(event, payments),
    [event, payments, selectors],
  );

  return {
    currencyCode,
    rawDebts,
    payments,
    effectiveRawDebts,
    eventStats,
    eventTotalAmountDisplay,
    outstandingTotalAmount,
    outstandingTotalAmountDisplay,
    outstandingParticipantsCount,
    outstandingTransfersCount,
    detailedDebts,
    simplifiedDebts,
    baseDetailedCount,
    baseSimplifiedCount,
    paidDetailedCount,
    paidSimplifiedCount,
    participantBalanceMap,
    poolBalanceMap,
  };
}
