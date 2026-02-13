import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Checkbox, Divider, Text } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';

type SplitBetweenFieldProps = {
  participants: string[];
  selectedSet: ReadonlySet<string>;
  onToggle: (name: string) => void;
};

export const SplitBetweenField = memo(function SplitBetweenField({
  participants,
  selectedSet,
  onToggle,
}: SplitBetweenFieldProps) {
  return (
    <OutlinedFieldContainer style={styles.participantsCard}>
      {participants.map((name, index) => (
        <View key={name}>
          {index > 0 ? <Divider /> : null}
          <ParticipantRow name={name} selected={selectedSet.has(name)} onToggle={onToggle} />
        </View>
      ))}
    </OutlinedFieldContainer>
  );
});

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
