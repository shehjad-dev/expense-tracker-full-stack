import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExpenseType } from './types';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './schemas/expense.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    ) { }

    private expenses: any[] = [
        { id: 1, name: 'Groceries', amount: 2000, category: 'family', isRecurring: false, createdAt: "2nd March, 2025" },
        { id: 2, name: 'Electricity', amount: 1400, category: 'family', isRecurring: true, createdAt: "4th March, 2025" },
        { id: 3, name: 'Books', amount: 300, category: 'studies', isRecurring: false, createdAt: "9th March, 2025" },
        { id: 4, name: 'Uber Cost', amount: 220, category: 'work', isRecurring: false, createdAt: "1st April, 2025" },
        { id: 5, name: 'Netflix Subscription', amount: 120, category: 'entertainment', isRecurring: true, createdAt: "2nd April, 2025" },
    ];

    // findAll(expenseType: ExpenseType) {
    //     if (!expenseType) {
    //         return this.expenses;
    //     }
    //     if (expenseType !== 'recurring' && expenseType !== 'non-recurring') {
    //         throw new NotFoundException('Invalid expense type!');
    //     }
    //     const isRecurring = expenseType === 'recurring';
    //     const expensesToReturn = this.expenses.filter((expense) => expense.isRecurring === isRecurring);
    //     if (expensesToReturn.length === 0) {
    //         throw new NotFoundException(`You don't have any ${expenseType} expenses`);
    //     }
    //     return expensesToReturn;
    // }

    private async getExpenses(expenseType?: ExpenseType) {
        if (expenseType === 'recurring' || expenseType === 'non-recurring') {
            return this.expenses.filter((expense) => expense.isRecurring === (expenseType === 'recurring'));
        }
        return await this.expenseModel.find().exec();
        // return this.expenses;
    }

    private getPaginationMeta(expenses: any[], page: number, limit: number) {
        const totalPages = Math.ceil(expenses.length / limit);
        return {
            totalExpenses: expenses.length,
            currentPage: page,
            totalPages,
            nextPage: totalPages > page ? `/expenses?page=${page + 1}&limit=${limit}` : null,
            prevPage: page > 1 ? `/expenses?page=${page - 1}&limit=${limit}` : null,
        };
    }

    async findAll(expenseType: ExpenseType, page: number = 1, limit: number = 2) {
        // return this.expenseModel.find().exec();
        const expenses: any = await this.getExpenses(expenseType);
        console.log("Expenses: ", expenses)
        if (expenses.length === 0) {
            throw new NotFoundException(`You don't have any expenses`);
        }
        const paginatedExpenses = expenses.slice((page - 1) * limit, page * limit);
        const message = expenseType ? `Expenses of type ${expenseType} retrieved successfully` : 'Expenses retrieved successfully';
        return {
            message,
            expenses: paginatedExpenses,
            ...this.getPaginationMeta(expenses, page, limit),
        };
    }

    findOne(id: number) {
        const expense = this.expenses.find((expense) => expense.id === id);
        if (!expense) {
            throw new NotFoundException(`Expense with id- ${id} not found`);
        }
        return {
            message: 'Expense found successfully',
            expense: expense,
        };
    }

    async create(expense: CreateExpenseDto) {
        // if (!expense.name || !expense.category || !expense.amount) {
        //     throw new BadRequestException('Name, Category and amount are required fields');
        // }
        // const newId = this.expenses.reduce((max, user) => Math.max(max, user.id), 0) + 1;
        // const newExpense = {
        //     id: newId,
        //     ...expense,
        //     isRecurring: expense.isRecurring ? true : false,
        //     createdAt: '4th April, 2025',
        // };
        // this.expenses.push(newExpense);
        const newExpense = await this.expenseModel.create(expense);
        return {
            message: 'Expense created successfully',
            newExpense: newExpense,
            // newExpenseId: newId,
        };
    }


}
