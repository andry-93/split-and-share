import React, { useEffect } from 'react';
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

import {
    EventsStackParamList,
} from '@/app/navigation/types';

import {
    useAppDispatch,
    useAppSelector,
} from '@/store/hooks';

import {
    selectFilteredSortedEvents,
} from '@/store/selectors/events.ui.selectors';

import {
    selectSelectedEventIds,
    selectIsEventDialogOpen,
    selectIsConfirmDeleteOpen,
    selectEventsSearch,
    selectEventsSearchVisible,
    selectEventsSort,
    selectEventsFilterHasExpenses,
} from '@/store/selectors/ui.selectors';

import {
    setSelectedEventIds,
    clearSelectedEvents,
    openEventDialog,
    closeEventDialog,
    openConfirmDelete,
    closeConfirmDelete,
    setEventsSearch,
    showEventsSearch,
    hideEventsSearch,
    setEventsSort,
    toggleEventsFilterHasExpenses,
} from '@/store/slices/ui.slice';

type Nav =
    NativeStackNavigationProp<EventsStackParamList>;

export const EventsScreen = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<Nav>();
    const dispatch = useAppDispatch();

    const {
        createEvent,
        deleteEvents,
        openEvent,
    } = useEvents();

    /* ===== UI STATE ===== */

    const selectedIds = useAppSelector(
        selectSelectedEventIds
    );
    const isEventDialogOpen = useAppSelector(
        selectIsEventDialogOpen
    );
    const isConfirmDeleteOpen = useAppSelector(
        selectIsConfirmDeleteOpen
    );

    const search = useAppSelector(selectEventsSearch);
    const searchVisible = useAppSelector(
        selectEventsSearchVisible
    );
    const sort = useAppSelector(selectEventsSort);
    const filterHasExpenses = useAppSelector(
        selectEventsFilterHasExpenses
    );

    const isSelectionMode = selectedIds.length > 0;

    /* ===== DATA ===== */

    const events = useAppSelector(
        selectFilteredSortedEvents
    );

    /* ===== SELECTION ===== */

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

    /* ===== DELETE ===== */

    const confirmDelete = async () => {
        await deleteEvents(selectedIds);
        dispatch(clearSelectedEvents());
        dispatch(closeConfirmDelete());
    };

    /* ===== SYNC SELECTION ===== */

    useEffect(() => {
        const visibleIds = new Set(events.map(e => e.id));
        dispatch(
            setSelectedEventIds(
                selectedIds.filter(id =>
                    visibleIds.has(id)
                )
            )
        );
    }, [events]);

    /* ===== RENDER ===== */

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader
                title={t('events')}
                searchVisible={searchVisible}
                searchValue={search}
                searchPlaceholder={t('search')}
                onSearchPress={() =>
                    dispatch(showEventsSearch())
                }
                onSearchChange={v =>
                    dispatch(setEventsSearch(v))
                }
                onSearchBlur={() => {
                    if (!search.trim()) {
                        dispatch(hideEventsSearch());
                    }
                }}
                selectionCount={selectedIds.length}
                onClearSelection={() =>
                    dispatch(clearSelectedEvents())
                }
                actions={
                    <>
                        <Appbar.Action
                            icon={
                                filterHasExpenses
                                    ? 'filter'
                                    : 'filter-outline'
                            }
                            onPress={() =>
                                dispatch(
                                    toggleEventsFilterHasExpenses()
                                )
                            }
                        />
                        <Appbar.Action
                            icon="sort"
                            onPress={() =>
                                dispatch(
                                    setEventsSort(
                                        sort === 'title_asc'
                                            ? 'title_desc'
                                            : 'title_asc'
                                    )
                                )
                            }
                        />
                        {isSelectionMode && (
                            <Appbar.Action
                                icon="delete"
                                onPress={() =>
                                    dispatch(openConfirmDelete())
                                }
                            />
                        )}
                    </>
                }
            />

            {events.length === 0 ? (
                <EmptyState
                    title={
                        search
                            ? t('no_search_results')
                            : t('no_events')
                    }
                    description={
                        search
                            ? t('try_another_query')
                            : t('create_first_event')
                    }
                />
            ) : (
                <FlatList
                    contentContainerStyle={{
                        padding: 16,
                    }}
                    data={events}
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
                                <Card.Title title={item.title} />
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
