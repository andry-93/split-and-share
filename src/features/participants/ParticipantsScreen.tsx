import React, { useEffect } from 'react';
import { View, SectionList } from 'react-native';
import {
    List,
    FAB,
    Text,
    useTheme,
    Appbar,
    Avatar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useParticipants } from './useParticipants';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';

import {
    ParticipantsStackParamList,
} from '@/app/navigation/types';

import {
    useAppDispatch,
    useAppSelector,
} from '@/store/hooks';

import {
    selectParticipantsSections,
} from '@/store/selectors/participants.ui.selectors';

import {
    selectSelectedParticipantIds,
    selectIsConfirmDeleteOpen,
    selectParticipantsSearch,
    selectParticipantsSearchVisible,
    selectParticipantsSort,
} from '@/store/selectors/ui.selectors';

import {
    setSelectedParticipantIds,
    clearSelectedParticipants,
    openConfirmDelete,
    closeConfirmDelete,
    setParticipantsSearch,
    showParticipantsSearch,
    hideParticipantsSearch,
    setParticipantsSort,
} from '@/store/slices/ui.slice';

type Nav =
    NativeStackNavigationProp<
        ParticipantsStackParamList
    >;

export const ParticipantsScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<Nav>();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { deleteParticipants } =
        useParticipants();

    const selectedIds = useAppSelector(
        selectSelectedParticipantIds
    );
    const isConfirmDeleteOpen = useAppSelector(
        selectIsConfirmDeleteOpen
    );

    const search = useAppSelector(
        selectParticipantsSearch
    );
    const searchVisible = useAppSelector(
        selectParticipantsSearchVisible
    );
    const sort = useAppSelector(
        selectParticipantsSort
    );

    const isSelectionMode = selectedIds.length > 0;

    const sections = useAppSelector(
        selectParticipantsSections
    );

    const toggleSelect = (id: string) => {
        dispatch(
            setSelectedParticipantIds(
                selectedIds.includes(id)
                    ? selectedIds.filter(x => x !== id)
                    : [...selectedIds, id]
            )
        );
    };

    const confirmDelete = async () => {
        await deleteParticipants(selectedIds);
        dispatch(clearSelectedParticipants());
        dispatch(closeConfirmDelete());
    };

    useEffect(() => {
        const visibleIds = new Set(
            sections.flatMap(s =>
                s.data.map(p => p.id)
            )
        );
        dispatch(
            setSelectedParticipantIds(
                selectedIds.filter(id =>
                    visibleIds.has(id)
                )
            )
        );
    }, [sections]);

    return (
        <View style={{ flex: 1 }}>
            <ScreenHeader
                title={t('participants')}
                searchVisible={searchVisible}
                searchValue={search}
                searchPlaceholder={t('search')}
                onSearchPress={() =>
                    dispatch(showParticipantsSearch())
                }
                onSearchChange={v =>
                    dispatch(setParticipantsSearch(v))
                }
                onSearchBlur={() => {
                    if (!search.trim()) {
                        dispatch(hideParticipantsSearch());
                    }
                }}
                selectionCount={selectedIds.length}
                onClearSelection={() =>
                    dispatch(clearSelectedParticipants())
                }
                actions={
                    <>
                        <Appbar.Action
                            icon="sort-alphabetical-ascending"
                            onPress={() =>
                                dispatch(
                                    setParticipantsSort(
                                        sort === 'name_asc'
                                            ? 'name_desc'
                                            : 'name_asc'
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

            {sections.length === 0 ? (
                <EmptyState
                    title={
                        search
                            ? t('no_search_results')
                            : t('no_participants')
                    }
                    description={
                        search
                            ? t('try_another_query')
                            : t('add_first_participant')
                    }
                />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    stickySectionHeadersEnabled
                    renderSectionHeader={({ section }) => (
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
                            selectedIds.includes(item.id);

                        return (
                            <List.Item
                                title={item.name}
                                onPress={() =>
                                    isSelectionMode
                                        ? toggleSelect(item.id)
                                        : navigation.navigate(
                                            'ParticipantEdit',
                                            { participantId: item.id }
                                        )
                                }
                                onLongPress={() =>
                                    toggleSelect(item.id)
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
                                                item.name[0] ?? '?'
                                            }
                                        />
                                    )
                                }
                                style={{
                                    paddingVertical: 2,
                                    paddingLeft: 16,
                                    backgroundColor: selected
                                        ? colors.secondaryContainer
                                        : 'transparent',
                                }}
                            />
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
                        navigation.navigate(
                            'ParticipantEdit',
                            {}
                        )
                    }
                />
            )}

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
