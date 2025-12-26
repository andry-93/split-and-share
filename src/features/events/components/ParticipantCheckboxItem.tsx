import { Avatar, Checkbox, List } from 'react-native-paper';
import { Participant } from '../../../entities/types';

interface Props {
  participant: Participant;
  checked: boolean;
  onToggle(): void;
}

export const ParticipantCheckboxItem = ({
  participant,
  checked,
  onToggle,
}: Props) => {
  return (
    <List.Item
      title={participant.name}
      left={() =>
        participant.avatarUri ? (
          <Avatar.Image size={40} source={{ uri: participant.avatarUri }} />
        ) : (
          <Avatar.Text size={40} label={participant.name[0]} />
        )
      }
      right={() => (
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={onToggle}
        />
      )}
      onPress={onToggle}
    />
  );
};
