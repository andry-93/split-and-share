import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '../../entities/types';

export type ExpenseSplit = {
    participantId: string;
    amount: number;
};

type ExpensesState = {
    list: Expense[];
};

const initialState: ExpensesState = {
    list: [],
};

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        addExpense(state, action: PayloadAction<Expense>) {
            state.list.push(action.payload);
        },

        updateExpense(
            state,
            action: PayloadAction<{
                id: string;
                title?: string;
                amount?: number;
                paidByParticipantId?: string;
                splits?: ExpenseSplit[];
            }>
        ) {
            const expense = state.list.find(
                e => e.id === action.payload.id
            );

            if (!expense) return;

            if (action.payload.title !== undefined) {
                expense.title = action.payload.title;
            }

            if (action.payload.amount !== undefined) {
                expense.amount = action.payload.amount;
            }

            if (action.payload.paidByParticipantId !== undefined) {
                expense.paidByParticipantId =
                    action.payload.paidByParticipantId;
            }

            if (action.payload.splits !== undefined) {
                expense.splits = action.payload.splits;
            }
        },

        removeExpense(state, action: PayloadAction<string>) {
            state.list = state.list.filter(
                e => e.id !== action.payload
            );
        },

        removeExpensesByEvent(
            state,
            action: PayloadAction<string>
        ) {
            state.list = state.list.filter(
                e => e.eventId !== action.payload
            );
        },
    },
});

export const {
    addExpense,
    updateExpense,
    removeExpense,
    removeExpensesByEvent,
} = expensesSlice.actions;

export default expensesSlice.reducer;
