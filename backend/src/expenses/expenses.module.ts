import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema'
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Expense.name,
                schema: ExpenseSchema
            },
            {
                name: Category.name,
                schema: CategorySchema
            }
        ])
    ],
    controllers: [ExpensesController],
    providers: [ExpensesService],
    exports: [ExpensesService]
})
export class ExpensesModule { }
