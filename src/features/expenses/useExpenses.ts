import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Expense } from '@/entities/types';
import { expensesRepository } from '@/entities/expense/expense.repository';
import { nanoid } from 'nanoid/non-secure';

export const useExpenses = (eventId: string) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const load = async () => {
        const data = await expensesRepository.getByEvent(eventId);
        setExpenses(data);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [eventId])
    );

    const createExpense = async (
        description: string,
        amount: number,
        paidBy: string
    ) => {
        const all = await expensesRepository.getAll();

        const newExpense: Expense = {
            id: nanoid(),
            eventId,
            description,
            amount,
            paidBy,
        };

        const updated = [...all, newExpense];
        await expensesRepository.saveAll(updated);
        setExpenses(updated.filter(e => e.eventId === eventId));
    };

    const updateExpense = async (
        id: string,
        description: string,
        amount: number,
        paidBy: string
    ) => {
        const all = await expensesRepository.getAll();
        const updated = all.map(e =>
            e.id === id
                ? { ...e, description, amount, paidBy }
                : e
        );

        await expensesRepository.saveAll(updated);
        setExpenses(updated.filter(e => e.eventId === eventId));
    };

    const deleteExpense = async (id: string) => {
        const all = await expensesRepository.getAll();
        const updated = all.filter(e => e.id !== id);

        await expensesRepository.saveAll(updated);
        setExpenses(updated.filter(e => e.eventId === eventId));
    };

    return {
        expenses,
        createExpense,
        updateExpense,
        deleteExpense,
    };
};
