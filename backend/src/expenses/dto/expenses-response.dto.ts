import { Expose, Type } from 'class-transformer';

export class ExpensesResponseDto {
    @Expose()
    message: string;

    @Expose()
    @Type(() => ExpenseDto)
    expenses: ExpenseDto[];

    @Expose()
    totalExpenses: number;

    @Expose()
    currentPage: number;

    @Expose()
    totalPages: number;

    @Expose()
    nextPage: string | null;

    @Expose()
    prevPage: string | null;
}

export class ExpenseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    amount: number;

    @Expose()
    category: string;

    @Expose()
    isRecurring: boolean;

    @Expose()
    createdAt: string;
}