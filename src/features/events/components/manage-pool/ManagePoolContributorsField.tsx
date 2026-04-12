import React, { memo, useCallback } from 'react';
import { StyleSheet, View, TextInput as RNTextInput } from 'react-native';
import { Text, useTheme, IconButton, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ParticipantItem } from '@/features/events/types/events';
import { EventPayment } from '@/state/events/paymentsModel';
import { fromMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';
import { formatDecimalAmount } from '@/shared/utils/numberFormat';
import { getInitialsAvatarColors } from '@/shared/utils/avatarColors';
import { PremiumPressable } from '@/shared/ui/PremiumPressable';

type ContributorRowProps = {
  payment: EventPayment;
  participant?: ParticipantItem;
  currencyCode: string;
  onUpdateAmount: (id: string, amountMinor: number) => void;
  onRemove: (id: string) => void;
};

const ContributorRow = memo(({ payment, participant, currencyCode, onUpdateAmount, onRemove }: ContributorRowProps) => {
  const theme = useTheme();
  const name = participant?.name ?? 'Unknown';
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = getInitialsAvatarColors(theme.dark);

  const handleAmountChange = (text: string) => {
    const val = text.replace(',', '.');
    if (/^\d*\.?\d*$/.test(val)) {
      const amount = parseFloat(val) || 0;
      onUpdateAmount(payment.id, toMinorUnits(amount));
    }
  };

  const amountDisplay = fromMinorUnits(payment.amountMinor).toString();

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant }]}>
      <Avatar.Text 
        size={40} 
        label={initials} 
        style={{ backgroundColor: avatarColors.backgroundColor, marginRight: 12 }}
        color={avatarColors.labelColor}
      />
      <View style={styles.nameContainer}>
        <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '600' }}>{name}</Text>
      </View>
      <View style={[styles.amountInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <RNTextInput
          value={amountDisplay === '0' ? '' : amountDisplay}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.onSurfaceVariant + '60'}
          style={[styles.input, { color: theme.colors.onSurface }]}
          selectionColor={theme.colors.primary}
        />
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, fontWeight: '700' }}>
          {currencyCode}
        </Text>
      </View>
      <IconButton
        icon="close-circle-outline"
        iconColor={theme.colors.onSurfaceVariant}
        size={22}
        onPress={() => onRemove(payment.id)}
        style={styles.removeBtn}
      />
    </View>
  );
});

type ManagePoolContributorsFieldProps = {
  contributions: EventPayment[];
  participants: ParticipantItem[];
  currencyCode: string;
  onUpdateAmount: (id: string, amountMinor: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export const ManagePoolContributorsField = memo(function ManagePoolContributorsField({
  contributions,
  participants,
  currencyCode,
  onUpdateAmount,
  onRemove,
  onAdd,
}: ManagePoolContributorsFieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          {t('events.pools.contributors')}
        </Text>
      </View>

      <View style={styles.list}>
        {contributions.map((c) => (
          <ContributorRow
            key={c.id}
            payment={c}
            participant={participants.find((p) => p.id === c.fromId)}
            currencyCode={currencyCode}
            onUpdateAmount={onUpdateAmount}
            onRemove={onRemove}
          />
        ))}
        <PremiumPressable 
          onPress={onAdd} 
          style={[styles.addWrapper, { borderColor: theme.colors.primary + '40', backgroundColor: theme.colors.elevation.level1 }]}
        >
          <Text 
            variant="labelLarge" 
            style={{ color: theme.colors.primary, fontWeight: '700' }}
          >
            {t('events.pools.addContributor')}
          </Text>
        </PremiumPressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 90,
    height: 44,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    padding: 0,
    fontWeight: '700',
  },
  addWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  removeBtn: {
    margin: 0,
    marginLeft: 4,
  },
});
