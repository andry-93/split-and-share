import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { PeopleStackParamList } from '@/navigation/types';
import { PersonItem } from '@/features/people/types/people';
import { AddPersonActionSheet } from '@/features/people/components/AddPersonActionSheet';
import { PersonListRow } from '@/features/people/components/PersonListRow';
import { usePeopleActions, usePeopleState } from '@/state/people/peopleContext';
import { useEventsActions } from '@/state/events/eventsContext';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { DraggableFab } from '@/shared/ui/DraggableFab';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { useSelectionMode } from '@/shared/hooks/useSelectionMode';
import { isCurrentUserPerson, sortPeopleWithCurrentUserFirst } from '@/shared/utils/people';
import { getContactsPermissionStatus } from '@/features/people/services/contactsPermission';
import { SelectionActionToolbar } from '@/shared/ui/SelectionActionToolbar';
import { AppConfirm } from '@/shared/ui/AppConfirm';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';

type PeopleListScreenProps = NativeStackScreenProps<PeopleStackParamList, 'People'>;

export function PeopleListScreen({ navigation }: PeopleListScreenProps) {
  const theme = useTheme();
  const { people } = usePeopleState();
  const { removePeople } = usePeopleActions();
  const { removePeopleEverywhere } = useEventsActions();
  const [query, setQuery] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
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
      navigation.navigate('AddPerson', { personId });
    },
    [navigation],
  );

  const handleImportContacts = useCallback(async () => {
    sheetRef.current?.dismiss();
    const status = await getContactsPermissionStatus();
    if (status === 'granted') {
      navigation.navigate('ImportContactsPicker');
      return;
    }
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

  const {
    isEditMode,
    selectedIds,
    selectedSet,
    selectableIds,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    toggleSelectAll,
  } = useSelectionMode<PersonItem>({
    items: filteredPeople,
    canSelect: (person) => !isCurrentUserPerson(person),
  });

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    removePeople({ ids: selectedIds });
    removePeopleEverywhere({ personIds: selectedIds });
    setIsDeleteConfirmVisible(false);
    exitEditMode();
  }, [exitEditMode, removePeople, removePeopleEverywhere, selectedIds]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isEditMode) {
          return false;
        }
        exitEditMode();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        subscription.remove();
      };
    }, [exitEditMode, isEditMode]),
  );

  const renderPersonItem = useCallback(
    ({ item }: { item: PersonItem }) => (
      <PersonRow
        person={item}
        isEditMode={isEditMode}
        selected={selectedSet.has(item.id)}
        onPress={() => {
          if (isEditMode) {
            toggleSelection(item);
            return;
          }
          handleEditPerson(item.id);
        }}
        onLongPress={() => {
          if (!isEditMode) {
            enterEditMode(item);
          }
        }}
      />
    ),
    [enterEditMode, handleEditPerson, isEditMode, selectedSet, toggleSelection],
  );

  return (
    <BottomTabSwipeBoundary currentTab="PeopleTab" enabled={!isEditMode}>
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      {isEditMode ? (
        <SelectionActionToolbar
          title={`Selected ${selectedIds.length}`}
          totalSelectableCount={selectableIds.length}
          selectedCount={selectedIds.length}
          onToggleSelectAll={toggleSelectAll}
          onDelete={() => setIsDeleteConfirmVisible(true)}
          onClose={exitEditMode}
        />
      ) : (
        <AppHeader title="People" />
      )}

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

      {!isEditMode ? (
        <>
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
        </>
      ) : null}

      <AppConfirm
        visible={isDeleteConfirmVisible}
        title="Delete contacts"
        onDismiss={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDeleteSelected}
        confirmText="Delete"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Selected contacts will be deleted with all related data across events.
        </Text>
      </AppConfirm>
      </SafeAreaView>
    </BottomTabSwipeBoundary>
  );
}

const PersonRow = memo(function PersonRow({
  person,
  isEditMode,
  selected,
  onPress,
  onLongPress,
}: {
  person: PersonItem;
  isEditMode: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <PersonListRow
      name={person.name}
      phone={person.phone}
      email={person.email}
      muted={isEditMode && isCurrentUserPerson(person)}
      isCurrentUser={isCurrentUserPerson(person)}
      selectable={isEditMode}
      selected={selected}
      selectionDisabled={isCurrentUserPerson(person)}
      onPress={onPress}
      onLongPress={onLongPress}
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
