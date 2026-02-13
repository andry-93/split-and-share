import { PersonItem } from '@/features/people/types/people';
import { createInitialPeopleSeed } from '@/state/seed/seedData';

export const initialPeople: PersonItem[] = createInitialPeopleSeed();
