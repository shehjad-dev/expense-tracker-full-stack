import { IsBoolean, IsEnum, IsString, IsNotEmpty, IsNumber, IsPositive, ValidationOptions, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
    @ApiProperty({ description: 'The name of the expense', example: 'Lunch', required: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'The name of the category for the expense', example: 'Food', required: true })
    @IsString()
    @IsNotEmpty()
    categoryName: string;

    @ApiProperty({ description: 'Whether the expense is recurring', example: false, required: true })
    @IsBoolean()
    @IsNotEmpty()
    isRecurring: boolean;

    @ApiProperty({ description: 'The interval for recurring expenses (if applicable)', enum: ['daily', 'weekly', 'monthly'], required: false })
    recurringInterval?: 'daily' | 'weekly' | 'monthly';

    @ApiProperty({ description: 'Whether this is the original recurring expense (if applicable)', example: true, required: false })
    isOriginal?: boolean;

    @ApiProperty({ description: 'The amount of the expense', example: 25.50, required: true })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;
}