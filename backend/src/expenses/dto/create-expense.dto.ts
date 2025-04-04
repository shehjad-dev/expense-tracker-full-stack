import { IsBoolean, IsEnum, IsString, IsNotEmpty, IsNumber, IsPositive, ValidationOptions, registerDecorator } from 'class-validator';
import { ObjectId } from 'mongoose';

function isMongoId(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isMongoId',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const regex = /^[0-9a-fA-F]{24}$/;
                    return regex.test(value.toString());
                },
                defaultMessage() {
                    return 'must be a valid MongoDB ObjectId';
                }
            }
        });
    };
}

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    // @IsString()
    // @IsNotEmpty()
    // category: string;
    @isMongoId()
    @IsNotEmpty()
    category: ObjectId;

    @IsBoolean()
    @IsNotEmpty()
    isRecurring: boolean;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;
}