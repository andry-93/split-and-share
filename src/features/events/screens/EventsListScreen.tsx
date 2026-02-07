import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Card, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { useEventsState } from '../../../state/events/eventsContext';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

type EventsListScreenProps = NativeStackScreenProps<EventsStackParamList, 'Events'>;

export function EventsListScreen({ navigation }: EventsListScreenProps) {
  const theme = useTheme();
  const { events } = useEventsState();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);

  const handlePressEvent = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetails', { eventId });
    },
    [navigation],
  );

  const renderEventItem = useCallback(
    ({ item }: { item: { id: string; name: string; description?: string } }) => (
      <EventCard event={item} onPress={handlePressEvent} />
    ),
    [handlePressEvent],
  );

  const filteredEvents = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) {
      return events;
    }

    return events.filter((event) => event.name.toLowerCase().includes(normalized));
  }, [debouncedQuery, events]);

  const handleAddEvent = useCallback(() => {
    navigation.navigate('AddEvent');
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top", "left", "right"]}>
      <Appbar.Header>
        <Appbar.Content title="Events" />
      </Appbar.Header>

      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search events"
        style={styles.search}
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        style={styles.list}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        contentContainerStyle={[
          styles.listContent,
          filteredEvents.length === 0 ? styles.listEmpty : null,
        ]}
        renderItem={renderEventItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyMedium">No events found</Text>
          </View>
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={handleAddEvent} />
    </SafeAreaView>
  );
}

type EventCardProps = {
  event: { id: string; name: string; description?: string };
  onPress: (eventId: string) => void;
};

const EventCard = memo(function EventCard({ event, onPress }: EventCardProps) {
  const handlePress = useCallback(() => {
    onPress(event.id);
  }, [event.id, onPress]);

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <Text variant="titleMedium">{event.name}</Text>
        {event.description ? (
          <Text variant="bodyMedium" style={styles.description}>
            {event.description}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
  },
  description: {
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
});
