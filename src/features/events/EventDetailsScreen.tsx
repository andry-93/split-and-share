import React, { useEffect, useRef, useState } from 'react';
import {
    ScrollView,
    View,
    Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
    Text,
    FAB,
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

import { EventsStackParamList } from '@/app/navigation/types';

import { useEvent } from './useEvent';
import { useEvents } from './useEvents';
import { useParticipants } from '../participants/useParticipants';
import { useExpenses } from '../expenses/useExpenses';

import { ExpenseDialog } from '../expenses/components/ExpenseDialog';
import { ExpensesList } from '../expenses/ExpensesList';
import { ParticipantsPreview } from '../participants/ParticipantsPreview';
import { EventParticipantsDialog } from '../participants/EventParticipantsDialog';
import { DebtList } from '../debts/DebtList';
import { EventTotalsCard } from '../debts/EventTotalsCard';

import { Section } from '@/shared/ui/Section';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { useSettings } from '../settings/SettingsContext';

import {
    useAppDispatch,
    useAppSelector,
} from '@/store/hooks';

import {
    selectIsExpenseDialogOpen,
    selectEditingExpenseId,
    selectIsParticipantsDialogOpen,
} from '@/store/selectors/ui.selectors';

import {
    openExpenseDialog,
    closeExpenseDialog,
    setEditingExpenseId,
    openParticipantsDialog,
    closeParticipantsDialog,
} from '@/store/slices/ui.slice';

import {
    makeSelectDebtsByEvent,
} from '@/store/selectors/debts.selectors';

import {
    makeSelectTotalsByEvent,
} from '@/store/selectors/totals.selectors';

/* =======================
   TYPES
   ======================= */

type Props = {
    route: RouteProp<
        EventsStackParamList,
        'EventDetails'
    >;
};

type Nav =
    NativeStackNavigationProp<
        EventsStackParamList
    >;

/* =======================
   SCREEN
   ======================= */

export const EventDetailsScreen = ({
                                       route,
                                   }: Props) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<Nav>();
    const dispatch = useAppDispatch();

    const { eventId } = route.params;

    /* =======================
       DATA
       ======================= */

    const { event } = useEvent(eventId);
    const { updateEvent } = useEvents();
    const { participants } = useParticipants();
    const { defaultCurrency } = useSettings();

    const {
        expenses,
        createExpense,
        updateExpense,
        deleteExpense,
    } = useExpenses(eventId);

    /* =======================
       UI STATE
       ======================= */

    const isExpenseDialogOpen = useAppSelector(
        selectIsExpenseDialogOpen
    );
    const editingExpenseId = useAppSelector(
        selectEditingExpenseId
    );
    const isParticipantsDialogOpen =
        useAppSelector(
            selectIsParticipantsDialogOpen
        );

    /* =======================
       GUARD
       ======================= */

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
                    <Text>{t('event_not_found')}</Text>
                </View>
            </View>
        );
    }

    /* =======================
       DERIVED
       ======================= */

    const participantIds =
        event.participantIds ?? [];

    const eventParticipants = participants.filter(
        p => participantIds.includes(p.id)
    );

    const currency =
        event.currency ?? defaultCurrency;

    const editingExpense = expenses.find(
        e => e.id === editingExpenseId
    );

    const debts = useAppSelector(
        makeSelectDebtsByEvent(
            event.id,
            participantIds
        )
    );

    const totals = useAppSelector(
        makeSelectTotalsByEvent(
            event.id,
            participantIds
        )
    );

    /* =======================
       ANIMATION
       ======================= */

    const fadeAnim = useRef(
        new Animated.Value(1)
    ).current;

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
    }, [debts.length]);

    /* =======================
       LOCAL FORM STATE
       ======================= */

    const [currencyInput, setCurrencyInput] =
        useState('');

    useEffect(() => {
        setCurrencyInput(event.currency ?? '');
    }, [event.currency]);

    /* =======================
       HANDLERS
       ======================= */

    const openAddExpense = () => {
        dispatch(setEditingExpenseId(null));
        dispatch(openExpenseDialog());
    };

    const openEditExpense = (id: string) => {
        dispatch(setEditingExpenseId(id));
        dispatch(openExpenseDialog());
    };

    const saveCurrency = () => {
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
                        onChangeText={setCurrencyInput}
                        onBlur={saveCurrency}
                        autoCapitalize="characters"
                        maxLength={5}
                        dense
                    />
                    <HelperText type="info">
                        {t(
                            'leave_empty_for_default',
                            {
                                currency: defaultCurrency,
                            }
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
                            dispatch(
                                openParticipantsDialog()
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
                        participants={eventParticipants}
                        currency={currency}
                        onEdit={openEditExpense}
                        onDelete={deleteExpense}
                    />
                </Section>

                {/* DEBTS */}
                <Animated.View
                    style={{ opacity: fadeAnim }}
                >
                    <DebtList
                        debts={debts}
                        participants={eventParticipants}
                        eventTitle={event.title}
                        currency={currency}
                    />
                </Animated.View>

                {/* TOTALS */}
                <EventTotalsCard
                    totals={totals}
                    participants={eventParticipants}
                    currency={currency}
                />
            </ScrollView>

            {/* FAB */}
            {!isExpenseDialogOpen && (
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
                visible={isExpenseDialogOpen}
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
                    dispatch(closeExpenseDialog());
                    dispatch(setEditingExpenseId(null));
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

                    dispatch(closeExpenseDialog());
                    dispatch(setEditingExpenseId(null));
                }}
            />

            {/* PARTICIPANTS DIALOG */}
            <EventParticipantsDialog
                visible={isParticipantsDialogOpen}
                participants={participants}
                selectedIds={participantIds}
                onDismiss={() =>
                    dispatch(
                        closeParticipantsDialog()
                    )
                }
                onSave={ids => {
                    updateEvent(event.id, {
                        participantIds: ids,
                    });
                    dispatch(
                        closeParticipantsDialog()
                    );
                }}
            />
        </>
    );
};
