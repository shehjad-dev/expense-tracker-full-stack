import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
// import { HydratedDocument } from 'mongoose';

// export type CatDocument = HydratedDocument<Cat>;

@Schema({ collection: 'categories', timestamps: true })
export class Category {
    //   @Prop()
    _id: ObjectId;

    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ required: false })
    createdAt: Date;

    @Prop({ required: false })
    updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);