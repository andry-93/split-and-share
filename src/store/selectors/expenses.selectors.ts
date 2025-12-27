import { RootState } from '@/store';

export const selectExpenses = (
    state: RootState
) => state.expenses.list;
