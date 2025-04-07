import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
    ) { }

    async findAll(sortBy: string = 'newest'): Promise<Category[]> {
        try {
            const sort: { [key: string]: SortOrder } = { createdAt: sortBy === 'oldest' ? 1 : -1 };
            const categories = await this.categoryModel.find().select('-__v').sort(sort).exec();

            if (categories.length === 0) {
                throw new NotFoundException('No categories found.');
            }

            return categories;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException('Failed to retrieve categories', 500);
        }
    }

    async findOne(id: string): Promise<Category> {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new BadRequestException(`Invalid ID format: ${id}`);
            }

            const category = await this.categoryModel.findById(id).select('-__v').exec();
            if (!category) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            return category;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new HttpException('Failed to retrieve category', 500);
        }
    }

    async create(category: CreateCategoryDto): Promise<string> {
        try {
            const newCategory = await this.categoryModel.create(category);
            return newCategory._id.toString();
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('Cannot create duplicate category', 409);
            }
            throw new BadRequestException('Failed to create category');
        }
    }

    async update(id: string, category: CreateCategoryDto): Promise<Category> {
        try {
            const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, category, {
                new: true,
            }).exec();

            if (!updatedCategory) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            return updatedCategory;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === 11000) {
                throw new HttpException('A category with this name already exists!', 409);
            }
            throw new BadRequestException('Failed to update category');
        }
    }

    async remove(id: string): Promise<Category> {
        try {
            const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
            if (!deletedCategory) {
                throw new NotFoundException(`Category with id ${id} not found`);
            }

            return deletedCategory;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException('Failed to delete category', 500);
        }
    }
}