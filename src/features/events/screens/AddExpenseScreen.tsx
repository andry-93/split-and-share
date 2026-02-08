import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, Icon, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsActions, useEventsState } from '../../../state/events/eventsContext';
import { useSettingsState } from '../../../state/settings/settingsContext';
import { OutlinedFieldContainer } from '../../../shared/ui/OutlinedFieldContainer';
import { BottomSheetSingleSelectRow } from '../../../shared/ui/BottomSheetSingleSelectRow';
import { normalizeCurrencyCode } from '../../../shared/utils/currency';
import { AppHeader } from '../../../shared/ui/AppHeader';

const categoryOptions = [
  { id: 'food', label: 'Food', icon: 'cart-outline' },
  { id: 'transport', label: 'Transport', icon: 'car-outline' },
  { id: 'lodging', label: 'Lodging', icon: 'home-outline' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
] as const;
type CategoryId = (typeof categoryOptions)[number]['id'];

type AddExpenseScreenProps = NativeStackScreenProps<EventsStackParamList, 'AddExpense'>;

export function AddExpenseScreen({ navigation, route }: AddExpenseScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsState();
  const { events } = useEventsState();
  const { addExpense } = useEventsActions();
  const event = useMemo(
    () => events.find((item) => item.id === route.params.eventId),
    [events, route.params.eventId],
  );
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const participantNames = useMemo(
    () => event?.participants.map((participant) => participant.name) ?? [],
    [event?.participants],
  );
  const [paidBy, setPaidBy] = useState(participantNames[0] ?? '');
  const [category, setCategory] = useState<CategoryId>('food');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participantNames);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedSet = useMemo(() => new Set(selectedParticipants), [selectedParticipants]);
  const selectedCurrency = useMemo(
    () => normalizeCurrencyCode(event?.currency ?? settings.currency),
    [event?.currency, settings.currency],
  );

  const isSaveDisabled = useMemo(() => {
    return amount.trim().length === 0 || title.trim().length === 0 || paidBy.trim().length === 0;
  }, [amount, paidBy, title]);

  useEffect(() => {
    if (participantNames.length === 0) {
      setPaidBy('');
      setSelectedParticipants([]);
      return;
    }

    setPaidBy((prev) => (participantNames.includes(prev) ? prev : participantNames[0]));
    setSelectedParticipants((prev) => {
      const next = prev.filter((name) => participantNames.includes(name));
      return next.length > 0 ? next : [...participantNames];
    });
  }, [participantNames]);

  const toggleParticipant = useCallback((name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  }, []);

  const snapPoints = useMemo(() => ['40%'], []);

  const openPaidByPicker = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const handleSelectPaidBy = useCallback((name: string) => {
    setPaidBy(name);
    sheetRef.current?.dismiss();
  }, []);

  const renderParticipantRow = useCallback(
    (name: string) => (
      <ParticipantRow
        key={name}
        name={name}
        selected={selectedSet.has(name)}
        onToggle={toggleParticipant}
      />
    ),
    [selectedSet, toggleParticipant],
  );

  const renderPaidByOption = useCallback(
    (name: string, index: number) => (
      <PaidByOptionRow
        key={name}
        name={name}
        selected={paidBy === name}
        onSelect={handleSelectPaidBy}
        isLast={index === participantNames.length - 1}
      />
    ),
    [handleSelectPaidBy, paidBy, participantNames.length],
  );

  const handleSave = useCallback(() => {
    const parsedAmount = Number(amount.replace(',', '.'));
    if (!paidBy.trim()) {
      setErrorMessage('Select who paid this expense.');
      return;
    }

    try {
      addExpense({
        eventId: route.params.eventId,
        expense: {
          title,
          amount: parsedAmount,
          paidBy,
        },
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save expense.';
      setErrorMessage(message);
    }
  }, [addExpense, amount, navigation, paidBy, route.params.eventId, title]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <AppHeader title="Add Expense" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.form,
            styles.formContentGrow,
            { paddingBottom: 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Amount
          </Text>
          <OutlinedFieldContainer style={styles.amountInputContainer}>
            <Text variant="headlineSmall" style={styles.amountCurrency}>
              {selectedCurrency}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              mode="flat"
              style={[styles.amountInlineInput, { backgroundColor: 'transparent' }]}
              contentStyle={styles.amountInlineInputContent}
              underlineStyle={styles.hiddenUnderline}
              placeholder="0.00"
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.sectionLabel}>
            Title
          </Text>
          <OutlinedFieldContainer style={styles.titleInputContainer}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              mode="flat"
              style={[styles.titleInlineInput, { backgroundColor: 'transparent' }]}
              contentStyle={styles.titleInlineInputContent}
              underlineStyle={styles.hiddenUnderline}
              placeholder="e.g. Dinner, Taxi, Hotel"
            />
          </OutlinedFieldContainer>

          <Text variant="labelLarge" style={styles.sectionLabel}>
            Category
          </Text>
          <View style={styles.categoryRow}>
            {categoryOptions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setCategory(item.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      category === item.id ? theme.colors.primary : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Icon
                  source={item.icon}
                  size={20}
                  color={category === item.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="labelMedium"
                  style={{
                    color: category === item.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Paid by
            </Text>
            <OutlinedFieldContainer>
              <Pressable
                onPress={openPaidByPicker}
                style={styles.selectField}
              >
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {paidBy}
                </Text>
                <Icon source="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            </OutlinedFieldContainer>
          </View>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Split between
            </Text>
            <OutlinedFieldContainer style={styles.participantsCard}>
              {participantNames.map((name, index) => (
                <View key={name}>
                  {index > 0 ? <Divider /> : null}
                  {renderParticipantRow(name)}
                </View>
              ))}
            </OutlinedFieldContainer>
          </View>
        </ScrollView>

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
          <Button mode="contained" onPress={handleSave} disabled={isSaveDisabled}>
            Save expense
          </Button>
        </View>
      </KeyboardAvoidingView>

      <Snackbar visible={errorMessage.length > 0} onDismiss={() => setErrorMessage('')}>
        {errorMessage}
      </Snackbar>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.roundness * 3,
          borderTopRightRadius: theme.roundness * 3,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.sheetTitle, { color: theme.colors.onSurface }]}>
            Paid by
          </Text>
          {participantNames.map(renderPaidByOption)}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

type ParticipantRowProps = {
  name: string;
  selected: boolean;
  onToggle: (name: string) => void;
};

const ParticipantRow = memo(function ParticipantRow({ name, selected, onToggle }: ParticipantRowProps) {
  const handleToggle = useCallback(() => {
    onToggle(name);
  }, [name, onToggle]);

  return (
    <View style={styles.participantRow}>
      <Pressable onPress={handleToggle} style={styles.participantLabelArea}>
        <Text variant="titleMedium">{name}</Text>
      </Pressable>
      <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={handleToggle} />
    </View>
  );
});

type PaidByOptionRowProps = {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
  isLast: boolean;
};

const PaidByOptionRow = memo(function PaidByOptionRow({ name, selected, onSelect, isLast }: PaidByOptionRowProps) {
  const handleSelect = useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <BottomSheetSingleSelectRow
      label={name}
      selected={selected}
      onPress={handleSelect}
      isLast={isLast}
    />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  formContentGrow: {
    flexGrow: 1,
  },
  amountInputContainer: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountCurrency: {
    marginRight: 8,
  },
  amountInlineInput: {
    flex: 1,
    height: 52,
  },
  amountInlineInputContent: {
    fontSize: 36,
    paddingHorizontal: 0,
  },
  hiddenUnderline: {
    display: 'none',
  },
  titleInputContainer: {
    minHeight: 56,
    paddingHorizontal: 0,
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleInlineInput: {
    height: 52,
  },
  titleInlineInputContent: {
    paddingHorizontal: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flex: 1,
    minHeight: 72,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  selectField: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  participantRow: {
    minHeight: 50,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantLabelArea: {
    flex: 1,
    paddingVertical: 12,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    marginBottom: 8,
  },
});
