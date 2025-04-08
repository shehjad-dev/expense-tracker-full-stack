import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ collection: 'categories', timestamps: true })
export class Category {
    @ApiProperty({ description: 'The unique ID of the category', example: '507f1f77bcf86cd799439011' })
    _id: ObjectId;

    @ApiProperty({ description: 'The name of the category', example: 'Food', required: true })
    @Prop({ unique: true, required: true })
    name: string;

    @ApiProperty({ description: 'The creation date of the category', example: '2025-04-07T10:00:00Z' })
    @Prop({ required: false })
    createdAt: Date;

    @ApiProperty({ description: 'The last update date of the category', example: '2025-04-07T10:00:00Z' })
    @Prop({ required: false })
    updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);