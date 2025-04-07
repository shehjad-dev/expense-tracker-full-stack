import { Injectable, NotFoundException, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
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

    async update(id: string, category: CreateCategoryDto): Promise<{ message: string; updatedCategory: Category }> {
        this.logger.debug(`Updating category id=${id}`, category);
        try {
            const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, category, {
                new: true,
            }).exec();

            if (!updatedCategory) {
                this.logger.warn(`Category with id=${id} not found`);
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            this.logger.log(`Category id=${id} updated successfully`);
            return {
                message: 'Category updated successfully',
                updatedCategory: updatedCategory,
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === 11000) {
                this.logger.warn('Duplicate category name detected', category);
                throw new HttpException('A category with this name already exists!', 409);
            }
            this.logger.error(`Failed to update category id=${id}`, error);
            throw new BadRequestException('Failed to update category');
        }
    }

    async remove(id: string): Promise<{ message: string; deletedCategory: Category }> {
        this.logger.debug(`Deleting category id=${id}`);
        try {
            const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
            if (!deletedCategory) {
                this.logger.warn(`Category with id=${id} not found`);
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            this.logger.log(`Category id=${id} deleted successfully`);
            return {
                message: 'Category deleted successfully',
                deletedCategory: deletedCategory,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to delete category id=${id}`, error);
            throw new HttpException('Failed to delete category', 500);
        }
    }
}