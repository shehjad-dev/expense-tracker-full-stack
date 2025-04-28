import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpenseType } from './types';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { Model, FilterQuery, SortOrder, Connection } from 'mongoose';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Category } from 'src/categories/schemas/category.schema';

type PaginatedMetaData = {
  totalExpenses: number;
  currentPage: number;
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
};

interface TransformedExpense {
  _id: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  nextRecurrenceDate?: Date;
  isOriginal: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string;
}

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'dailyRecurringExpenseCheckerCron',
  })
  async handleRecurringExpenses() {
    this.logger.log('Checking for recurring expenses');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    try {
      const recurringExpenses = await this.expenseModel
        .find({
          isRecurring: true,
          isOriginal: true,
          nextRecurrenceDate: { $gte: today, $lte: todayEnd },
        })
        .exec();

      this.logger.log(`Found ${recurringExpenses.length} recurring expenses`);

      const errors: string[] = [];

      for (const expense of recurringExpenses) {
        try {
          if (!expense.nextRecurrenceDate) {
            errors.push(
              `Expense ${expense.name} has no nextRecurrenceDate; skipping`,
            );
            continue;
          }

          const newExpense = {
            ...expense.toObject(),
            _id: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isOriginal: false,
            nextRecurrenceDate: undefined,
          };
          await this.expenseModel.create(newExpense);
          this.logger.debug(
            `Created new recurring expense for ${expense.name}`,
          );

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
              const lastDayOfNextMonth = new Date(
                nextYear,
                nextMonth,
                0,
              ).getDate();
              nextDate.setDate(Math.min(targetDay, lastDayOfNextMonth));
              break;
          }
          expense.nextRecurrenceDate = nextDate;
          await expense.save();
        } catch (error) {
          errors.push(
            `Failed to process expense ${expense.name}: ${error.message}`,
          );
          this.logger.error(
            `Error processing recurring expense ${expense.name}`,
            error,
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(`Cron job completed with errors: ${errors.join('; ')}`);
      }
    } catch (error) {
      this.logger.error('Recurring expenses cron job failed', error);
      throw error;
    }
  }

  private getPaginationMeta(
    totalExpenses: number,
    page: number,
    limit: number,
    sortBy: string,
    expenseType?: string,
  ) {
    const sort = sortBy === 'oldest' ? '&sortBy=oldest' : '';
    const expenseTypeInQuery =
      expenseType === 'recurring' || expenseType === 'non-recurring'
        ? `&expenseType=${expenseType}`
        : '';
    const totalPages = Math.ceil(totalExpenses / limit);
    return {
      totalExpenses,
      currentPage: page,
      totalPages,
      nextPage:
        totalPages > page
          ? `/expenses?${sort}${expenseTypeInQuery}&page=${page + 1}&limit=${limit}`
          : null,
      prevPage:
        page > 1
          ? `/expenses?${sort}${expenseTypeInQuery}&page=${page - 1}&limit=${limit}`
          : null,
    };
  }

  async findAll(
    expenseType?: ExpenseType,
    page: number = 1,
    limit: number = 5,
    sortBy: string = 'newest',
  ): Promise<{
    message: string;
    expenses: Expense[];
    // expenses: TransformedExpense[] || ExpenseType;
    paginationMeta?: PaginatedMetaData;
  }> {
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.floor(limit));

    const query: FilterQuery<Expense> = {};
    if (expenseType === 'recurring') {
      query.isRecurring = true;
    } else if (expenseType === 'non-recurring') {
      query.isRecurring = false;
    } else if (
      expenseType &&
      expenseType !== 'recurring' &&
      expenseType !== 'non-recurring'
    ) {
      throw new BadRequestException(`Invalid expense type: ${expenseType}`);
    }

    const sort: { [key: string]: SortOrder } = {
      createdAt: sortBy === 'oldest' ? 1 : -1,
    };
    const skip = (page - 1) * limit;

    try {
      const [paginatedExpenses, totalExpenses]: [any[], number] =
        await Promise.all([
          this.expenseModel
            .find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
              path: 'categoryId',
              select: 'name',
            })
            .exec(),
          this.expenseModel.countDocuments(query).exec(),
        ]);

      if (totalExpenses === 0) {
        return {
          message: 'No expenses found',
          expenses: [],
        };
      }

      const paginationMeta = this.getPaginationMeta(
        totalExpenses,
        page,
        limit,
        sortBy,
        expenseType,
      );

      if (page > paginationMeta.totalPages) {
        throw new NotFoundException(
          `Invalid page number. Total pages: ${paginationMeta.totalPages}`,
        );
      }

      const transformedExpenses: TransformedExpense[] = paginatedExpenses.map(
        (expense) => {
          const expenseObj = expense.toObject();
          if (expenseObj.categoryId) {
            expenseObj.categoryName = expenseObj.categoryId.name;
            // delete expenseObj.categoryId;
          } else {
            expenseObj.categoryName = 'n/a';
          }
          return expenseObj;
        },
      );

      const message = expenseType
        ? `Expenses of type '${expenseType}' retrieved successfully`
        : 'Expenses retrieved successfully';

      return {
        message: message,
        expenses: transformedExpenses,
        // expenses: paginatedExpenses,
        paginationMeta: paginationMeta,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error fetching expenses', error);
      throw new HttpException('Could not retrieve expenses', 500);
    }
  }

  async findOne(id: string): Promise<{ message: string; expense: Expense }> {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const expense = await this.expenseModel
        .findById(id)
        .select('-__v')
        .populate('categoryId')
        .exec();
      if (!expense) {
        throw new NotFoundException(`Expense with id ${id} not found`);
      }
      return {
        message: `Expense with id ${id} found successfully`,
        expense: expense,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error fetching expense id=${id}`, error);
      throw new HttpException('Could not retrieve expense', 500);
    }
  }

  async create(
    expense: CreateExpenseDto,
  ): Promise<{ message: string; newExpenseId: string }> {
    if (expense.isRecurring && !expense.recurringInterval) {
      throw new BadRequestException(
        'Recurring interval is required for recurring expenses.',
      );
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const category = await this.categoryModel
        .findOne({ name: expense.categoryName })
        .session(session);

      if (!category) {
        const newCategory = await this.categoryModel.create(
          [{ name: expense.categoryName }],
          { session },
        );
        if (!newCategory[0]?._id) {
          throw new HttpException('Category creation failed', 500);
        }

        const [newExpense] = await this.expenseModel.create(
          [
            {
              ...expense,
              categoryName: undefined,
              categoryId: newCategory[0]._id,
              isOriginal: true,
            },
          ],
          { session },
        );

        await session.commitTransaction();
        return {
          message: 'Expense created successfully with new category.',
          newExpenseId: newExpense._id.toString(),
        };
      } else {
        const category = await this.categoryModel
          .findOne({ name: expense.categoryName })
          .exec();
        // .session(session).exec()

        console.log('yoocattt', category, expense.categoryName);
        const [newExpense] = await this.expenseModel.create(
          [
            {
              ...expense,
              categoryName: undefined,
              categoryId: category ? category._id : 'n/a',
              isOriginal: true,
            },
          ],
          { session },
        );

        await session.commitTransaction();
        return {
          message: 'Expense created successfully with existing category.',
          newExpenseId: newExpense._id.toString(),
        };
      }
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Error creating expense', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Database operation failed',
        error.status || 500,
      );
    } finally {
      session.endSession();
    }
  }

  async update(
    id: string,
    expense: UpdateExpenseDto,
  ): Promise<{ message: string; updatedExpense: Expense }> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    if (expense.isRecurring && !expense.recurringInterval) {
      throw new BadRequestException(
        'Recurring interval is required for recurring expenses.',
      );
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const category = await this.categoryModel
        .findOne({ name: expense.categoryName })
        .session(session);

      let updatedExpense: Expense | null;
      if (!category) {
        const newCategory = await this.categoryModel.create(
          [{ name: expense.categoryName }],
          { session },
        );
        if (!newCategory[0]?._id) {
          throw new HttpException('Category creation failed', 500);
        }

        updatedExpense = await this.expenseModel
          .findByIdAndUpdate(
            id,
            {
              expense,
              categoryName: undefined,
              categoryId: newCategory[0]._id,
            },
            { new: true, session },
          )
          .exec();
      } else {
        updatedExpense = await this.expenseModel
          .findByIdAndUpdate(
            id,
            { expense, categoryName: undefined, categoryId: category._id },
            { new: true, session },
          )
          .exec();
      }

      if (!updatedExpense) {
        throw new NotFoundException(`Expense with id ${id} not found`);
      }

      await session.commitTransaction();
      return {
        message: `Expense Updated successfully with ${!category ? 'new' : 'existing'} category.`,
        updatedExpense: updatedExpense,
      };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Error updating expense id=${id}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Database operation failed',
        error.status || 500,
      );
    } finally {
      session.endSession();
    }
  }

  async remove(
    id: string,
  ): Promise<{ message: string; deletedExpense: Expense }> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    try {
      const deletedExpense = await this.expenseModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedExpense) {
        throw new NotFoundException(`Expense with id ${id} not found`);
      }
      return {
        message: 'Expense deleted successfully',
        deletedExpense: deletedExpense,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting expense id=${id}`, error);
      throw new HttpException('Could not delete expense', 500);
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TransformedExpense[]> {
    try {
      const expenses: any[] = await this.expenseModel
        .find({
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .populate('categoryId', 'name')
        .exec();
      const transformedExpenses: TransformedExpense[] = expenses.map(
        (expense) => {
          const expenseObj = expense.toObject();
          if (expenseObj.categoryId) {
            expenseObj.categoryName = expenseObj.categoryId.name;
            // delete expenseObj.categoryId;
          } else {
            expenseObj.categoryName = 'n/a';
          }
          return expenseObj;
        },
      );
      return transformedExpenses;
    } catch (error) {
      this.logger.error('Error fetching expenses by date range', error);
      throw new HttpException('Could not retrieve expenses by date range', 500);
    }
  }
}
