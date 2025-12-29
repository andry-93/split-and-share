import { useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid/non-secure';

import { Expense } from '@/entities/types';
import { expensesRepository } from '@/entities/expense/expense.repository';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addExpense,
    removeExpense,
    setExpenses,
    updateExpense as updateExpenseAction,
} from '@/store/slices/expenses.slice';
import { selectExpenses } from '@/store/selectors/expenses.selectors';

export const useExpenses = (eventId: string) => {
    const dispatch = useAppDispatch();
    const allExpenses = useAppSelector(
        selectExpenses
    );

    /* ========= LOAD (ONCE) ========= */
    useEffect(() => {
        dispatch(setExpenses(expensesRepository.getAll()));
    }, [dispatch]);

    /* ========= FILTER BY EVENT ========= */
    const expenses = useMemo(
        () =>
            allExpenses.filter(
                e => e.eventId === eventId
            ),
        [allExpenses, eventId]
    );

    /* ========= CREATE ========= */
    const createExpense = async (
        description: string,
        amount: number,
        paidBy: string
    ) => {
        const expense: Expense = {
            id: nanoid(),
            eventId,
            description,
            amount,
            paidBy,
        };

        const next = [...allExpenses, expense];
        await expensesRepository.saveAll(next);
        dispatch(addExpense(expense));
    };

    /* ========= UPDATE ========= */
    const updateExpense = async (
        id: string,
        description: string,
        amount: number,
        paidBy: string
    ) => {
        const current = allExpenses.find(
            e => e.id === id
        );
        if (!current) return;

        const updated: Expense = {
            ...current,
            description,
            amount,
            paidBy,
        };

        const next = allExpenses.map(e =>
            e.id === id ? updated : e
        );

        await expensesRepository.saveAll(next);
        dispatch(
            updateExpenseAction({
                id,
                changes: {
                    description,
                    amount,
                    paidBy,
                },
            })
        );
    };

    /* ========= DELETE ========= */
    const deleteExpense = async (id: string) => {
        const next = allExpenses.filter(
            e => e.id !== id
        );
        await expensesRepository.saveAll(next);
        dispatch(removeExpense(id));
    };

    return {
        expenses,
        createExpense,
        updateExpense,
        deleteExpense,
    };
};
