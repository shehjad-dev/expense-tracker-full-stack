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
import { Logger } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(@Query('sortBy') sortBy: string = 'newest') {
        this.logger.debug(`Fetching all categories with sortBy=${sortBy}`);
        return this.categoriesService.findAll(sortBy);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        this.logger.debug(`Fetching category with id=${id}`);
        return this.categoriesService.findOne(id);
    }

    @Post()
    async create(@Body(ValidationPipe) category: CreateCategoryDto) {
        this.logger.debug('Creating new category', category);
        return this.categoriesService.create(category);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatedCategory: CreateCategoryDto,
    ) {
        this.logger.debug(`Updating category id=${id}`, updatedCategory);
        return this.categoriesService.update(id, updatedCategory);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        this.logger.debug(`Deleting category id=${id}`);
        return this.categoriesService.remove(id);
    }
}