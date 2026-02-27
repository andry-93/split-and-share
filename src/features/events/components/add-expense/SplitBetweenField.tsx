import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Checkbox, Divider, Text } from 'react-native-paper';
import { OutlinedFieldContainer } from '@/shared/ui/OutlinedFieldContainer';
import { addExpenseStyles as styles } from '@/features/events/components/add-expense/styles';

type SplitBetweenFieldProps = {
  participants: Array<{ id: string; name: string }>;
  selectedSet: ReadonlySet<string>;
  onToggle: (participantId: string) => void;
};

export const SplitBetweenField = memo(function SplitBetweenField({
  participants,
  selectedSet,
  onToggle,
}: SplitBetweenFieldProps) {
  return (
    <OutlinedFieldContainer style={styles.participantsCard}>
      {participants.map((participant, index) => (
        <View key={participant.id}>
          {index > 0 ? <Divider /> : null}
          <ParticipantRow
            participant={participant}
            selected={selectedSet.has(participant.id)}
            onToggle={onToggle}
          />
        </View>
      ))}
    </OutlinedFieldContainer>
  );
});

type ParticipantRowProps = {
  participant: { id: string; name: string };
  selected: boolean;
  onToggle: (participantId: string) => void;
};

const ParticipantRow = memo(function ParticipantRow({
  participant,
  selected,
  onToggle,
}: ParticipantRowProps) {
  const handleToggle = useCallback(() => {
    onToggle(participant.id);
  }, [onToggle, participant.id]);

  return (
    <View style={styles.participantRow}>
      <Pressable onPress={handleToggle} style={styles.participantLabelArea}>
        <Text variant="titleMedium">{participant.name}</Text>
      </Pressable>
      <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={handleToggle} />
    </View>
  );
});
