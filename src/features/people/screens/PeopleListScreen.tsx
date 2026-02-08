import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PeopleStackParamList } from '../../../navigation/types';
import { PersonItem } from '../types/people';
import { AddPersonActionSheet } from '../components/AddPersonActionSheet';
import { PersonListRow } from '../components/PersonListRow';
import { usePeopleState } from '../../../state/people/peopleContext';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { AppHeader } from '../../../shared/ui/AppHeader';

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

  const filteredPeople = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return people;
    }

    return people.filter((person) => person.name.toLowerCase().includes(normalized));
  }, [debouncedQuery, people]);

  const renderPersonItem = useCallback(
    ({ item, index }: { item: PersonItem; index: number }) => (
      <PersonRow person={item} withDivider={index < filteredPeople.length - 1} />
    ),
    [filteredPeople.length],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="People" />

      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search people"
        style={[styles.search, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.outlineVariant }]}
        inputStyle={styles.searchInput}
      />

      {filteredPeople.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium">No people yet</Text>
          <Text variant="bodyMedium">Add people to easily split expenses.</Text>
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
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              contentContainerStyle={styles.listContent}
              renderItem={renderPersonItem}
            />
          </View>
        </View>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, styles.fabNoShadow, { backgroundColor: '#2563FF' }]}
        color="#FFFFFF"
        onPress={handleOpenSheet}
      />
      <AddPersonActionSheet
        ref={sheetRef}
        onAddManual={handleAddManual}
        onImportContacts={handleImportContacts}
      />
    </SafeAreaView>
  );
}

const PersonRow = memo(function PersonRow({ person, withDivider }: { person: PersonItem; withDivider: boolean }) {
  return (
    <PersonListRow name={person.name} contact={person.contact} withDivider={withDivider} />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 0,
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  listContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabNoShadow: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
});
