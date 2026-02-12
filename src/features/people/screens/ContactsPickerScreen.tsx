import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';
import { mockContacts, MockContact } from '../data/mockContacts';
import { usePeopleActions, usePeopleState } from '../../../state/people/peopleContext';
import { AppHeader } from '../../../shared/ui/AppHeader';
import { AppList } from '../../../shared/ui/AppList';
import { PersonListRow } from '../components/PersonListRow';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { AppSearchbar } from '../../../shared/ui/AppSearchbar';

type ContactsPickerScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsPicker'>;

export function ContactsPickerScreen({ navigation }: ContactsPickerScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { addPeople } = usePeopleActions();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const peopleLookup = useMemo(() => {
    const nameSet = new Set<string>();
    const contactSet = new Set<string>();

    people.forEach((person) => {
      const normalizedName = person.name.trim().toLowerCase();
      if (normalizedName) {
        nameSet.add(normalizedName);
      }
      const normalizedContact = person.contact?.trim().toLowerCase();
      if (normalizedContact) {
        contactSet.add(normalizedContact);
      }
    });

    return { nameSet, contactSet };
  }, [people]);

  const filteredContacts = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return mockContacts;
    }

    return mockContacts.filter((contact) => contact.name.toLowerCase().includes(normalized));
  }, [debouncedQuery]);

  const selectedCount = selectedIds.length;

  const handleToggle = useCallback((contactId: string) => {
    setSelectedIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    );
  }, []);

  const handleAdd = useCallback(() => {
    const selectedContacts = mockContacts.filter((contact) => selectedIds.includes(contact.id));
    addPeople({ people: selectedContacts.map((contact) => ({ name: contact.name, contact: contact.contact })) });
    navigation.navigate('People');
  }, [addPeople, navigation, selectedIds]);

  const isAlreadyAdded = useCallback(
    (contact: MockContact) => {
      const normalizedName = contact.name.trim().toLowerCase();
      const normalizedContact = contact.contact.trim().toLowerCase();

      if (normalizedContact && peopleLookup.contactSet.has(normalizedContact)) {
        return true;
      }

      return peopleLookup.nameSet.has(normalizedName);
    },
    [peopleLookup],
  );

  const renderContactItem = useCallback(
    ({ item }: { item: MockContact }) => (
      <ContactRow
        contact={item}
        alreadyAdded={isAlreadyAdded(item)}
        selected={selectedSet.has(item.id)}
        onToggle={handleToggle}
      />
    ),
    [handleToggle, isAlreadyAdded, selectedSet],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Select contacts" onBackPress={handleBack} />

      <AppSearchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search contacts"
        style={styles.search}
      />

      <View style={styles.listWrapper}>
        <AppList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          listStyle={styles.list}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          renderItem={({ item }) => renderContactItem({ item })}
        />
      </View>

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
    </SafeAreaView>
  );
}

type ContactRowProps = {
  contact: MockContact;
  alreadyAdded: boolean;
  selected: boolean;
  onToggle: (contactId: string) => void;
};

const ContactRow = memo(function ContactRow({ contact, alreadyAdded, selected, onToggle }: ContactRowProps) {
  const handlePress = useCallback(() => {
    onToggle(contact.id);
  }, [contact.id, onToggle]);

  return (
    <PersonListRow
      name={contact.name}
      contact={contact.contact}
      metaText={alreadyAdded ? 'Already added' : undefined}
      muted={alreadyAdded}
      rightSlot={<Checkbox status={selected ? 'checked' : 'unchecked'} disabled={alreadyAdded} onPress={handlePress} />}
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
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
