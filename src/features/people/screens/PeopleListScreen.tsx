import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
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
import { AppList } from '../../../shared/ui/AppList';
import { DraggableFab } from '../../../shared/ui/DraggableFab';
import { AppSearchbar } from '../../../shared/ui/AppSearchbar';
import { useDismissBottomSheetsOnBlur } from '../../../shared/hooks/useDismissBottomSheetsOnBlur';
import { isCurrentUserPerson, sortPeopleWithCurrentUserFirst } from '../../../shared/utils/people';

type PeopleListScreenProps = NativeStackScreenProps<PeopleStackParamList, 'People'>;

export function PeopleListScreen({ navigation }: PeopleListScreenProps) {
  const theme = useTheme();
  const { people } = usePeopleState();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const sheetRef = useRef<BottomSheetModal>(null);
  useDismissBottomSheetsOnBlur([sheetRef]);

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleAddManual = useCallback(() => {
    sheetRef.current?.dismiss();
    navigation.navigate('AddPerson');
  }, [navigation]);

  const handleEditPerson = useCallback(
    (personId: string) => {
      navigation.navigate("AddPerson", { personId });
    },
    [navigation],
  );

  const handleImportContacts = useCallback(() => {
    sheetRef.current?.dismiss();
    navigation.navigate('ImportContactsAccess');
  }, [navigation]);

  const filteredPeople = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return sortPeopleWithCurrentUserFirst(people);
    }

    return sortPeopleWithCurrentUserFirst(
      people.filter((person) => person.name.toLowerCase().includes(normalized)),
    );
  }, [debouncedQuery, people]);

  const renderPersonItem = useCallback(
    ({ item }: { item: PersonItem }) => (
      <PersonRow
        person={item}
        onPress={() => handleEditPerson(item.id)}
      />
    ),
    [handleEditPerson],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="People" />

      <AppSearchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search people"
        style={styles.search}
      />

      {filteredPeople.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium">No people yet</Text>
          <Text variant="bodyMedium">Add people to easily split expenses.</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <AppList
            data={filteredPeople}
            keyExtractor={(item) => item.id}
            listStyle={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => renderPersonItem({ item })}
          />
        </View>
      )}

      <DraggableFab
        icon="plus"
        color="#FFFFFF"
        backgroundColor="#2563FF"
        onPress={handleOpenSheet}
        topBoundary={124}
      />
      <AddPersonActionSheet
        ref={sheetRef}
        onAddManual={handleAddManual}
        onImportContacts={handleImportContacts}
      />
    </SafeAreaView>
  );
}

const PersonRow = memo(function PersonRow({
  person,
  onPress,
}: {
  person: PersonItem;
  onPress: () => void;
}) {
  return (
    <PersonListRow
      name={person.name}
      contact={person.contact}
      isCurrentUser={isCurrentUserPerson(person)}
      onPress={onPress}
    />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 8,
  },
});
