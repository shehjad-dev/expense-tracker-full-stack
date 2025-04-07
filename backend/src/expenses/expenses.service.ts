import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpenseType } from './types';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Expense } from './schemas/expense.schema';
import { Model, FilterQuery, SortOrder, Connection } from 'mongoose';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Category } from 'src/categories/schemas/category.schema';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<Expense>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectConnection() private readonly connection: Connection
    ) { }

    // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleRecurringExpenses() {
        console.log('Checking for recurring expenses...');
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone issues
        const todayEnd = new Date(today);
        todayEnd.setUTCHours(23, 59, 59, 999);

        const recurringExpenses = await this.expenseModel
            .find({
                isRecurring: true,
                isOriginal: true,
                nextRecurrenceDate: { $gte: today, $lte: todayEnd }
            })
            .exec();

        console.log(`Found ${recurringExpenses.length} recurring expenses`);

        const errors: string[] = [];

        for (const expense of recurringExpenses) {
            try {
                if (!expense.nextRecurrenceDate) {
                    errors.push(`Expense ${expense.name} has no nextRecurrenceDate; skipping`);
                    continue;
                }

                const newExpense = {
                    ...expense.toObject(),
                    _id: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isOriginal: false,
                    nextRecurrenceDate: undefined
                };
                await this.expenseModel.create(newExpense);
                console.log(`Created new recurring expense for ${expense.name}`);

                const nextDate = new Date(expense.nextRecurrenceDate);
                switch (expense.recurringInterval) {
                    case 'daily':
                        nextDate.setDate(nextDate.getDate() + 1);
                        break;
                    case 'weekly':
                        nextDate.setDate(nextDate.getDate() + 7);
                        break;
                    case 'monthly':
                        const targetDay = nextDate.getDate();
                        const nextMonth = nextDate.getMonth() + 1;
                        const nextYear = nextDate.getFullYear();
                        nextDate.setMonth(nextMonth);
                        const lastDayOfNextMonth = new Date(nextYear, nextMonth, 0).getDate();
                        nextDate.setDate(Math.min(targetDay, lastDayOfNextMonth));
                        break;
                }
                expense.nextRecurrenceDate = nextDate;
                await expense.save();
            } catch (error) {
                errors.push(`Failed to process expense ${expense.name}: ${error.message}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Cron job completed with errors: ${errors.join('; ')}`);
        }
    }

    private getPaginationMeta(totalExpenses: number, page: number, limit: number, sortBy: string, expenseType: string | undefined) {
        const sort = sortBy === 'oldest' ? `&sortBy=oldest` : ``;

        let expenseTypeInQuery = expenseType === 'recurring' || expenseType === 'non-recurring' ? `&expenseType=${expenseType}` : ``;
        const totalPages = Math.ceil(totalExpenses / limit);
        return {
            totalExpenses: totalExpenses,
            currentPage: page,
            totalPages,
            nextPage: totalPages > page ? `/expenses?${sort}${expenseTypeInQuery}&page=${page + 1}&limit=${limit}` : null,
            prevPage: page > 1 ? `/expenses?${sort}${expenseTypeInQuery}&page=${page - 1}&limit=${limit}` : null,
        };
    }

    async findAll(expenseType?: ExpenseType, page: number = 1, limit: number = 5, sortBy: string = 'newest') { // Increased default limit
        page = Math.max(1, Math.floor(page));
        limit = Math.max(1, Math.floor(limit));

        const query: FilterQuery<Expense> = {};

        if (expenseType === 'recurring') {
            query.isRecurring = true;
        } else if (expenseType === 'non-recurring') {
            query.isRecurring = false;
        } else if (expenseType && expenseType !== 'recurring' && expenseType !== 'non-recurring') {
            throw new BadRequestException(`Invalid expense type: ${expenseType}`);
        }

        // Define sorting (e.g., newest first)
        // const sort = { createdAt: -1 };
        const sort: { [key: string]: SortOrder } = { createdAt: sortBy === 'oldest' ? 1 : -1 };
        // const sort = 'createdAt -1';

        const skip = (page - 1) * limit;

        try {
            const [paginatedExpenses, totalExpenses] = await Promise.all([
                this.expenseModel
                    .find(query)
                    .select('-__v')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    // .populate({
                    //     path: 'category',
                    //     select: '_id name' // Specify the fields you want to select
                    // })
                    .exec(),
                this.expenseModel.countDocuments(query).exec(),
            ]);

            if (totalExpenses === 0) {
                const typeMessage = expenseType ? `of type '${expenseType}' ` : '';
                // Use NotFoundException if no documents match the query *at all*
                throw new NotFoundException(`No expenses ${typeMessage}found.`);
                // Alternatively, you could return an empty list with metadata:
                // return {
                //     message: `No expenses ${typeMessage}found.`,
                //     expenses: [],
                //     ...this.getPaginationMeta(0, page, limit),
                // };
            }

            const paginationMeta = this.getPaginationMeta(totalExpenses, page, limit, sortBy, expenseType);

            if (page > paginationMeta.totalPages) {
                throw new NotFoundException(`Invalid page number. Total pages: ${paginationMeta.totalPages}`);
            }


            const message = expenseType
                ? `Expenses of type '${expenseType}' retrieved successfully`
                : 'Expenses retrieved successfully';

            return {
                message,
                expenses: paginatedExpenses,
                ...paginationMeta,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error("Error fetching expenses:", error);
            throw new BadRequestException('Could not retrieve expenses.'); // Or InternalServerErrorException
        }
    }

    async findOne(id: string) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }

        const expense = await this.expenseModel
            .findById(id)
            .select('-__v')
            // .populate({
            //     path: 'category',
            //     select: '_id name' // Specify the fields you want to select
            // })
            .exec();

        if (!expense) {
            throw new NotFoundException(`Expense with id ${id} not found`);
        }
        return {
            message: 'Expense found successfully',
            expense: expense,
        };
    }

    async create(expense: CreateExpenseDto) {
        if (expense.isRecurring && !expense.recurringInterval) {
            throw new BadRequestException('Recurring interval is required for recurring expenses.');
        }
        const session = await this.connection.startSession(); // Fixed session start
        session.startTransaction();

        try {
            const category = await this.categoryModel.findOne({
                name: expense.categoryName
            }).session(session); // Include session in query
            // console.log("Found category: ", category)

            if (!category) {
                const newCategory = await this.categoryModel.create(
                    [{ name: expense.categoryName }],
                    { session }
                );

                if (!newCategory[0]?._id) {
                    throw new HttpException('Category creation failed', 500);
                }

                const [newExpense] = await this.expenseModel.create(
                    [{ ...expense, categoryName: newCategory[0].name, isOriginal: expense.isOriginal }],
                    { session }
                );

                await session.commitTransaction();
                return {
                    message: 'Expense created successfully',
                    newExpenseId: newExpense._id
                };
            } else {
                const [newExpense] = await this.expenseModel.create(
                    [{ ...expense, isOriginal: expense.isOriginal }],
                    { session } // Use session here too
                );

                await session.commitTransaction();
                return {
                    message: 'Expense created with existing category',
                    newExpenseId: newExpense._id
                };
            }
        } catch (err) {
            await session.abortTransaction();
            console.error('Transaction error:', err);
            if (err.message === 'Recurring interval is required for recurring expenses') {
                throw new BadRequestException('Recurring interval is required for recurring expenses.');
            }
            throw new HttpException(
                err.message || 'Database operation failed',
                err.status || 500
            );

        } finally {
            session.endSession();
        }
    }

    async update(id: string, expense: UpdateExpenseDto) {
        if (expense.isRecurring && !expense.recurringInterval) {
            throw new BadRequestException('Recurring interval is required for recurring expenses.');
        }
        const session = await this.connection.startSession(); // Fixed session start
        session.startTransaction();

        // const updatedExpense = await this.expenseModel.findByIdAndUpdate(id, expense, { new: true });
        // return {
        //     message: 'Expense updated successfully',
        //     updatedExpense: updatedExpense,
        // };
        try {
            const category = await this.categoryModel.findOne({
                name: expense.categoryName
            }).session(session); // Include session in query
            // console.log("Found category: ", category)

            if (!category) {
                const newCategory = await this.categoryModel.create(
                    [{ name: expense.categoryName }],
                    { session }
                );

                if (!newCategory[0]?._id) {
                    throw new HttpException('Category creation failed', 500);
                }

                // const updatedExpense = await this.expenseModel.findByIdAndUpdate(id, expense, { new: true });
                const updatedExpense = await this.expenseModel.findByIdAndUpdate(
                    id,
                    expense,
                    { new: true, session }
                );

                console.log('Updated expense:', updatedExpense);

                await session.commitTransaction();
                return {
                    message: 'Expense Updated successfully with new category.',
                    updatedExpense: updatedExpense
                };
            } else {
                const updatedExpense = await this.expenseModel.findByIdAndUpdate(
                    id,
                    expense,
                    { new: true, session }
                );
                console.log('Updated expense:', updatedExpense);

                await session.commitTransaction();
                return {
                    message: 'Expense updated successfully',
                    updatedExpense: updatedExpense,
                };
            }
        } catch (err) {
            await session.abortTransaction();
            console.error('Transaction error:', err);
            if (err.message === 'Recurring interval is required for recurring expenses') {
                throw new BadRequestException('Recurring interval is required for recurring expenses.');
            }
            throw new HttpException(
                err.message || 'Database operation failed',
                err.status || 500
            );

        } finally {
            session.endSession();
        }
    }
    // async update(id: string, expense: UpdateExpenseDto) {
    //     if (expense.isRecurring && !expense.recurringInterval) {
    //         throw new BadRequestException('Recurring interval is required for recurring expenses.');
    //     }
    //     const updatedExpense = await this.expenseModel.findByIdAndUpdate(id, expense, { new: true });
    //     return {
    //         message: 'Expense updated successfully',
    //         updatedExpense: updatedExpense,
    //     };
    // }

    async remove(id: string) {
        const deletedExpense = await this.expenseModel.findByIdAndDelete(id);
        if (!deletedExpense) {
            throw new NotFoundException(`Expense with id ${id} not found`);
        }
        return {
            message: 'Expense deleted successfully',
            deletedExpense: deletedExpense,
        };
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
        const expenses = await this.expenseModel
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .exec();

        return expenses;
        // return this.expenseModel
        //     .find({
        //         date: {
        //             $gte: startDate,
        //             $lte: endDate,
        //         },
        //     })
        //     .exec();
    }


}

