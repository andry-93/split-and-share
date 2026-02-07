import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PeopleStackParamList } from '../../../navigation/types';
import { PersonItem } from '../types/people';
import { AddPersonActionSheet } from '../components/AddPersonActionSheet';
import { usePeopleState } from '../../../state/people/peopleContext';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

type PeopleListScreenProps = NativeStackScreenProps<PeopleStackParamList, 'People'>;

export function PeopleListScreen({ navigation }: PeopleListScreenProps) {
  const theme = useTheme();
  const { people } = usePeopleState();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleAddManual = useCallback(() => {
    sheetRef.current?.dismiss();
    navigation.navigate('AddPerson');
  }, [navigation]);

  const handleImportContacts = useCallback(() => {
    sheetRef.current?.dismiss();
    navigation.navigate('ImportContactsAccess');
  }, [navigation]);

  const renderPersonItem = useCallback(
    ({ item }: { item: PersonItem }) => <PersonRow person={item} />,
    [],
  );

  const filteredPeople = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return people;
    }

    return people.filter((person) => person.name.toLowerCase().includes(normalized));
  }, [debouncedQuery, people]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.Content title="People" />
      </Appbar.Header>

      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search people"
        style={styles.search}
      />

      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        style={styles.list}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={[
          styles.listContent,
          filteredPeople.length === 0 ? styles.listEmpty : null,
        ]}
        renderItem={renderPersonItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No people yet</Text>
            <Text variant="bodyMedium">Add people to easily split expenses.</Text>
          </View>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={handleOpenSheet} />
      <AddPersonActionSheet
        ref={sheetRef}
        onAddManual={handleAddManual}
        onImportContacts={handleImportContacts}
      />
    </SafeAreaView>
  );
}

const PersonRow = memo(function PersonRow({ person }: { person: PersonItem }) {
  const initials = person.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <View style={styles.row}>
      <Avatar.Text size={40} label={initials || '?'} style={styles.avatar} />
      <View style={styles.rowText}>
        <Text variant="titleMedium">{person.name}</Text>
        {person.contact ? <Text variant="bodyMedium">{person.contact}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
});
