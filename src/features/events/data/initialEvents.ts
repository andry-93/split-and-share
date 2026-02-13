import { EventItem } from '@/features/events/types/events';
import { createInitialEventsSeed } from '@/state/seed/seedData';

export const initialEvents: EventItem[] = createInitialEventsSeed();
