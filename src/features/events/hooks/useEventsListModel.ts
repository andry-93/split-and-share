import { useMemo } from 'react';
import { EventGroupItem, EventItem } from '@/features/events/types/events';
import {
  PaymentEntry,
  selectEventsSortedByUpdatedAt,
  selectGroupsSortedByUpdatedAt,
  selectPayments,
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
  const { events, groups } = eventsState;

  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);
  const currentGroup = groupId ? groupsById.get(groupId) : undefined;
  const effectiveGroupId = currentGroup ? groupId : undefined;

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const baseEvents = events.filter((event) => {
      if (effectiveGroupId) {
        return event.groupId === effectiveGroupId;
      }

      if (!event.groupId) {
        return true;
      }

      return !groupsById.has(event.groupId);
    });

    const matches = !normalized
      ? baseEvents
      : baseEvents.filter((event) => event.name.toLowerCase().includes(normalized));

    return selectEventsSortedByUpdatedAt(matches);
  }, [effectiveGroupId, events, groupsById, query]);

  const filteredGroups = useMemo(() => {
    if (effectiveGroupId) {
      return [];
    }
    const normalized = query.trim().toLowerCase();
    const matches = !normalized
      ? groups
      : groups.filter((group) => {
          if (group.name.toLowerCase().includes(normalized)) {
            return true;
          }

          return events.some(
            (event) => event.groupId === group.id && event.name.toLowerCase().includes(normalized),
          );
        });

    return selectGroupsSortedByUpdatedAt(matches);
  }, [effectiveGroupId, events, groups, query]);

  const eventEntries = useMemo<EventListEntry[]>(
    () =>
      filteredEvents.map((event) => ({
        id: `event:${event.id}`,
        kind: 'event',
        event,
        payments: selectPayments(eventsState, event.id),
      })),
    [eventsState, filteredEvents],
  );

  const groupEntries = useMemo<EventListEntry[]>(
    () =>
      filteredGroups.map((group) => ({
        id: `group:${group.id}`,
        kind: 'group',
        group,
        eventsCount: events.filter((event) => event.groupId === group.id).length,
      })),
    [events, filteredGroups],
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

