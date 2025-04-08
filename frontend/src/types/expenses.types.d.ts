export type Expense = {
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

export type PaginatedMetaData = {
    totalExpenses: number;
    currentPage: number;
    totalPages: number;
    nextPage: string | null;
    prevPage: string | null;
};