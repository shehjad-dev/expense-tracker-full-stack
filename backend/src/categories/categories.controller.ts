import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    ParseIntPipe,
    ValidationPipe,
    Patch,
    Delete
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll(@Query('sortBy') sortBy: string = 'newest') {
        return this.categoriesService.findAll(sortBy);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Post()
    create(@Body(ValidationPipe) category: CreateCategoryDto) {
        return this.categoriesService.create(category);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body(ValidationPipe) updatedCategory: CreateCategoryDto) {
        return this.categoriesService.update(id, updatedCategory);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
