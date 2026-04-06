import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { usePeopleListModel } from '@/features/people/hooks/usePeopleListModel';
import { EventsStackParamList } from '@/navigation/types';
import { usePeopleState } from '@/state/people/peopleContext';
import { useEventsActions, useEventsState } from '@/state/events/eventsContext';
import { PersonItem } from '@/features/people/types/people';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { PersonListRow } from '@/features/people/components/PersonListRow';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { isCurrentUserPerson } from '@/shared/utils/people';

type AddPeopleToEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddPeopleToEvent'>;

export function AddPeopleToEventScreen({ navigation, route }: AddPeopleToEventScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { events } = useEventsState();
  const { addPeopleToEvent } = useEventsActions();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const event = events.find((item) => item.id === route.params.eventId);
  const participants = event?.participants ?? [];
  const participantIds = useMemo(() => new Set(participants.map((item) => item.id)), [participants]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const { filteredPeople } = usePeopleListModel({
    people,
    query: debouncedQuery,
  });

  const allAdded = people.length > 0 && people.every((person) => participantIds.has(person.id));
  const selectedCount = selectedIds.length;

  const toggleSelect = useCallback(
    (personId: string) => {
      if (participantIds.has(personId)) {
        return;
      }

      setSelectedIds((prev) =>
        prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId],
      );
    },
    [participantIds],
  );

  const handleAdd = useCallback(() => {
    const selectedPeople = people.filter((person) => selectedIds.includes(person.id));
    addPeopleToEvent({ eventId: route.params.eventId, people: selectedPeople });
    navigation.goBack();
  }, [addPeopleToEvent, navigation, people, route.params.eventId, selectedIds]);

  const renderPersonItem = useCallback(
    ({ item }: { item: PersonItem }) => {
      return (
        <SelectablePersonRow
          person={item}
          alreadyAdded={participantIds.has(item.id)}
          selected={selectedSet.has(item.id)}
          onToggle={toggleSelect}
        />
      );
    },
    [participantIds, selectedSet, toggleSelect],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title={t('events.tabs.addPeopleToEvent')} onBackPress={() => navigation.goBack()} />
      

      {!allAdded ? (
        <AppSearchbar
          value={query}
          onChangeText={setQuery}
          placeholder={t('people.searchPeople')}
          style={styles.search}
        />
      ) : null}

      {allAdded ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium" style={styles.emptyStateText}>{t('people.import.everyoneAlreadyAdded')}</Text>
          <Text variant="bodyMedium" style={styles.emptyStateText}>{t('people.import.allAlreadyInEvent')}</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <AppList
            data={filteredPeople}
            keyExtractor={(item) => item.id}
            listStyle={styles.list}
            contentContainerStyle={styles.listContent}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={5}
            renderItem={renderPersonItem}
          />
        </View>
      )}

      {!allAdded ? (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outlineVariant,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Button mode="contained" onPress={handleAdd} disabled={selectedCount === 0} style={styles.actionButton}>
            {selectedCount > 0 ? t('people.import.addSelectedCount', { count: selectedCount }) : t('people.import.addSelected')}
          </Button>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

type SelectablePersonRowProps = {
  person: PersonItem;
  alreadyAdded: boolean;
  selected: boolean;
  onToggle: (personId: string) => void;
};

const SelectablePersonRow = memo(function SelectablePersonRow({
  person,
  alreadyAdded,
  selected,
  onToggle,
}: SelectablePersonRowProps) {
  const { t } = useTranslation();
  const handleToggle = useCallback(() => {
    onToggle(person.id);
  }, [onToggle, person.id]);

  return (
    <PersonListRow
      name={person.name}
      phone={person.phone}
      email={person.email}
      metaText={alreadyAdded ? t('people.import.alreadyAdded') : undefined}
      muted={alreadyAdded}
      isCurrentUser={isCurrentUserPerson(person)}
      selectable
      selected={selected}
      selectionDisabled={alreadyAdded}
      onPress={handleToggle}
    />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    borderRadius: 12,
  },
});
