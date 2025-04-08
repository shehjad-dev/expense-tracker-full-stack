import { ApiProperty } from '@nestjs/swagger';

export class ExpenseDto {
    @ApiProperty({ description: 'The unique ID of the expense', example: '507f1f77bcf86cd799439011' })
    _id: string;

    @ApiProperty({ description: 'The name of the expense', example: 'Lunch', required: true })
    name: string;

    @ApiProperty({ description: 'The name of the category for the expense', example: 'Food', required: true })
    categoryName: string;

    @ApiProperty({ description: 'Whether the expense is recurring', example: false, required: true })
    isRecurring: boolean;

    @ApiProperty({ description: 'The interval for recurring expenses (if applicable)', enum: ['daily', 'weekly', 'monthly'], required: false })
    recurringInterval?: 'daily' | 'weekly' | 'monthly';

    @ApiProperty({ description: 'The next recurrence date for recurring expenses (if applicable)', example: '2025-04-08T00:00:00Z', required: false })
    nextRecurrenceDate?: Date;

    @ApiProperty({ description: 'Whether this is the original recurring expense', example: true, required: true })
    isOriginal: boolean;

    @ApiProperty({ description: 'The amount of the expense', example: 25.50, required: true })
    amount: number;

    @ApiProperty({ description: 'The creation date of the expense', example: '2025-04-07T10:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'The last update date of the expense', example: '2025-04-07T10:00:00Z' })
    updatedAt: Date;
}

export class PaginationMetaDto {
    @ApiProperty({ description: 'Total number of expenses', example: 15 })
    totalExpenses: number;

    @ApiProperty({ description: 'Current page number', example: 1 })
    currentPage: number;

    @ApiProperty({ description: 'Total number of pages', example: 3 })
    totalPages: number;

    @ApiProperty({ description: 'URL for the next page (if available)', example: '/expenses?page=2&limit=5', nullable: true })
    nextPage: string | null;

    @ApiProperty({ description: 'URL for the previous page (if available)', example: null, nullable: true })
    prevPage: string | null;
}

export class ExpenseResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Expenses retrieved successfully' })
    message: string;

    @ApiProperty({ description: 'List of expenses', type: [ExpenseDto] })
    expenses: ExpenseDto[];

    @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto, required: false })
    paginationMeta?: PaginationMetaDto;
}

export class SingleExpenseResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Expense with id 507f1f77bcf86cd799439011 found successfully' })
    message: string;

    @ApiProperty({ description: 'The retrieved expense', type: ExpenseDto })
    expense: ExpenseDto;
}

export class CreateExpenseResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Expense created successfully with existing category.' })
    message: string;

    @ApiProperty({ description: 'The ID of the newly created expense', example: '507f1f77bcf86cd799439011' })
    newExpenseId: string;
}

export class UpdateExpenseResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Expense Updated successfully with existing category.' })
    message: string;

    @ApiProperty({ description: 'The updated expense', type: ExpenseDto })
    updatedExpense: ExpenseDto;
}

export class DeleteExpenseResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Expense deleted successfully' })
    message: string;

    @ApiProperty({ description: 'The deleted expense', type: ExpenseDto })
    deletedExpense: ExpenseDto;
}