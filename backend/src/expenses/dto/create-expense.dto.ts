import { IsBoolean, IsEnum, IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsBoolean()
    @IsNotEmpty()
    isRecurring: boolean;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;
}