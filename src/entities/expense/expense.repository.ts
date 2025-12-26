import { Expense } from '../types';
import { storage } from '../../shared/lib/storage';

const EXPENSES_KEY = 'expenses';

export const expensesRepository = {
    async getAll(): Promise<Expense[]> {
        return (await storage.get<Expense[]>(EXPENSES_KEY)) ?? [];
    },

    async getByEvent(eventId: string): Promise<Expense[]> {
        const all = await this.getAll();
        return all.filter(e => e.eventId === eventId);
    },

    async saveAll(expenses: Expense[]): Promise<void> {
        await storage.set(EXPENSES_KEY, expenses);
    },
};
