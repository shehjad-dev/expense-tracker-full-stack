import { Injectable, NotFoundException, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, SortOrder, Connection } from 'mongoose';
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
    ) { }

    async findAll(sortBy: string = 'newest'): Promise<{ message: string; categories: Category[] }> {
        this.logger.debug(`Fetching all categories with sortBy=${sortBy}`);
        try {
            const sort: { [key: string]: SortOrder } = { createdAt: sortBy === 'oldest' ? 1 : -1 };
            const categories = await this.categoryModel.find().select('-__v').sort(sort).exec();

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

            const category = await this.categoryModel.findById(id).select('-__v').exec();
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
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to retrieve category id=${id}`, error);
            throw new HttpException('Failed to retrieve category', 500);
        }
    }

    async create(category: CreateCategoryDto): Promise<{ message: string; newCategoryId: string }> {
        this.logger.debug('Creating new category', category);
        try {
            const newCategory = await this.categoryModel.create(category);
            this.logger.log(`Category created successfully with id=${newCategory._id}`);
            return {
                message: 'Category created successfully',
                newCategoryId: newCategory._id.toString(),
            }
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn('Duplicate category detected', category);
                throw new HttpException('Cannot create duplicate category', 409);
            }
            this.logger.error('Failed to create category', error);
            throw new BadRequestException('Failed to create category');
        }
    }

    async update(id: string, category: CreateCategoryDto): Promise<UpdateCategoryResponseDto> {
        this.logger.debug(`Updating category id=${id}`, category);
        const session = await this.connection.startSession();
        try {
            session.startTransaction();

            // Find the category to get the old name
            const existingCategory = await this.categoryModel
                .findById(id)
                .session(session)
                .exec();

            if (!existingCategory) {
                this.logger.warn(`Category with id=${id} not found`);
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            const oldCategoryName = existingCategory.name;
            const newCategoryName = category.name;

            // Update all expenses with the old categoryName to the new categoryName
            await this.expenseModel
                .updateMany(
                    { categoryName: oldCategoryName },
                    { $set: { categoryName: newCategoryName } },
                    { session }
                )
                .exec();

            this.logger.debug(`Updated expenses from categoryName=${oldCategoryName} to ${newCategoryName}`);

            const updatedCategory = await this.categoryModel
                .findByIdAndUpdate(id, category, { new: true, session })
                .exec();

            if (!updatedCategory) {
                this.logger.warn(`Category with id=${id} not found after update attempt`);
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            this.logger.log(`Category id=${id} updated successfully`);
            await session.commitTransaction();

            // const categoryPlain = updatedCategory.toObject();
            return {
                message: 'Category updated successfully',
                updatedCategory: updatedCategory,
            };
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === 11000) {
                this.logger.warn('Duplicate category name detected', category);
                throw new HttpException('A category with this name already exists!', 409);
            }
            this.logger.error(`Failed to update category id=${id}`, error);
            throw new BadRequestException('Failed to update category');
        } finally {
            session.endSession();
        }
    }

    async remove(id: string): Promise<{ message: string; deletedCategory: Category }> {
        this.logger.debug(`Deleting category id=${id}`);
        const session = await this.connection.startSession(); // Start a transaction session
        try {
            session.startTransaction();

            // Step 1: Find the category to get its name before deletion
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

            // Step 2: Update all expenses with this categoryName to "n/a"
            const updateResult = await this.expenseModel
                .updateMany(
                    { categoryName: categoryName }, // Find expenses with this category
                    { $set: { categoryName: 'n/a' } }, // Set categoryName to "n/a"
                    { session } // Bind to the transaction
                )
                .exec();

            this.logger.debug(`Updated ${updateResult.modifiedCount} expenses to categoryName="n/a"`);

            // Step 3: Delete the category
            const deletedCategory = await this.categoryModel
                .findByIdAndDelete(id, { session })
                .exec();

            if (!deletedCategory) {
                this.logger.warn(`Category with id=${id} not found after deletion attempt`);
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            // Step 4: Commit the transaction
            await session.commitTransaction();
            this.logger.log(`Category id=${id} deleted successfully, updated ${updateResult.modifiedCount} expenses`);

            return {
                message: 'Category deleted successfully, related expenses updated to "n/a"',
                deletedCategory: deletedCategory,
            };
        } catch (error) {
            // Roll back the transaction on error
            await session.abortTransaction();
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to delete category id=${id}`, error);
            throw new HttpException('Failed to delete category', 500);
        } finally {
            // Always end the session
            session.endSession();
        }
    }
}