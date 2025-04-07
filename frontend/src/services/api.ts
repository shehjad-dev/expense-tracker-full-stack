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
    recurringInterval?: 'daily' | 'weekly' | 'monthly';
};

type AddExpenseResponse = {
    message: string;
    expense: Expense;
};

type UpdateExpenseRequest = Partial<{
    name: string;
    categoryName: string;
    amount: number;
}>;

type UpdateExpenseResponse = {
    message: string;
    updatedExpense: Expense;
};

type DeleteExpenseResponse = {
    message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const expensesApi = createApi({
    reducerPath: 'expensesApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['Expenses', 'Categories'],
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
                    const state = getState() as RootState;
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
        updateExpense: builder.mutation<UpdateExpenseResponse, { id: string; data: UpdateExpenseRequest }>({
            query: ({ id, data }) => ({
                url: `/expenses/${id}`,
                method: 'PATCH',
                body: data,
            }),
            async onQueryStarted({ data }, { dispatch, queryFulfilled, getState }) {
                try {
                    await queryFulfilled;
                    const state = getState() as RootState;
                    const cachedCategories = expensesApi.endpoints.getCategories.select()(state);
                    const existingCategories = cachedCategories.data?.categories.map(c => c.name) || [];
                    const tagsToInvalidate: any = data.categoryName && !existingCategories.includes(data.categoryName)
                        ? ['Categories', 'Expenses']
                        : ['Expenses'];
                    dispatch(expensesApi.util.invalidateTags(tagsToInvalidate));
                } catch (error) {
                    console.error('Failed to update expense:', error);
                }
            },
        }),
        deleteExpense: builder.mutation<DeleteExpenseResponse, string>({
            query: (id) => ({
                url: `/expenses/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(_id, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(expensesApi.util.invalidateTags(['Expenses']));
                } catch (error) {
                    console.error('Failed to delete expense:', error);
                }
            },
        }),
    }),
});

export const { useGetExpensesQuery, useGetCategoriesQuery, useAddExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation } = expensesApi;




// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { RootState } from '@/store';

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

// type Category = {
//     _id: string;
//     name: string;
//     createdAt: string;
//     updatedAt: string;
// };

// type CategoriesResponse = {
//     message: string;
//     categories: Category[];
// };

// type AddExpenseRequest = {
//     name: string;
//     categoryName: string;
//     amount: number;
//     isRecurring: boolean;
//     recurringInterval?: 'daily' | 'weekly' | 'monthly';
// };

// type AddExpenseResponse = {
//     message: string;
//     expense: Expense;
// };

// type UpdateExpenseRequest = Partial<{
//     name: string;
//     categoryName: string;
//     amount: number;
// }>;

// type UpdateExpenseResponse = {
//     message: string;
//     updatedExpense: Expense;
// };

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// export const expensesApi = createApi({
//     reducerPath: 'expensesApi',
//     baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
//     tagTypes: ['Expenses', 'Categories'],
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
//             providesTags: ['Expenses'],
//             keepUnusedDataFor: 60,
//         }),
//         getCategories: builder.query<CategoriesResponse, void>({
//             query: () => '/categories',
//             providesTags: ['Categories'],
//             keepUnusedDataFor: 3600,
//         }),
//         addExpense: builder.mutation<AddExpenseResponse, AddExpenseRequest>({
//             query: (newExpense) => ({
//                 url: '/expenses',
//                 method: 'POST',
//                 body: newExpense,
//             }),
//             async onQueryStarted(newExpense, { dispatch, queryFulfilled, getState }) {
//                 try {
//                     await queryFulfilled;
//                     const state = getState() as RootState;
//                     const cachedCategories = expensesApi.endpoints.getCategories.select()(state);
//                     const existingCategories = cachedCategories.data?.categories.map(c => c.name) || [];
//                     if (!existingCategories.includes(newExpense.categoryName)) {
//                         dispatch(expensesApi.util.invalidateTags(['Categories']));
//                     }
//                     dispatch(expensesApi.util.invalidateTags(['Expenses']));
//                 } catch (error) {
//                     console.error('Failed to add expense:', error);
//                 }
//             },
//         }),
//         updateExpense: builder.mutation<UpdateExpenseResponse, { id: string; data: UpdateExpenseRequest }>({
//             query: ({ id, data }) => ({
//                 url: `/expenses/${id}`,
//                 method: 'PATCH',
//                 body: data,
//             }),
//             async onQueryStarted({ data }, { dispatch, queryFulfilled, getState }) {
//                 try {
//                     await queryFulfilled;
//                     const state = getState() as RootState;
//                     const cachedCategories = expensesApi.endpoints.getCategories.select()(state);
//                     const existingCategories = cachedCategories.data?.categories.map(c => c.name) || [];
//                     const tagsToInvalidate: any = data.categoryName && !existingCategories.includes(data.categoryName)
//                         ? ['Categories', 'Expenses']
//                         : ['Expenses'];
//                     dispatch(expensesApi.util.invalidateTags(tagsToInvalidate));
//                 } catch (error) {
//                     console.error('Failed to update expense:', error);
//                 }
//             },
//         }),
//     }),
// });

// export const { useGetExpensesQuery, useGetCategoriesQuery, useAddExpenseMutation, useUpdateExpenseMutation } = expensesApi;