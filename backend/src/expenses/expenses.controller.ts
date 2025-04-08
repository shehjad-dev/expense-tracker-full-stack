import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    ParseIntPipe,
    ValidationPipe,
    Patch,
    Delete,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpenseType } from './types';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ExpenseResponseDto, SingleExpenseResponseDto, CreateExpenseResponseDto, UpdateExpenseResponseDto, DeleteExpenseResponseDto } from './dto/expense-response.dto';
import { DEFAULT_PAGE_NO, DEFAULT_EXPENSES_LIMIT_PER_PAGE, DEFAULT_SORT_BY } from 'src/constants';


@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
    private readonly logger = new Logger(ExpensesController.name);

    constructor(private readonly expensesService: ExpensesService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve all expenses', description: 'Fetches a paginated list of expenses, optionally filtered by type, sorted by creation date.' })
    @ApiQuery({ name: 'expenseType', required: false, enum: ['recurring', 'non-recurring'], description: 'Filter expenses by type (recurring or non-recurring)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: `Page number (default: ${DEFAULT_PAGE_NO})` })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: `Number of expenses per page (default: ${DEFAULT_EXPENSES_LIMIT_PER_PAGE})` })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest'], description: `Sort order for expenses (default: ${DEFAULT_SORT_BY})` })
    @ApiResponse({
        status: 200,
        description: 'Expenses retrieved successfully',
        type: ExpenseResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid expense type or page number' })
    @ApiResponse({ status: 404, description: 'Invalid page number' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async findAll(
        @Query('expenseType') expenseType: ExpenseType,
        @Query('page') page: number = DEFAULT_PAGE_NO,
        @Query('limit') limit: number = DEFAULT_EXPENSES_LIMIT_PER_PAGE,
        @Query('sortBy') sortBy: string = DEFAULT_SORT_BY,
    ) {
        this.logger.debug(`Fetching expenses: type=${expenseType}, page=${page}, limit=${limit}, sortBy=${sortBy}`);
        return this.expensesService.findAll(expenseType, page, limit, sortBy);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single expense', description: 'Fetches an expense by its ID.' })
    @ApiParam({ name: 'id', description: 'The ID of the expense to retrieve', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({
        status: 200,
        description: 'Expense retrieved successfully',
        type: SingleExpenseResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid ID format' })
    @ApiResponse({ status: 404, description: 'Expense not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async findOne(@Param('id') id: string) {
        this.logger.debug(`Fetching expense with id=${id}`);
        return this.expensesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new expense', description: 'Creates a new expense with the provided details.' })
    @ApiBody({ type: CreateExpenseDto, description: 'Expense data to create' })
    @ApiResponse({
        status: 201,
        description: 'Expense created successfully',
        type: CreateExpenseResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid expense data or missing recurring interval' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async create(@Body(ValidationPipe) expense: CreateExpenseDto) {
        this.logger.debug('Creating new expense', expense);
        return this.expensesService.create(expense);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an expense', description: 'Updates an existing expense by its ID.' })
    @ApiParam({ name: 'id', description: 'The ID of the expense to update', example: '507f1f77bcf86cd799439011' })
    @ApiBody({ type: UpdateExpenseDto, description: 'Updated expense data' })
    @ApiResponse({
        status: 200,
        description: 'Expense updated successfully',
        type: UpdateExpenseResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid ID format or missing recurring interval' })
    @ApiResponse({ status: 404, description: 'Expense not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatedExpense: UpdateExpenseDto,
    ) {
        this.logger.debug(`Updating expense id=${id}`, updatedExpense);
        return this.expensesService.update(id, updatedExpense);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an expense', description: 'Deletes an expense by its ID.' })
    @ApiParam({ name: 'id', description: 'The ID of the expense to delete', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({
        status: 200,
        description: 'Expense deleted successfully',
        type: DeleteExpenseResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid ID format' })
    @ApiResponse({ status: 404, description: 'Expense not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async remove(@Param('id') id: string) {
        this.logger.debug(`Deleting expense id=${id}`);
        return this.expensesService.remove(id);
    }
}