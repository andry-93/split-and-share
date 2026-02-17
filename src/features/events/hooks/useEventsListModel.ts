import { useMemo } from 'react';
import { EventGroupItem, EventItem } from '@/features/events/types/events';
import { useSelectorFactory } from '@/shared/hooks/useSelectorFactory';
import {
  createEventsListSelectors,
  PaymentEntry,
} from '@/state/events/eventsSelectors';
import { EventsState } from '@/state/events/eventsTypes';

export type EventListEntry =
  | { id: string; kind: 'group'; group: EventGroupItem; eventsCount: number }
  | { id: string; kind: 'event'; event: EventItem; payments: PaymentEntry[] };

type UseEventsListModelInput = {
  eventsState: EventsState;
  groupId?: string;
  query: string;
};

export function useEventsListModel({ eventsState, groupId, query }: UseEventsListModelInput) {
  const { events, groups, paymentsByEvent } = eventsState;
  const selectors = useSelectorFactory(createEventsListSelectors);

  const groupsById = useMemo(() => selectors.selectGroupsByIdMemo(groups), [groups, selectors]);
  const currentGroup = useMemo(
    () => selectors.selectCurrentGroupMemo(groupsById, groupId),
    [groupId, groupsById, selectors],
  );
  const effectiveGroupId = useMemo(
    () => selectors.selectEffectiveGroupIdMemo(currentGroup, groupId),
    [currentGroup, groupId, selectors],
  );

  const filteredEvents = useMemo(() => {
    return selectors.selectFilteredEventsMemo(events, effectiveGroupId, groupsById, query);
  }, [effectiveGroupId, events, groupsById, query, selectors]);

  const filteredGroups = useMemo(() => {
    return selectors.selectFilteredGroupsMemo(groups, effectiveGroupId, query, events);
  }, [effectiveGroupId, events, groups, query, selectors]);

  const eventsCountByGroup = useMemo(
    () => selectors.selectEventsCountByGroupMemo(events),
    [events, selectors],
  );

  const eventEntries = useMemo<EventListEntry[]>(
    () =>
      filteredEvents.map((event) => ({
        id: `event:${event.id}`,
        kind: 'event',
        event,
        payments: paymentsByEvent[event.id] ?? [],
      })),
    [filteredEvents, paymentsByEvent],
  );

  const groupEntries = useMemo<EventListEntry[]>(
    () =>
      filteredGroups.map((group) => ({
        id: `group:${group.id}`,
        kind: 'group',
        group,
        eventsCount: eventsCountByGroup.get(group.id) ?? 0,
      })),
    [eventsCountByGroup, filteredGroups],
  );

  const listEntries = useMemo(
    () => [...groupEntries, ...eventEntries],
    [eventEntries, groupEntries],
  );

  return {
    currentGroup,
    effectiveGroupId,
    listEntries,
  };
}
