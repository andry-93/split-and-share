import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EventPayment, createEventPayment } from '@/state/events/paymentsModel';
import { createEntityId } from '@/shared/utils/id';

type UseManagePoolFormInput = {
  eventId: string;
  poolId?: string;
  initialName?: string;
  initialContributions?: EventPayment[];
};

export function useManagePoolForm({
  eventId,
  poolId,
  initialName = '',
  initialContributions = [],
}: UseManagePoolFormInput) {
  const [name, setName] = useState(initialName);
  const [contributions, setContributions] = useState<EventPayment[]>(initialContributions);

  const isSaveDisabled = !name.trim();

  const lastInitializedNameRef = useRef<string | undefined>(undefined);
  const lastInitializedContributionsRef = useRef<EventPayment[] | undefined>(undefined);

  useEffect(() => {
    if (
      lastInitializedNameRef.current === initialName &&
      lastInitializedContributionsRef.current === initialContributions
    ) {
      return;
    }
    lastInitializedNameRef.current = initialName;
    lastInitializedContributionsRef.current = initialContributions;
    setName(initialName);
    setContributions(initialContributions);
  }, [initialName, initialContributions]);

  const virtualTotalMinor = useMemo(() => {
    return contributions.reduce((sum, c) => sum + c.amountMinor, 0);
  }, [contributions]);

  const updateContributionAmount = useCallback((paymentId: string, amountMinor: number) => {
    setContributions((current) =>
      current.map((c) => (c.id === paymentId ? { ...c, amountMinor } : c)),
    );
  }, []);

  const removeContributor = useCallback((paymentId: string) => {
    setContributions((current) => current.filter((c) => c.id !== paymentId));
  }, []);

  const addContributor = useCallback((personId: string, amountMinor: number) => {
    if (!poolId) return; // Should not happen in edit mode

    setContributions((current) => {
      // If user is already in the list, just return the current list
      // This prevents adding the same person multiple times.
      if (current.some(c => c.fromId === personId)) {
        return current;
      }

      const newPayment = createEventPayment({
        id: createEntityId('payment'),
        eventId,
        fromId: personId,
        toId: poolId,
        amountMinor,
        source: 'pool',
      });

      return [...current, newPayment];
    });
  }, [eventId, poolId]);

  return {
    name,
    setName,
    contributions,
    virtualTotalMinor,
    updateContributionAmount,
    removeContributor,
    addContributor,
    isSaveDisabled,
  };
}
