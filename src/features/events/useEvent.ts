import { useAppSelector } from '@/store/hooks';
import { selectEvents } from '@/store/selectors/events.selectors';

export const useEvent = (eventId: string) => {
    const event = useAppSelector(state =>
        selectEvents(state).find(e => e.id === eventId)
    );

    if (!event) {
        throw new Error(
            `Event with id ${eventId} not found`
        );
    }

    return { event };
};
