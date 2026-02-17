import { useMemo } from 'react';
import { EventItem } from '@/features/events/types/events';
import { useSelectorFactory } from '@/shared/hooks/useSelectorFactory';
import {
  createEventDetailsSelectors,
  PaymentEntry,
} from '@/state/events/eventsSelectors';
import { EventsState } from '@/state/events/eventsTypes';
import { formatCurrencyAmount, getCurrencyDisplay } from '@/shared/utils/currency';

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

  const totalAmount = useMemo(
    () => selectors.selectOutstandingTotalMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const participantsCount = useMemo(
    () => selectors.selectOutstandingPeopleCountMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const expensesCount = useMemo(
    () => selectors.selectOutstandingTransfersCountMemo(effectiveRawDebts),
    [effectiveRawDebts, selectors],
  );
  const totalAmountDisplay = useMemo(
    () => formatCurrencyAmount(currencyCode, totalAmount),
    [currencyCode, totalAmount],
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
