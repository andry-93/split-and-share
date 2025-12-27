import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '@/entities/types';

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
        setExpenses(
            state,
            action: PayloadAction<Expense[]>
        ) {
            state.list = action.payload;
        },

        addExpense(
            state,
            action: PayloadAction<Expense>
        ) {
            state.list.push(action.payload);
        },

        updateExpense(
            state,
            action: PayloadAction<{
                id: string;
                changes: Partial<Expense>;
            }>
        ) {
            const index = state.list.findIndex(
                e => e.id === action.payload.id
            );
            if (index === -1) return;

            state.list[index] = {
                ...state.list[index],
                ...action.payload.changes,
            };
        },

        removeExpense(
            state,
            action: PayloadAction<string>
        ) {
            state.list = state.list.filter(
                e => e.id !== action.payload
            );
        },
    },
});

export const {
    setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;
