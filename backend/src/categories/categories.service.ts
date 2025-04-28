import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, SortOrder, Connection, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Expense } from 'src/expenses/schemas/expense.schema';
import { UpdateCategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findAll(
    sortBy: string = 'newest',
  ): Promise<{ message: string; categories: Category[] }> {
    this.logger.debug(`Fetching all categories with sortBy=${sortBy}`);
    try {
      const sort: { [key: string]: SortOrder } = {
        createdAt: sortBy === 'oldest' ? 1 : -1,
      };
      const categories = await this.categoryModel
        .find()
        .select('-__v')
        .sort(sort)
        .exec();

      if (categories.length === 0) {
        this.logger.warn('No categories found');
        return {
          message: 'No categories found!',
          categories: categories,
        };
      }

      this.logger.log('Categories retrieved successfully');
      return {
        message: 'Categories found successfully',
        categories: categories,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to retrieve categories', error);
      throw new HttpException('Failed to retrieve categories', 500);
    }
  }

  async findOne(id: string): Promise<{ message: string; category: Category }> {
    this.logger.debug(`Fetching category with id=${id}`);
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        this.logger.warn(`Invalid ID format: ${id}`);
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const category = await this.categoryModel
        .findById(id)
        .select('-__v')
        .exec();
      if (!category) {
        this.logger.warn(`Category with id=${id} not found`);
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      this.logger.log(`Category id=${id} retrieved successfully`);
      return {
        message: 'Category found successfully',
        category: category,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to retrieve category id=${id}`, error);
      throw new HttpException('Failed to retrieve category', 500);
    }
  }

  async create(
    category: CreateCategoryDto,
  ): Promise<{ message: string; newCategoryId: string }> {
    this.logger.debug('Creating new category', category);
    try {
      const newCategory = await this.categoryModel.create(category);
      this.logger.log(
        `Category created successfully with id=${newCategory._id.toString()}`,
      );
      return {
        message: 'Category created successfully',
        newCategoryId: newCategory._id.toString(),
      };
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn('Duplicate category detected', category);
        throw new HttpException('Cannot create duplicate category', 409);
      }
      this.logger.error('Failed to create category', error);
      throw new BadRequestException('Failed to create category');
    }
  }

  async update(
    id: string,
    category: CreateCategoryDto,
  ): Promise<UpdateCategoryResponseDto> {
    this.logger.debug(`Updating category id=${id}`, category);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      this.logger.warn(`Invalid ID format: ${id}`);
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    try {
      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, category, { new: true })
        .exec();

      if (!updatedCategory) {
        this.logger.warn(
          `Category with id=${id} not found after update attempt`,
        );
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      this.logger.log(`Category id=${id} updated successfully`);
      return {
        message: 'Category updated successfully',
        updatedCategory: updatedCategory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 11000) {
        this.logger.warn('Duplicate category name detected', category);
        throw new HttpException(
          'A category with this name already exists!',
          409,
        );
      }
      this.logger.error(`Failed to update category id=${id}`, error);
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(
    id: string,
  ): Promise<{ message: string; deletedCategory: Category }> {
    this.logger.debug(`Deleting category id=${id}`);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const categoryToDelete = await this.categoryModel
        .findById(id)
        .session(session)
        .exec();

      if (!categoryToDelete) {
        this.logger.warn(`Category with id=${id} not found`);
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      const categoryName = categoryToDelete.name;
      this.logger.debug(`Category to delete: ${categoryName}`);

      const objectId = new Types.ObjectId(id);

      const updateResult = await this.expenseModel
        .updateMany(
          { categoryId: objectId },
          { $unset: { categoryId: '' } },
          { session },
        )
        .exec();

      this.logger.debug(
        `Updated ${updateResult.modifiedCount} expenses to categoryName="n/a"`,
      );

      const deletedCategory = await this.categoryModel
        .findByIdAndDelete(id, { session })
        .exec();

      if (!deletedCategory) {
        this.logger.warn(
          `Category with id=${id} not found after deletion attempt`,
        );
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      await session.commitTransaction();
      this.logger.log(
        `Category id=${id} deleted successfully, updated ${updateResult.modifiedCount} expenses`,
      );

      return {
        message:
          'Category deleted successfully, related expenses updated to "n/a"',
        deletedCategory: deletedCategory,
      };
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete category id=${id}`, error);
      throw new HttpException('Failed to delete category', 500);
    } finally {
      session.endSession();
    }
  }
}
