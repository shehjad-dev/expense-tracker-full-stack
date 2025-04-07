import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Patch,
    Delete,
    ValidationPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(@Query('sortBy') sortBy: string = 'newest') {
        const categories = await this.categoriesService.findAll(sortBy);
        return {
            message: 'Categories found successfully',
            categories: categories,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const category = await this.categoriesService.findOne(id);
        return {
            message: 'Category found successfully',
            category: category,
        };
    }

    @Post()
    async create(@Body(ValidationPipe) category: CreateCategoryDto) {
        const newCategoryId = await this.categoriesService.create(category);
        return {
            message: 'Category created successfully',
            newCategoryId: newCategoryId,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatedCategory: CreateCategoryDto,
    ) {
        const updatedCategoryData = await this.categoriesService.update(id, updatedCategory);
        return {
            message: 'Category updated successfully',
            updatedCategory: updatedCategoryData,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deletedCategory = await this.categoriesService.remove(id);
        return {
            message: 'Category deleted successfully',
            deletedCategory: deletedCategory,
        };
    }
}