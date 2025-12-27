import { Avatar, IconButton, List } from 'react-native-paper';
import { Participant } from '@/entities/types';

interface Props {
  participant: Participant;
  onEdit(): void;
  onDelete(): void;
}

export const ParticipantItem = ({
  participant,
  onEdit,
  onDelete,
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
        <>
          <IconButton icon="pencil" onPress={onEdit} />
          <IconButton icon="delete" onPress={onDelete} />
        </>
      )}
    />
  );
};
