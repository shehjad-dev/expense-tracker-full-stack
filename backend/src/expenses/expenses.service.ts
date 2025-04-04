import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
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

    // private expenses: any[] = [
    //     { id: 1, name: 'Groceries', amount: 2000, category: 'family', isRecurring: false, createdAt: "2nd March, 2025" },
    //     { id: 2, name: 'Electricity', amount: 1400, category: 'family', isRecurring: true, createdAt: "4th March, 2025" },
    //     { id: 3, name: 'Books', amount: 300, category: 'studies', isRecurring: false, createdAt: "9th March, 2025" },
    //     { id: 4, name: 'Uber Cost', amount: 220, category: 'work', isRecurring: false, createdAt: "1st April, 2025" },
    //     { id: 5, name: 'Netflix Subscription', amount: 120, category: 'entertainment', isRecurring: true, createdAt: "2nd April, 2025" },
    // ];

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

    async findAll(expenseType?: ExpenseType, page: number = 1, limit: number = 10, sortBy: string = 'newest') { // Increased default limit
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

    // async create(expense: CreateExpenseDto) {
    //     try {
    //         const newExpense = await this.expenseModel.create(expense);
    //         return {
    //             message: 'Expense created successfully',
    //             newExpenseId: newExpense._id,
    //             // newExpenseId: newId,
    //         };
    //     } catch (err) {
    //         console.log(`Error222: `, err);
    //         throw new HttpException(`Error happened`, 404);
    //     }
    // }

    // async create(expense: CreateExpenseDto) {
    //     try {
    //         const category = await this.categoryModel.findOne({ name: expense.categoryName });
    //         console.log("Cattttt: ", category)
    //         // throw new HttpException(`Error happened`, 404);


    //         if (!category) {
    //             const session = await this.expenseModel.startSession();
    //             try {
    //                 await session.withTransaction(async () => {
    //                     const newCategoryDbResp = await this.categoryModel.create([{ name: expense.categoryName }], { session });
    //                     const newCategory = newCategoryDbResp[0];
    //                     console.log("NewCATA: ", newCategory)

    //                     if (!newCategory || !newCategory._id) {
    //                         throw new HttpException(`Could not create category`, 404);
    //                     }
    //                     const newExpense = await this.expenseModel.create({ ...expense, categoryName: newCategory.name }, { session });
    //                     return {
    //                         message: 'Expense created successfully',
    //                         newExpenseId: newExpense[0]._id,
    //                     };
    //                 });
    //             } catch (err) {
    //                 console.log(`Error creating category and expense: `, err);
    //                 throw new HttpException(`Error happened`, 404);
    //             } finally {
    //                 await session.endSession();
    //             }
    //         } else {
    //             const newExpense = await this.expenseModel.create(expense);
    //             return {
    //                 message: 'Expense created successfully',
    //                 newExpenseId: newExpense._id,
    //             };
    //         }
    //     } catch (err) {
    //         console.log(`Error creating expense: `, err);
    //         throw new HttpException(`Error happened`, 404);
    //     }
    // }

    async create(expense: CreateExpenseDto) {
        const session = await this.connection.startSession(); // Fixed session start
        session.startTransaction();

        try {
            const category = await this.categoryModel.findOne({
                name: expense.categoryName
            }).session(session); // Include session in query
            console.log("Found category: ", category)

            if (!category) {
                const newCategory = await this.categoryModel.create(
                    [{ name: expense.categoryName }],
                    { session }
                );

                if (!newCategory[0]?._id) {
                    throw new HttpException('Category creation failed', 500);
                }

                const [newExpense] = await this.expenseModel.create(
                    [{ ...expense, categoryName: newCategory[0].name }],
                    { session }
                );

                await session.commitTransaction();
                return {
                    message: 'Expense created successfully',
                    newExpenseId: newExpense._id
                };
            } else {
                const [newExpense] = await this.expenseModel.create(
                    [expense],
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
            throw new HttpException(
                err.message || 'Database operation failed',
                err.status || 500
            );
        } finally {
            session.endSession();
        }
    }

    async update(id: string, expense: UpdateExpenseDto) {
        const updatedExpense = await this.expenseModel.findByIdAndUpdate(id, expense, { new: true });
        return {
            message: 'Expense updated successfully',
            updatedExpense: updatedExpense,
        };
    }

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


}

