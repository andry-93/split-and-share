import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { View, FlatList } from 'react-native';
import {
    Card,
    FAB,
    useTheme,
    Appbar,
} from 'react-native-paper';
import {
    useNavigation,
} from '@react-navigation/native';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useEvents } from './useEvents';
import { EventDialog } from './components/EventDialog';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
    EventsStackParamList,
} from '@/app/navigation/types';

type Nav =
    NativeStackNavigationProp<EventsStackParamList>;

export const EventsScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<Nav>();
    const { t } = useTranslation();

    const {
        events,
        createEvent,
        deleteEvents,
        openEvent,
    } = useEvents();

    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [dialogVisible, setDialogVisible] =
        useState(false);
    const [confirmVisible, setConfirmVisible] =
        useState(false);

    const debouncedSearch =
        useDebouncedValue(search, 250);

    const isSelectionMode =
        selectedIds.length > 0;

    /* =======================
       FILTER
       ======================= */

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
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
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
        setConfirmVisible(true);
    };

    const confirmDelete = async () => {
        await deleteEvents(selectedIds);
        setSelectedIds([]);
        setConfirmVisible(false);
    };

    /* =======================
       SYNC SELECTION
       ======================= */

    useEffect(() => {
        const visibleIds = new Set(
            filteredEvents.map(e => e.id)
        );

        setSelectedIds(prev =>
            prev.filter(id =>
                visibleIds.has(id)
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
                    setSelectedIds([])
                }
                actions={
                    isSelectionMode ? (
                        <Appbar.Action
                            icon="delete"
                            onPress={
                                handleDeleteSelected
                            }
                        />
                    ) : null
                }
            />

            {filteredEvents.length === 0 ? (
                <EmptyState
                    title={
                        hasSearch
                            ? t(
                                'no_search_results'
                            )
                            : t('no_events')
                    }
                    description={
                        hasSearch
                            ? t(
                                'try_another_query'
                            )
                            : t(
                                'create_first_event'
                            )
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
                            selectedIds.includes(
                                item.id
                            );

                        return (
                            <Card
                                onPress={() =>
                                    handlePress(
                                        item.id
                                    )
                                }
                                onLongPress={() =>
                                    handleLongPress(
                                        item.id
                                    )
                                }
                                style={{
                                    marginBottom: 12,
                                    borderWidth: selected
                                        ? 2
                                        : 1,
                                    borderColor: selected
                                        ? colors.primary
                                        : colors.outlineVariant,
                                }}
                            >
                                <Card.Title
                                    title={
                                        item.title
                                    }
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
                        setDialogVisible(true)
                    }
                />
            )}

            <EventDialog
                visible={dialogVisible}
                onDismiss={() =>
                    setDialogVisible(false)
                }
                onSave={title => {
                    createEvent(title);
                    setDialogVisible(false);
                }}
            />

            <ConfirmDialog
                visible={confirmVisible}
                title={t('delete')}
                message={t(
                    'delete_selected',
                    {
                        count: selectedIds.length,
                    }
                )}
                onCancel={() =>
                    setConfirmVisible(false)
                }
                onConfirm={confirmDelete}
            />
        </View>
    );
};
