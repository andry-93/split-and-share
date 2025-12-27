import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { View, SectionList } from 'react-native';
import {
    List,
    FAB,
    Text,
    useTheme,
    Appbar,
    Avatar,
} from 'react-native-paper';
import {
    useNavigation,
} from '@react-navigation/native';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useParticipants } from './useParticipants';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ParticipantsStackParamList } from '@/app/navigation/types';

type Nav =
    NativeStackNavigationProp<ParticipantsStackParamList>;

type SectionItem = {
    title: string;
    data: {
        id: string;
        name: string;
        avatarUri?: string;
    }[];
};

export const ParticipantsScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<Nav>();
    const { t } = useTranslation();

    const { participants, deleteParticipants } =
        useParticipants();

    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);
    const [confirmVisible, setConfirmVisible] =
        useState(false);

    const debouncedSearch =
        useDebouncedValue(search, 250);

    const isSelectionMode =
        selectedIds.length > 0;

    /* =======================
       FILTER
       ======================= */

    const filteredParticipants = useMemo(() => {
        const q =
            debouncedSearch.trim().toLowerCase();
        if (!q) return participants;

        return participants.filter(p =>
            p.name.toLowerCase().includes(q)
        );
    }, [participants, debouncedSearch]);

    /* =======================
       GROUP A–Z
       ======================= */

    const sections: SectionItem[] =
        useMemo(() => {
            const map: Record<
                string,
                SectionItem['data']
            > = {};

            filteredParticipants.forEach(p => {
                const first =
                    p.name.trim()[0]?.toUpperCase();
                const letter =
                    first &&
                    first.match(/[A-ZА-Я]/)
                        ? first
                        : '#';

                if (!map[letter]) map[letter] = [];
                map[letter].push(p);
            });

            return Object.keys(map)
                .sort()
                .map(letter => ({
                    title: letter,
                    data: map[letter].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    ),
                }));
        }, [filteredParticipants]);

    /* =======================
       SYNC SELECTION
       ======================= */

    useEffect(() => {
        const visibleIds = new Set(
            filteredParticipants.map(p => p.id)
        );

        setSelectedIds(prev =>
            prev.filter(id =>
                visibleIds.has(id)
            )
        );
    }, [filteredParticipants]);

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
            navigation.navigate(
                'ParticipantEdit',
                { participantId: id }
            );
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
        await deleteParticipants(selectedIds);
        setSelectedIds([]);
        setConfirmVisible(false);
    };

    const hasSearch = search.trim().length > 0;

    /* =======================
       RENDER
       ======================= */

    return (
        <View style={{ flex: 1 }}>
            {/* ===== HEADER ===== */}
            <ScreenHeader
                title={t('participants')}
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

            {/* ===== CONTENT ===== */}
            {sections.length === 0 ? (
                <EmptyState
                    title={
                        hasSearch
                            ? t(
                                'no_search_results'
                            )
                            : t(
                                'no_participants'
                            )
                    }
                    description={
                        hasSearch
                            ? t(
                                'try_another_query'
                            )
                            : t(
                                'add_first_participant'
                            )
                    }
                />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    stickySectionHeadersEnabled
                    renderSectionHeader={({
                                              section,
                                          }) => (
                        <Text
                            variant="labelSmall"
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 6,
                                color:
                                colors.onSurfaceVariant,
                                backgroundColor:
                                colors.background,
                            }}
                        >
                            {section.title}
                        </Text>
                    )}
                    renderItem={({ item }) => {
                        const selected =
                            selectedIds.includes(
                                item.id
                            );

                        return (
                            <List.Item
                                title={item.name}
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
                                left={() =>
                                    item.avatarUri ? (
                                        <Avatar.Image
                                            size={36}
                                            source={{
                                                uri: item.avatarUri,
                                            }}
                                        />
                                    ) : (
                                        <Avatar.Text
                                            size={36}
                                            label={
                                                item.name
                                                    .trim()[0] ??
                                                '?'
                                            }
                                        />
                                    )
                                }
                                style={{
                                    paddingVertical: 2,
                                    paddingLeft: 16,
                                    backgroundColor:
                                        selected
                                            ? colors.secondaryContainer
                                            : 'transparent',
                                }}
                            />
                        );
                    }}
                />
            )}

            {/* ===== FAB ===== */}
            {!isSelectionMode && (
                <FAB
                    icon="plus"
                    style={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                    }}
                    onPress={() =>
                        navigation.navigate(
                            'ParticipantEdit', {}
                        )
                    }
                />
            )}

            {/* ===== CONFIRM DELETE ===== */}
            <ConfirmDialog
                visible={confirmVisible}
                title={t('delete')}
                message={t(
                    'delete_selected',
                    { count: selectedIds.length }
                )}
                onCancel={() =>
                    setConfirmVisible(false)
                }
                onConfirm={confirmDelete}
            />
        </View>
    );
};
