import React, { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ParticipantItem } from '../../types/events';
import { AppList } from '../../../../shared/ui/AppList';
import { PersonListRow } from '../../../people/components/PersonListRow';
import { formatCurrencyAmount } from '../../../../shared/utils/currency';
import { eventDetailsStyles as styles } from './styles';
import { isCurrentUserPerson, sortPeopleWithCurrentUserFirst } from '../../../../shared/utils/people';

type PeoplePanelProps = {
  participants: ParticipantItem[];
  participantBalanceMap: Map<string, number>;
  currencyCode: string;
};

export const PeoplePanel = memo(function PeoplePanel({
  participants,
  participantBalanceMap,
  currencyCode,
}: PeoplePanelProps) {
  const sortedParticipants = useMemo(
    () => sortPeopleWithCurrentUserFirst(participants),
    [participants],
  );

  const renderParticipantItem = useCallback(
    ({ item }: { item: ParticipantItem }) => (
      <ParticipantBalanceRow
        participant={item}
        balance={participantBalanceMap.get(item.id) ?? 0}
        currencyCode={currencyCode}
      />
    ),
    [currencyCode, participantBalanceMap],
  );

  if (sortedParticipants.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text variant="titleMedium">No people in this event</Text>
        <Text variant="bodyMedium">Add people to start splitting expenses.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.rawListWrapper, styles.peopleSectionSpacing]}>
      <AppList
        data={sortedParticipants}
        keyExtractor={(item) => item.id}
        containerStyle={styles.rawListContainer}
        listStyle={styles.rawList}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item }) => renderParticipantItem({ item })}
      />
    </View>
  );
});

type ParticipantBalanceRowProps = {
  participant: ParticipantItem;
  balance: number;
  currencyCode: string;
};

const ParticipantBalanceRow = memo(function ParticipantBalanceRow({
  participant,
  balance,
  currencyCode,
}: ParticipantBalanceRowProps) {
  const theme = useTheme();
  const absoluteBalance = Math.abs(balance);
  const formattedBalance =
    balance > 0
      ? `+${formatCurrencyAmount(currencyCode, absoluteBalance)}`
      : balance < 0
        ? `-${formatCurrencyAmount(currencyCode, absoluteBalance)}`
        : formatCurrencyAmount(currencyCode, 0);

  const balanceStyle = balance > 0
    ? {
        backgroundColor: 'rgba(22, 163, 74, 0.16)',
        borderColor: '#4ADE80',
        color: '#16A34A',
      }
    : balance < 0
      ? {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.error,
          color: theme.colors.onErrorContainer,
        }
      : {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          color: theme.colors.onSurfaceVariant,
        };

  const balanceChip = (
    <View style={[styles.balancePill, { backgroundColor: balanceStyle.backgroundColor, borderColor: balanceStyle.borderColor }]}>
      <Text variant="labelMedium" style={{ color: balanceStyle.color }}>
        {formattedBalance}
      </Text>
    </View>
  );

  return (
    <PersonListRow
      name={participant.name}
      phone={participant.phone}
      email={participant.email}
      rightSlot={balanceChip}
      isCurrentUser={isCurrentUserPerson(participant)}
    />
  );
});
