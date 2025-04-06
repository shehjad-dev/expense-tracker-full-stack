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
    Delete
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpenseType } from './types';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
// import { ApiResponse } from '@nestjs/swagger';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }
    @Get()
    findAll(
        @Query('expenseType') expenseType: ExpenseType,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5,
        @Query('sortBy') sortBy: string = 'newest',
    ) {
        return this.expensesService.findAll(expenseType, +page, limit, sortBy);
    }
    // findAll(@Query('expenseType') expenseType: ExpenseType) {
    //     if (!expenseType) return 'This action returns all expense';

    //     return `This action returns all ${expenseType} expenses`;
    // }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Post()
    create(@Body(ValidationPipe) expense: CreateExpenseDto) {
        return this.expensesService.create(expense);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body(ValidationPipe) updatedExpense: UpdateExpenseDto) {
        return this.expensesService.update(id, updatedExpense);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.expensesService.remove(id);
    }
}
