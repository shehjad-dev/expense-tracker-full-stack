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

type CreateCategoryRequest = {
    name: string;
};

type CreateCategoryResponse = {
    message: string;
    newCategoryId: string;
};

type CreateCategoryError = {
    statusCode: number;
    message: string;
};

type UpdateCategoryRequest = {
    name: string;
};

type UpdateCategoryResponse = {
    message: string;
    updatedCategory: Category;
};

type CategoryError = {
    statusCode: number;
    message: string;
};

type DeleteCategoryResponse = {
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
                    const tagsToInvalidate: any[] = data.categoryName && !existingCategories.includes(data.categoryName)
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
        createCategory: builder.mutation<CreateCategoryResponse, CreateCategoryRequest>({
            query: (newCategory) => ({
                url: '/categories',
                method: 'POST',
                body: newCategory,
            }),
            async onQueryStarted(_newCategory, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(expensesApi.util.invalidateTags(['Categories']));
                } catch (error) {
                    console.error('Failed to create category:', error);
                }
            },
        }),
        updateCategory: builder.mutation<UpdateCategoryResponse, { id: string; data: UpdateCategoryRequest }>({
            query: ({ id, data }) => ({
                url: `/categories/${id}`,
                method: 'PATCH',
                body: data,
            }),
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(expensesApi.util.invalidateTags(['Categories']));
                } catch (error) {
                    console.error('Failed to update category:', error);
                }
            },
        }),
        deleteCategory: builder.mutation<DeleteCategoryResponse, string>({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(_id, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(expensesApi.util.invalidateTags(['Categories']));
                } catch (error) {
                    console.error('Failed to delete category:', error);
                }
            },
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useGetCategoriesQuery,
    useAddExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = expensesApi;








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

// type DeleteExpenseResponse = {
//     message: string;
// };

// type CreateCategoryRequest = {
//     name: string;
// };

// type CreateCategoryResponse = {
//     message: string;
//     newCategoryId: string;
// };

// type CreateCategoryError = {
//     statusCode: number;
//     message: string;
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
//         deleteExpense: builder.mutation<DeleteExpenseResponse, string>({
//             query: (id) => ({
//                 url: `/expenses/${id}`,
//                 method: 'DELETE',
//             }),
//             async onQueryStarted(_id, { dispatch, queryFulfilled }) {
//                 try {
//                     await queryFulfilled;
//                     dispatch(expensesApi.util.invalidateTags(['Expenses']));
//                 } catch (error) {
//                     console.error('Failed to delete expense:', error);
//                 }
//             },
//         }),
//         createCategory: builder.mutation<CreateCategoryResponse, CreateCategoryRequest>({
//             query: (newCategory) => ({
//                 url: '/categories',
//                 method: 'POST',
//                 body: newCategory,
//             }),
//             async onQueryStarted(_newCategory, { dispatch, queryFulfilled }) {
//                 try {
//                     await queryFulfilled;
//                     dispatch(expensesApi.util.invalidateTags(['Categories']));
//                 } catch (error) {
//                     console.error('Failed to create category:', error);
//                 }
//             },
//         }),
//     }),
// });

// export const {
//     useGetExpensesQuery,
//     useGetCategoriesQuery,
//     useAddExpenseMutation,
//     useUpdateExpenseMutation,
//     useDeleteExpenseMutation,
//     useCreateCategoryMutation,
// } = expensesApi;