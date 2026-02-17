import React, { memo, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PeopleStackParamList } from '@/navigation/types';
import { PersonItem } from '@/features/people/types/people';
import { AddPersonActionSheet } from '@/features/people/components/AddPersonActionSheet';
import { PersonListRow } from '@/features/people/components/PersonListRow';
import { usePeopleListModel } from '@/features/people/hooks/usePeopleListModel';
import { usePeopleActions, usePeopleState } from '@/state/people/peopleContext';
import { useEventsActions } from '@/state/events/eventsContext';
import { useConfirmState } from '@/shared/hooks/useConfirmState';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { DraggableFab } from '@/shared/ui/DraggableFab';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { useDismissBottomSheetsOnBlur } from '@/shared/hooks/useDismissBottomSheetsOnBlur';
import { useSelectionListMode } from '@/shared/hooks/useSelectionListMode';
import { isCurrentUserPerson } from '@/shared/utils/people';
import { getContactsPermissionStatus } from '@/features/people/services/contactsPermission';
import { SelectionActionToolbar } from '@/shared/ui/SelectionActionToolbar';
import { BottomTabSwipeBoundary } from '@/shared/ui/BottomTabSwipeBoundary';
import { SelectionDeleteConfirm } from '@/shared/ui/SelectionDeleteConfirm';

type PeopleListScreenProps = NativeStackScreenProps<PeopleStackParamList, 'People'>;

export function PeopleListScreen({ navigation }: PeopleListScreenProps) {
  const theme = useTheme();
  const { people } = usePeopleState();
  const { removePeople } = usePeopleActions();
  const { removePeopleEverywhere } = useEventsActions();
  const [query, setQuery] = useState('');
  const { isVisible: isDeleteConfirmVisible, open: openDeleteConfirm, close: closeDeleteConfirm } =
    useConfirmState();
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

  const { filteredPeople } = usePeopleListModel({
    people,
    query: debouncedQuery,
  });

  const {
    isEditMode,
    selectedIds,
    selectedSet,
    exitEditMode,
    toggleSelection,
    enterEditMode,
    getToolbarProps,
  } = useSelectionListMode<PersonItem>({
    items: filteredPeople,
    canSelect: (person) => !isCurrentUserPerson(person),
  });

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }
    removePeople({ ids: selectedIds });
    removePeopleEverywhere({ personIds: selectedIds });
    closeDeleteConfirm();
    exitEditMode();
  }, [closeDeleteConfirm, exitEditMode, removePeople, removePeopleEverywhere, selectedIds]);

  const renderPersonItem = useCallback(
    ({ item }: { item: PersonItem }) => {
      return (
        <PersonRow
          person={item}
          isEditMode={isEditMode}
          selected={selectedSet.has(item.id)}
          onToggleSelection={toggleSelection}
          onEnterEditMode={enterEditMode}
          onEditPerson={handleEditPerson}
        />
      );
    },
    [enterEditMode, handleEditPerson, isEditMode, selectedSet, toggleSelection],
  );

  return (
    <BottomTabSwipeBoundary currentTab="PeopleTab" enabled={!isEditMode}>
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      {isEditMode ? (
        <SelectionActionToolbar
          {...getToolbarProps(openDeleteConfirm)}
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
            renderItem={renderPersonItem}
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

      <SelectionDeleteConfirm
        visible={isDeleteConfirmVisible}
        title="Delete contacts"
        message="Selected contacts will be deleted with all related data across events."
        onDismiss={closeDeleteConfirm}
        onConfirm={handleDeleteSelected}
      />
      </SafeAreaView>
    </BottomTabSwipeBoundary>
  );
}

const PersonRow = memo(function PersonRow({
  person,
  isEditMode,
  selected,
  onToggleSelection,
  onEnterEditMode,
  onEditPerson,
}: {
  person: PersonItem;
  isEditMode: boolean;
  selected: boolean;
  onToggleSelection: (person: PersonItem) => void;
  onEnterEditMode: (person: PersonItem) => void;
  onEditPerson: (personId: string) => void;
}) {
  const handlePress = useCallback(() => {
    if (isEditMode) {
      onToggleSelection(person);
      return;
    }
    onEditPerson(person.id);
  }, [isEditMode, onEditPerson, onToggleSelection, person]);

  const handleLongPress = useCallback(() => {
    if (!isEditMode) {
      onEnterEditMode(person);
    }
  }, [isEditMode, onEnterEditMode, person]);

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
      onPress={handlePress}
      onLongPress={handleLongPress}
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
