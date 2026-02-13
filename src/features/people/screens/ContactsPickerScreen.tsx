import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Contacts from 'expo-contacts';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '@/navigation/types';
import { usePeopleActions, usePeopleState } from '@/state/people/peopleContext';
import { AppHeader } from '@/shared/ui/AppHeader';
import { AppList } from '@/shared/ui/AppList';
import { PersonListRow } from '@/features/people/components/PersonListRow';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { AppSearchbar } from '@/shared/ui/AppSearchbar';
import { getContactsPermissionStatus } from '@/features/people/services/contactsPermission';

type DeviceContact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

function normalizeContact(item: Contacts.Contact): DeviceContact | null {
  const runtimeContact = item as Contacts.Contact & { id?: string; rawId?: string };
  const runtimeId = runtimeContact.id ?? runtimeContact.rawId;
  const name = item.name?.trim() || `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
  const phone = item.phoneNumbers?.[0]?.number?.trim();
  const email = item.emails?.[0]?.email?.trim();
  const fallbackName = name || phone || email;

  if (!runtimeId || !fallbackName) {
    return null;
  }

  return {
    id: runtimeId,
    name: fallbackName,
    phone: phone || undefined,
    email: email || undefined,
  };
}

type ContactsPickerScreenProps = NativeStackScreenProps<PeopleStackParamList, 'ImportContactsPicker'>;

export function ContactsPickerScreen({ navigation }: ContactsPickerScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { people } = usePeopleState();
  const { addPeople } = usePeopleActions();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const permission = await getContactsPermissionStatus();
      if (permission !== 'granted') {
        navigation.replace('ImportContactsAccess');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      const normalized = data
        .map(normalizeContact)
        .filter((item): item is DeviceContact => Boolean(item));

      setContacts(normalized);
      setSelectedIds([]);
    } catch {
      setErrorMessage('Unable to load contacts. Please try again.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const peopleLookup = useMemo(() => {
    const nameSet = new Set<string>();
    const phoneSet = new Set<string>();
    const emailSet = new Set<string>();

    people.forEach((person) => {
      const normalizedName = person.name.trim().toLowerCase();
      if (normalizedName) {
        nameSet.add(normalizedName);
      }
      const normalizedPhone = person.phone?.trim().toLowerCase();
      if (normalizedPhone) {
        phoneSet.add(normalizedPhone);
      }
      const normalizedEmail = person.email?.trim().toLowerCase();
      if (normalizedEmail) {
        emailSet.add(normalizedEmail);
      }
    });

    return { nameSet, phoneSet, emailSet };
  }, [people]);

  const filteredContacts = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return contacts;
    }

    return contacts.filter((contact) => contact.name.toLowerCase().includes(normalized));
  }, [contacts, debouncedQuery]);

  const selectedCount = selectedIds.length;

  const handleToggle = useCallback((contactId: string) => {
    setSelectedIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    );
  }, []);

  const handleAdd = useCallback(() => {
    const selectedContacts = contacts.filter((contact) => selectedIds.includes(contact.id));
    addPeople({
      people: selectedContacts.map((contact) => ({
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      })),
    });
    navigation.navigate('People');
  }, [addPeople, contacts, navigation, selectedIds]);

  const isAlreadyAdded = useCallback(
    (contact: DeviceContact) => {
      const normalizedName = contact.name.trim().toLowerCase();
      const normalizedPhone = contact.phone?.trim().toLowerCase();
      const normalizedEmail = contact.email?.trim().toLowerCase();

      if (normalizedPhone && peopleLookup.phoneSet.has(normalizedPhone)) {
        return true;
      }

      if (normalizedEmail && peopleLookup.emailSet.has(normalizedEmail)) {
        return true;
      }

      return peopleLookup.nameSet.has(normalizedName);
    },
    [peopleLookup],
  );

  const renderContactItem = useCallback(
    ({ item }: { item: DeviceContact }) => (
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

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator />
        </View>
      ) : errorMessage ? (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium">{errorMessage}</Text>
          <Button mode="outlined" onPress={() => void loadContacts()}>
            Retry
          </Button>
        </View>
      ) : (
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
      )}

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
  contact: DeviceContact;
  alreadyAdded: boolean;
  selected: boolean;
  onToggle: (contactId: string) => void;
};

const ContactRow = memo(function ContactRow({ contact, alreadyAdded, selected, onToggle }: ContactRowProps) {
  const handlePress = useCallback(() => {
    if (alreadyAdded) {
      return;
    }
    onToggle(contact.id);
  }, [alreadyAdded, contact.id, onToggle]);

  return (
    <PersonListRow
      name={contact.name}
      phone={contact.phone}
      email={contact.email}
      metaText={alreadyAdded ? 'Already added' : undefined}
      muted={alreadyAdded}
      selectable
      selected={selected}
      selectionDisabled={alreadyAdded}
      onPress={handlePress}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
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
