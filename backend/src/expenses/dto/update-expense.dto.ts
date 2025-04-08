import { IsBoolean, IsEnum, IsString, IsNotEmpty, IsNumber, IsPositive, ValidationOptions, registerDecorator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExpenseDto {
    @ApiProperty({ description: 'The name of the expense', example: 'Lunch', required: false })
    name: string;

    @ApiProperty({ description: 'The name of the category for the expense', example: 'Food', required: false })
    categoryName: string;

    @ApiProperty({ description: 'Whether the expense is recurring', example: false, required: false })
    isRecurring: boolean;

    @ApiProperty({ description: 'The interval for recurring expenses (if applicable)', enum: ['daily', 'weekly', 'monthly'], required: false })
    recurringInterval?: 'daily' | 'weekly' | 'monthly';

    @ApiProperty({ description: 'Whether this is the original recurring expense (if applicable)', example: true, required: false })
    isOriginal?: boolean;

    @ApiProperty({ description: 'The amount of the expense', example: 25.50, required: false })
    amount: number;
}

// import { CreateExpenseDto } from './create-expense.dto';
// import { PartialType } from '@nestjs/mapped-types';

// export class UpdateExpenseDto extends PartialType(CreateExpenseDto) { }