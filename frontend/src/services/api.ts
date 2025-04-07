import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';

type Expense = {
    _id: string;
    categoryName: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: string;
    nextRecurrenceDate: string;
    isOriginal: boolean;
    createdAt: string;
    updatedAt: string;
};

type ExpensesResponse = {
    message: string;
    expenses: Expense[];
    totalExpenses: number;
    currentPage: number;
    totalPages: number;
    nextPage: string | null;
    prevPage: string | null;
};

type Category = {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

type CategoriesResponse = {
    message: string;
    categories: Category[];
};

type AddExpenseRequest = {
    name: string;
    categoryName: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: 'daily' | 'weekly' | 'monthly'; // Optional, only if isRecurring is true
};

type AddExpenseResponse = {
    message: string;
    expense: Expense;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const expensesApi = createApi({
    reducerPath: 'expensesApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['Expenses', 'Categories',],
    endpoints: (builder) => ({
        getExpenses: builder.query<
            ExpensesResponse,
            { page?: number; limit?: number; sortBy?: 'newest' | 'oldest'; expenseType?: 'recurring' | 'non-recurring' }
        >({
            query: ({ page = 1, limit = 5, sortBy = 'newest', expenseType }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    sortBy,
                });
                if (expenseType) params.append('expenseType', expenseType);
                return `/expenses?${params.toString()}`;
            },
            providesTags: ['Expenses'],
            keepUnusedDataFor: 60,
        }),
        getCategories: builder.query<CategoriesResponse, void>({
            query: () => '/categories',
            providesTags: ['Categories'],
            keepUnusedDataFor: 3600,
        }),
        addExpense: builder.mutation<AddExpenseResponse, AddExpenseRequest>({
            query: (newExpense) => ({
                url: '/expenses',
                method: 'POST',
                body: newExpense,
            }),
            async onQueryStarted(newExpense, { dispatch, queryFulfilled, getState }) {
                try {
                    await queryFulfilled;
                    const state = getState() as RootState; // Replace with RootState if typed
                    const cachedCategories = expensesApi.endpoints.getCategories.select()(state);
                    const existingCategories = cachedCategories.data?.categories.map(c => c.name) || [];
                    if (!existingCategories.includes(newExpense.categoryName)) {
                        dispatch(expensesApi.util.invalidateTags(['Categories']));
                    }
                    dispatch(expensesApi.util.invalidateTags(['Expenses']));
                } catch (error) {
                    console.error('Failed to add expense:', error);
                }
            },
        }),
    }),
});

export const { useGetExpensesQuery, useGetCategoriesQuery, useAddExpenseMutation } = expensesApi;

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// type Expense = {
//     _id: string;
//     categoryName: string;
//     name: string;
//     amount: number;
//     isRecurring: boolean;
//     recurringInterval?: string;
//     nextRecurrenceDate: string;
//     isOriginal: boolean;
//     createdAt: string;
//     updatedAt: string;
// };

// type ExpensesResponse = {
//     message: string;
//     expenses: Expense[];
//     totalExpenses: number;
//     currentPage: number;
//     totalPages: number;
//     nextPage: string | null;
//     prevPage: string | null;
// };

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// export const expensesApi = createApi({
//     reducerPath: 'expensesApi',
//     baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
//     endpoints: (builder) => ({
//         getExpenses: builder.query<
//             ExpensesResponse,
//             { page?: number; limit?: number; sortBy?: 'newest' | 'oldest'; expenseType?: 'recurring' | 'non-recurring' }
//         >({
//             query: ({ page = 1, limit = 5, sortBy = 'newest', expenseType }) => {
//                 const params = new URLSearchParams({
//                     page: page.toString(),
//                     limit: limit.toString(),
//                     sortBy,
//                 });
//                 if (expenseType) params.append('expenseType', expenseType);
//                 return `/expenses?${params.toString()}`;
//             },
//             keepUnusedDataFor: 60, // Cache data for 60 seconds
//         }),
//     }),
// });

// export const { useGetExpensesQuery } = expensesApi;