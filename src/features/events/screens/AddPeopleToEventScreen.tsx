import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Checkbox, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { usePeopleState } from '../../../state/people/peopleContext';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import { PersonItem } from '../../people/types/people';
import { getInitialsAvatarColors } from '../../../shared/utils/avatarColors';
import { AppHeader } from '../../../shared/ui/AppHeader';

type AddPeopleToEventScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddPeopleToEvent'>;

export function AddPeopleToEventScreen({ navigation, route }: AddPeopleToEventScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { events } = useEventsState();
  const { addPeopleToEvent } = useEventsActions();
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const event = events.find((item) => item.id === route.params.eventId);
  const participants = event?.participants ?? [];
  const participantIds = useMemo(() => new Set(participants.map((item) => item.id)), [participants]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return people;
    }

    return people.filter((person) => person.name.toLowerCase().includes(normalized));
  }, [people, query]);

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
    ({ item, index }: { item: PersonItem; index: number }) => (
      <SelectablePersonRow
        person={item}
        alreadyAdded={participantIds.has(item.id)}
        selected={selectedSet.has(item.id)}
        withDivider={index < filteredPeople.length - 1}
        onToggle={toggleSelect}
      />
    ),
    [filteredPeople.length, participantIds, selectedSet, toggleSelect],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Add people" onBackPress={() => navigation.goBack()} />

      {!allAdded ? (
        <Searchbar
          value={query}
          onChangeText={setQuery}
          placeholder="Search people"
          style={[styles.search, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.outlineVariant }]}
          inputStyle={styles.searchInput}
        />
      ) : null}

      {allAdded ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium">Everyone is already added</Text>
          <Text variant="bodyMedium">All people are already part of this event.</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <View
            style={[
              styles.listContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <FlatList
              data={filteredPeople}
              keyExtractor={(item) => item.id}
              style={styles.list}
              removeClippedSubviews
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={5}
              contentContainerStyle={styles.listContent}
              renderItem={renderPersonItem}
            />
          </View>
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
            {selectedCount > 0 ? `Add selected (${selectedCount})` : 'Add selected'}
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
  withDivider: boolean;
  onToggle: (personId: string) => void;
};

const SelectablePersonRow = memo(function SelectablePersonRow({
  person,
  alreadyAdded,
  selected,
  withDivider,
  onToggle,
}: SelectablePersonRowProps) {
  const theme = useTheme();
  const avatarColors = getInitialsAvatarColors(theme.dark);
  const initials = person.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleToggle = useCallback(() => {
    onToggle(person.id);
  }, [onToggle, person.id]);

  return (
    <View
      style={[
        styles.row,
        alreadyAdded ? styles.rowMuted : null,
        withDivider
          ? {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.colors.outlineVariant,
            }
          : null,
      ]}
    >
      <Avatar.Text
        size={40}
        label={initials || '?'}
        style={[styles.avatar, { backgroundColor: avatarColors.backgroundColor }]}
        color={avatarColors.labelColor}
      />
      <View style={styles.rowText}>
        <Text variant="titleMedium">{person.name}</Text>
        {alreadyAdded ? (
          <Text variant="labelMedium" style={styles.alreadyAdded}>
            Already added
          </Text>
        ) : null}
      </View>
      <Checkbox status={selected ? 'checked' : 'unchecked'} disabled={alreadyAdded} onPress={handleToggle} />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchInput: {
    marginVertical: 0,
    minHeight: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  list: {
    flexGrow: 0,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  listContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowMuted: {
    opacity: 0.5,
  },
  avatar: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  alreadyAdded: {
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
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
