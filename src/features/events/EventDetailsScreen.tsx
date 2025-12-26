import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ScrollView,
    View,
    Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
    Text,
    FAB,
    ActivityIndicator,
    TextInput,
    Button,
    HelperText,
    useTheme,
} from 'react-native-paper';
import {
    RouteProp,
    useNavigation,
} from '@react-navigation/native';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { EventsStackParamList } from '../../app/navigation/types';
import { useEvents } from './useEvents';
import { useParticipants } from '../participants/useParticipants';
import { useExpenses } from '../expenses/useExpenses';
import { calculateDebts } from '../../entities/debt/calculateDebts';

import { ExpenseDialog } from '../expenses/components/ExpenseDialog';
import { ExpensesList } from '../expenses/ExpensesList';
import { ParticipantsPreview } from '../participants/ParticipantsPreview';
import { EventParticipantsDialog } from '../participants/EventParticipantsDialog';
import { DebtList } from '../debts/DebtList';
import { Section } from '../../shared/ui/Section';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { useSettings } from '../settings/SettingsContext';

type Props = {
    route: RouteProp<EventsStackParamList, 'EventDetails'>;
};

type Nav =
    NativeStackNavigationProp<EventsStackParamList>;

export const EventDetailsScreen = ({ route }: Props) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<Nav>();

    const { eventId } = route.params;

    /* =======================
       DATA
       ======================= */

    const { getEventById, loading, updateEvent } =
        useEvents();
    const { participants } = useParticipants();
    const { defaultCurrency } = useSettings();

    const event = getEventById(eventId);

    const {
        expenses,
        createExpense,
        updateExpense,
        deleteExpense,
    } = useExpenses(eventId);

    /* =======================
       DERIVED
       ======================= */

    const participantIds =
        event?.participantIds ?? [];

    const eventParticipants = useMemo(
        () =>
            participants.filter(p =>
                participantIds.includes(p.id)
            ),
        [participants, participantIds]
    );

    const currency =
        event?.currency ?? defaultCurrency;

    /* =======================
       DEBTS + ANIMATION
       ======================= */

    const fadeAnim = useRef(
        new Animated.Value(1)
    ).current;

    const debts = useMemo(
        () =>
            calculateDebts(
                expenses,
                participantIds
            ),
        [expenses, participantIds.join(',')]
    );

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [debts.length]); // 🔥 анимация только при реальном изменении

    /* =======================
       LOCAL STATE
       ======================= */

    const [
        expenseDialogVisible,
        setExpenseDialogVisible,
    ] = useState(false);

    const [
        editingExpenseId,
        setEditingExpenseId,
    ] = useState<string | null>(null);

    const [
        participantsDialogVisible,
        setParticipantsDialogVisible,
    ] = useState(false);

    const [
        currencyInput,
        setCurrencyInput,
    ] = useState('');

    const editingExpense = useMemo(
        () =>
            expenses.find(
                e => e.id === editingExpenseId
            ),
        [expenses, editingExpenseId]
    );

    /* =======================
       EFFECTS
       ======================= */

    useEffect(() => {
        setCurrencyInput(event?.currency ?? '');
    }, [event?.currency]);

    /* =======================
       HANDLERS
       ======================= */

    const openAddExpense = () => {
        setEditingExpenseId(null);
        setExpenseDialogVisible(true);
    };

    const openEditExpense = (id: string) => {
        setEditingExpenseId(id);
        setExpenseDialogVisible(true);
    };

    const saveCurrency = () => {
        if (!event) return;

        const next =
            currencyInput.trim().toUpperCase();

        if (!next) {
            if (event.currency) {
                updateEvent(event.id, {
                    currency: undefined,
                });
            }
            return;
        }

        if (next !== event.currency) {
            updateEvent(event.id, {
                currency: next,
            });
        }
    };

    /* =======================
       GUARDS
       ======================= */

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={{ flex: 1 }}>
                <ScreenHeader
                    title=""
                    showBack
                    onBack={() =>
                        navigation.goBack()
                    }
                />
                <View style={{ padding: 16 }}>
                    <Text>
                        {t('event_not_found')}
                    </Text>
                </View>
            </View>
        );
    }

    /* =======================
       RENDER
       ======================= */

    return (
        <>
            <ScreenHeader
                title={event.title}
                showBack
                onBack={() =>
                    navigation.goBack()
                }
            />

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 120,
                }}
            >
                {/* META */}
                <Text
                    variant="bodySmall"
                    style={{
                        color:
                        colors.onSurfaceVariant,
                        marginBottom: 16,
                    }}
                >
                    {eventParticipants.length}{' '}
                    {t('participants').toLowerCase()}
                    {' · '}
                    {expenses.length}{' '}
                    {t('expenses').toLowerCase()}
                </Text>

                {/* CURRENCY */}
                <Section title={t('currency')}>
                    <TextInput
                        label={t('currency')}
                        value={currencyInput}
                        onChangeText={
                            setCurrencyInput
                        }
                        onBlur={saveCurrency}
                        autoCapitalize="characters"
                        maxLength={5}
                        dense
                    />
                    <HelperText type="info">
                        {t(
                            'leave_empty_for_default',
                            { currency: defaultCurrency }
                        )}
                    </HelperText>
                </Section>

                {/* PARTICIPANTS */}
                <Section title={t('participants')}>
                    <ParticipantsPreview
                        participants={
                            eventParticipants
                        }
                    />
                    <Button
                        mode="text"
                        onPress={() =>
                            setParticipantsDialogVisible(
                                true
                            )
                        }
                        style={{ marginTop: 8 }}
                    >
                        {t('edit_participants')}
                    </Button>
                </Section>

                {/* EXPENSES */}
                <Section title={t('expenses')}>
                    <ExpensesList
                        expenses={expenses}
                        participants={
                            eventParticipants
                        }
                        currency={currency}
                        onEdit={openEditExpense}
                        onDelete={deleteExpense}
                    />
                </Section>

                {/* DEBTS (ANIMATED) */}
                <Animated.View
                    style={{ opacity: fadeAnim }}
                >
                    <DebtList
                        debts={debts}
                        participants={
                            eventParticipants
                        }
                        eventTitle={event.title}
                        currency={currency}
                    />
                </Animated.View>
            </ScrollView>

            {/* FAB */}
            {!expenseDialogVisible && (
                <FAB
                    icon="plus"
                    style={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                    }}
                    onPress={openAddExpense}
                />
            )}

            {/* EXPENSE DIALOG */}
            <ExpenseDialog
                visible={expenseDialogVisible}
                participants={eventParticipants}
                currency={currency}
                initialDescription={
                    editingExpense?.description
                }
                initialAmount={
                    editingExpense?.amount
                }
                initialPaidBy={
                    editingExpense?.paidBy
                }
                onDismiss={() => {
                    setExpenseDialogVisible(
                        false
                    );
                    setEditingExpenseId(null);
                }}
                onSave={data => {
                    if (editingExpense) {
                        updateExpense(
                            editingExpense.id,
                            data.description,
                            data.amount,
                            data.paidBy
                        );
                    } else {
                        createExpense(
                            data.description,
                            data.amount,
                            data.paidBy
                        );
                    }

                    setExpenseDialogVisible(
                        false
                    );
                    setEditingExpenseId(null);
                }}
            />

            {/* PARTICIPANTS DIALOG */}
            <EventParticipantsDialog
                visible={
                    participantsDialogVisible
                }
                participants={participants}
                selectedIds={
                    event.participantIds
                }
                onDismiss={() =>
                    setParticipantsDialogVisible(
                        false
                    )
                }
                onSave={ids => {
                    updateEvent(event.id, {
                        participantIds: ids,
                    });
                    setParticipantsDialogVisible(
                        false
                    );
                }}
            />
        </>
    );
};
