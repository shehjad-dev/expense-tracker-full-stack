import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, SchemaTypes } from 'mongoose';
// import { HydratedDocument } from 'mongoose';

// export type CatDocument = HydratedDocument<Cat>;

@Schema({ collection: 'expenses', timestamps: true })
export class Expense {
    //   @Prop()
    _id: ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Category', required: true })
    category: ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    amount: number;

    // @Prop({ required: true })
    // category: string;

    @Prop({ required: true })
    isRecurring: boolean;

    @Prop({ required: false })
    createdAt: Date;

    @Prop({ required: false })
    updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);