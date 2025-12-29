import { Expense } from '../types';
import { storage } from '@/shared/lib/storage';

const EXPENSES_KEY = 'expenses';

export const expensesRepository = {
    getAll(): Expense[] {
        return storage.get<Expense[]>(EXPENSES_KEY) ?? [];
    },

    getByEvent(eventId: string): Expense[] {
        const all = this.getAll();
        return all.filter(e => e.eventId === eventId);
    },

    saveAll(expenses: Expense[]): void {
        storage.set(EXPENSES_KEY, expenses);
    },
};
