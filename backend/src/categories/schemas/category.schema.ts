import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

@Schema({ collection: 'categories', timestamps: true })
export class Category {
    _id: ObjectId;

    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ required: false })
    createdAt: Date;

    @Prop({ required: false })
    updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);