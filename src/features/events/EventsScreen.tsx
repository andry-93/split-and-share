import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import {
    Card,
    FAB,
    Appbar,
    useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useEvents } from './useEvents';
import { EventDialog } from './components/EventDialog';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import {
    EventsStackParamList,
} from '@/app/navigation/types';

import {
    useAppDispatch,
    useAppSelector,
} from '@/store/hooks';

import {
    selectSelectedEventIds,
    selectIsEventDialogOpen,
    selectIsConfirmDeleteOpen,
} from '@/store/selectors/ui.selectors';

import {
    setSelectedEventIds,
    clearSelectedEvents,
    openEventDialog,
    closeEventDialog,
    openConfirmDelete,
    closeConfirmDelete,
} from '@/store/slices/ui.slice';

type Nav =
    NativeStackNavigationProp<EventsStackParamList>;

export const EventsScreen = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<Nav>();
    const dispatch = useAppDispatch();

    const {
        events,
        createEvent,
        deleteEvents,
        openEvent,
    } = useEvents();

    /* =======================
       UI STATE (REDUX)
       ======================= */

    const selectedIds = useAppSelector(
        selectSelectedEventIds
    );
    const isEventDialogOpen = useAppSelector(
        selectIsEventDialogOpen
    );
    const isConfirmDeleteOpen = useAppSelector(
        selectIsConfirmDeleteOpen
    );

    const isSelectionMode = selectedIds.length > 0;

    /* =======================
       SEARCH
       ======================= */

    const [search, setSearch] = useState('');
    const debouncedSearch =
        useDebouncedValue(search, 250);

    const filteredEvents = useMemo(() => {
        const q =
            debouncedSearch.trim().toLowerCase();
        if (!q) return events;

        return events.filter(e =>
            e.title.toLowerCase().includes(q)
        );
    }, [events, debouncedSearch]);

    const hasSearch =
        debouncedSearch.trim().length > 0;

    /* =======================
       SELECTION
       ======================= */

    const toggleSelect = (id: string) => {
        dispatch(
            setSelectedEventIds(
                selectedIds.includes(id)
                    ? selectedIds.filter(x => x !== id)
                    : [...selectedIds, id]
            )
        );
    };

    const handlePress = (id: string) => {
        if (isSelectionMode) {
            toggleSelect(id);
        } else {
            openEvent(id);
            navigation.navigate('EventDetails', {
                eventId: id,
            });
        }
    };

    const handleLongPress = (id: string) => {
        toggleSelect(id);
    };

    /* =======================
       DELETE
       ======================= */

    const handleDeleteSelected = () => {
        dispatch(openConfirmDelete());
    };

    const confirmDelete = async () => {
        await deleteEvents(selectedIds);
        dispatch(clearSelectedEvents());
        dispatch(closeConfirmDelete());
    };

    /* =======================
       SYNC SELECTION
       ======================= */

    useEffect(() => {
        const visibleIds = new Set(
            filteredEvents.map(e => e.id)
        );

        dispatch(
            setSelectedEventIds(
                selectedIds.filter(id =>
                    visibleIds.has(id)
                )
            )
        );
    }, [filteredEvents]);

    /* =======================
       RENDER
       ======================= */

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader
                title={t('events')}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={t('search')}
                selectionCount={selectedIds.length}
                onClearSelection={() =>
                    dispatch(clearSelectedEvents())
                }
                actions={
                    isSelectionMode ? (
                        <Appbar.Action
                            icon="delete"
                            onPress={handleDeleteSelected}
                        />
                    ) : null
                }
            />

            {filteredEvents.length === 0 ? (
                <EmptyState
                    title={
                        hasSearch
                            ? t('no_search_results')
                            : t('no_events')
                    }
                    description={
                        hasSearch
                            ? t('try_another_query')
                            : t('create_first_event')
                    }
                />
            ) : (
                <FlatList
                    contentContainerStyle={{
                        padding: 16,
                    }}
                    data={filteredEvents}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const selected =
                            selectedIds.includes(item.id);

                        return (
                            <Card
                                onPress={() =>
                                    handlePress(item.id)
                                }
                                onLongPress={() =>
                                    handleLongPress(item.id)
                                }
                                style={{
                                    marginBottom: 12,
                                    borderWidth: selected ? 2 : 1,
                                    borderColor: selected
                                        ? colors.primary
                                        : colors.outlineVariant,
                                }}
                            >
                                <Card.Title
                                    title={item.title}
                                />
                            </Card>
                        );
                    }}
                />
            )}

            {!isSelectionMode && (
                <FAB
                    icon="plus"
                    style={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                    }}
                    onPress={() =>
                        dispatch(openEventDialog())
                    }
                />
            )}

            {/* EVENT DIALOG */}
            <EventDialog
                visible={isEventDialogOpen}
                onDismiss={() =>
                    dispatch(closeEventDialog())
                }
                onSave={title => {
                    createEvent(title);
                    dispatch(closeEventDialog());
                }}
            />

            {/* CONFIRM DELETE */}
            <ConfirmDialog
                visible={isConfirmDeleteOpen}
                title={t('delete')}
                message={t('delete_selected', {
                    count: selectedIds.length,
                })}
                onCancel={() =>
                    dispatch(closeConfirmDelete())
                }
                onConfirm={confirmDelete}
            />
        </View>
    );
};
