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

@Controller('expenses')
export class ExpensesController {
    private readonly logger = new Logger(ExpensesController.name);

    constructor(private readonly expensesService: ExpensesService) { }

    @Get()
    async findAll(
        @Query('expenseType') expenseType: ExpenseType,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5,
        @Query('sortBy') sortBy: string = 'newest',
    ) {
        this.logger.debug(`Fetching expenses: type=${expenseType}, page=${page}, limit=${limit}, sortBy=${sortBy}`);
        return this.expensesService.findAll(expenseType, page, limit, sortBy);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        this.logger.debug(`Fetching expense with id=${id}`);
        return this.expensesService.findOne(id);
    }

    @Post()
    async create(@Body(ValidationPipe) expense: CreateExpenseDto) {
        this.logger.debug('Creating new expense', expense);
        return this.expensesService.create(expense);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatedExpense: UpdateExpenseDto,
    ) {
        this.logger.debug(`Updating expense id=${id}`, updatedExpense);
        return this.expensesService.update(id, updatedExpense);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        this.logger.debug(`Deleting expense id=${id}`);
        return this.expensesService.remove(id);
    }
}