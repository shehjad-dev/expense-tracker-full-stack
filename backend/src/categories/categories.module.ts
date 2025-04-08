import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema'
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Category.name,
                schema: CategorySchema
            },
            {
                name: Expense.name,
                schema: ExpenseSchema
            },
        ])
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService]
})
export class CategoriesModule { }
