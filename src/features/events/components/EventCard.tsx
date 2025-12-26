import { Card, IconButton, Text } from 'react-native-paper';
import { Event } from '../../../entities/types';

interface Props {
  event: Event;
  onPress(): void;
  onEdit(): void;
  onDelete(): void;
}

export const EventCard = ({ event, onPress, onEdit, onDelete }: Props) => {
  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <Card.Title
        title={event.title}
        right={() => (
          <>
            <IconButton icon="pencil" onPress={onEdit} />
            <IconButton icon="delete" onPress={onDelete} />
          </>
        )}
      />
    </Card>
  );
};
