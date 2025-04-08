import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ description: 'The name of the category', example: 'Food', required: true })
    @IsString()
    @IsNotEmpty()
    name: string;
}