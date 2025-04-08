import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../schemas/category.schema';

export class CategoryResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Categories found successfully' })
    message: string;

    @ApiProperty({ description: 'List of categories', type: [Category] })
    categories: Category[];
}

export class SingleCategoryResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Category found successfully' })
    message: string;

    @ApiProperty({ description: 'The retrieved category', type: Category })
    category: Category;
}

export class CreateCategoryResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Category created successfully' })
    message: string;

    @ApiProperty({ description: 'The ID of the newly created category', example: '507f1f77bcf86cd799439011' })
    newCategoryId: string;
}

export class UpdateCategoryResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Category updated successfully' })
    message: string;

    @ApiProperty({ description: 'The updated category', type: Category })
    updatedCategory: Category;
}

export class DeleteCategoryResponseDto {
    @ApiProperty({ description: 'A message indicating the result of the operation', example: 'Category deleted successfully' })
    message: string;

    @ApiProperty({ description: 'The deleted category', type: Category })
    deletedCategory: Category;
}