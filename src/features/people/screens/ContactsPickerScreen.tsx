import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Checkbox, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '../../../navigation/types';
import { mockContacts, MockContact } from '../data/mockContacts';
import { usePeopleActions, usePeopleState } from '../../../state/people/peopleContext';
import { getInitialsAvatarColors } from '../../../shared/utils/avatarColors';
import { AppHeader } from '../../../shared/ui/AppHeader';

type ContactsPickerScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsPicker'>;

export function ContactsPickerScreen({ navigation }: ContactsPickerScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { addPeople } = usePeopleActions();
  const [query, setQuery] = useState('');
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
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return mockContacts;
    }

    return mockContacts.filter((contact) => contact.name.toLowerCase().includes(normalized));
  }, [query]);

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
    ({ item, index }: { item: MockContact; index: number }) => (
      <ContactRow
        contact={item}
        alreadyAdded={isAlreadyAdded(item)}
        selected={selectedSet.has(item.id)}
        withDivider={index < filteredContacts.length - 1}
        onToggle={handleToggle}
      />
    ),
    [filteredContacts.length, handleToggle, isAlreadyAdded, selectedSet],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Select contacts" onBackPress={handleBack} />

      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search contacts"
        style={[styles.search, { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.outlineVariant }]}
        inputStyle={styles.searchInput}
      />

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
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            style={styles.list}
            removeClippedSubviews
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={5}
            contentContainerStyle={styles.listContent}
            renderItem={renderContactItem}
          />
        </View>
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
  withDivider: boolean;
  onToggle: (contactId: string) => void;
};

const ContactRow = memo(function ContactRow({ contact, alreadyAdded, selected, withDivider, onToggle }: ContactRowProps) {
  const theme = useTheme();
  const avatarColors = getInitialsAvatarColors(theme.dark);
  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handlePress = useCallback(() => {
    onToggle(contact.id);
  }, [contact.id, onToggle]);

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
        <Text variant="titleMedium">{contact.name}</Text>
        <Text variant="bodyMedium">{contact.contact}</Text>
        {alreadyAdded ? (
          <Text variant="labelMedium" style={styles.alreadyAdded}>
            Already added
          </Text>
        ) : null}
      </View>
      <Checkbox status={selected ? 'checked' : 'unchecked'} disabled={alreadyAdded} onPress={handlePress} />
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
    height: 52,
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
    paddingBottom: 12,
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
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    borderRadius: 12,
  },
});
