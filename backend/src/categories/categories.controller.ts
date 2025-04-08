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
import {
    CategoryResponseDto,
    SingleCategoryResponseDto,
    CreateCategoryResponseDto,
    UpdateCategoryResponseDto,
    DeleteCategoryResponseDto,
} from './dto/category-response.dto';
import { CategoriesService } from './categories.service';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Category } from './schemas/category.schema';
import { DEFAULT_PAGE_NO, DEFAULT_EXPENSES_LIMIT_PER_PAGE, DEFAULT_SORT_BY } from 'src/constants';


@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve all categories', description: 'Fetches a list of all categories, sorted by creation date.' })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest'], description: `Sort order for categories (default: ${DEFAULT_SORT_BY})` })
    @ApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async findAll(@Query('sortBy') sortBy: string = DEFAULT_SORT_BY) {
        this.logger.debug(`Fetching all categories with sortBy=${sortBy}`);
        return this.categoriesService.findAll(sortBy);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single category', description: 'Fetches a category by its ID.' })
    @ApiParam({ name: 'id', description: 'The ID of the category to retrieve', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({
        status: 200,
        description: 'Category retrieved successfully',
        type: SingleCategoryResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid ID format' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async findOne(@Param('id') id: string) {
        this.logger.debug(`Fetching category with id=${id}`);
        return this.categoriesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new category', description: 'Creates a new category with the provided details.' })
    @ApiBody({ type: CreateCategoryDto, description: 'Category data to create' })
    @ApiResponse({
        status: 201,
        description: 'Category created successfully',
        type: CreateCategoryResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid category data' })
    @ApiResponse({ status: 409, description: 'Duplicate category name' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async create(@Body(ValidationPipe) category: CreateCategoryDto) {
        this.logger.debug('Creating new category', category);
        return this.categoriesService.create(category);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a category', description: 'Updates an existing category by its ID. Also updates all expenses with the old category name to the new category name.' })
    @ApiParam({ name: 'id', description: 'The ID of the category to update', example: '507f1f77bcf86cd799439011' })
    @ApiBody({ type: CreateCategoryDto, description: 'Updated category data' })
    @ApiResponse({
        status: 200,
        description: 'Category updated successfully',
        type: UpdateCategoryResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid category data' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 409, description: 'Duplicate category name' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatedCategory: CreateCategoryDto,
    ) {
        this.logger.debug(`Updating category id=${id}`, updatedCategory);
        return this.categoriesService.update(id, updatedCategory);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category', description: 'Deletes a category by its ID. Also, sets all expenses with the category name to "n/a"' })
    @ApiParam({ name: 'id', description: 'The ID of the category to delete', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({
        status: 200,
        description: 'Category deleted successfully',
        type: DeleteCategoryResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async remove(@Param('id') id: string) {
        this.logger.debug(`Deleting category id=${id}`);
        return this.categoriesService.remove(id);
    }
}