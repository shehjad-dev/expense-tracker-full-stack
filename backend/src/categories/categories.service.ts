import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private expenseModel: Model<Category>,
    ) { }

    async findAll(sortBy: string = 'newest') {
        const sort: { [key: string]: SortOrder } = { createdAt: sortBy === 'oldest' ? 1 : -1 };
        const categories = await this.expenseModel
            .find()
            .select('-__v')
            .sort(sort)
            .exec();
        if (categories.length === 0) {
            // Use NotFoundException if no documents match the query *at all*
            throw new NotFoundException(`No categories found.`);
        }

        return {
            message: 'Categories found successfully',
            categories: categories
        };
    }

    async findOne(id: string) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException(`Invalid ID format: ${id}`);
        }

        const category = await this.expenseModel.findById(id).select('-__v').exec();

        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }
        return {
            message: 'Category found successfully',
            category: category
        }
    }

    async create(category: CreateCategoryDto) {
        try {
            const newCategory = await this.expenseModel.create(category);
            return {
                message: 'Category created successfully',
                newCategoryId: newCategory._id,
                // newExpenseId: newId,
            };
        } catch (error) {
            console.error('Error creating category:', error.code);
            if (error.code === 11000) {
                throw new HttpException('Cannot create Duplicate Category', 409);
            }
            throw new BadRequestException('Failed to create category');
        }

    }

    async update(id: string, category: CreateCategoryDto) {
        try {
            const updatedCategory = await this.expenseModel.findByIdAndUpdate(id, category, { new: true });
            return {
                message: 'Category updated successfully',
                updatedCategory: updatedCategory,
            };
        } catch (error) {
            console.error('Error updating category:', error.code);
            if (error.code === 11000) {
                throw new HttpException('Cannot update Duplicate Category', 409);
            }
            throw new BadRequestException('Failed to update category');
        }

    }

    async remove(id: string) {
        const deletedCategory = await this.expenseModel.findByIdAndDelete(id);
        if (!deletedCategory) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }
        return {
            message: 'Category deleted successfully',
            deletedCategory: deletedCategory,
        };
    }
}
