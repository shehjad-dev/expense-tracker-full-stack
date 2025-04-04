import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Expense.name,
                schema: ExpenseSchema
            }
        ])
    ],
    controllers: [ExpensesController],
    providers: [ExpensesService]
})
export class ExpensesModule { }
