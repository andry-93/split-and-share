import { EventGroupItem } from '@/features/events/types/events';
import { createInitialGroupsSeed } from '@/state/seed/seedData';

export const initialGroups: EventGroupItem[] = createInitialGroupsSeed();
