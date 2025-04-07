import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Document } from 'mongoose';

export interface ExpenseDocument extends Expense, Document {
    _id: ObjectId;
}

@Schema({ collection: 'expenses', timestamps: true })
export class Expense {
    @Prop({ required: true })
    categoryName: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    isRecurring: boolean;

    @Prop({ required: false, enum: ['daily', 'weekly', 'monthly'] })
    recurringInterval?: 'daily' | 'weekly' | 'monthly';

    @Prop({ required: false, type: Date })
    nextRecurrenceDate?: Date;

    @Prop({ required: true, default: true })
    isOriginal: boolean;

    @Prop({ required: false })
    createdAt: Date;

    @Prop({ required: false })
    updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.pre<ExpenseDocument>('save', function (next) {
    if (this.isRecurring && !this.recurringInterval) {
        return next(new Error('Recurring interval is required for recurring expenses'));
    }

    if ((this.isNew || this.isModified('isRecurring')) && this.isRecurring && this.recurringInterval && !this.nextRecurrenceDate) {
        const baseDate = this.createdAt || new Date();
        const nextDate = new Date(baseDate);

        switch (this.recurringInterval) {
            case 'daily':
                nextDate.setUTCDate(nextDate.getUTCDate() + 1);
                break;
            case 'weekly':
                nextDate.setUTCDate(nextDate.getUTCDate() + 7);
                break;
            case 'monthly':
                const targetDay = nextDate.getUTCDate();
                const nextMonth = nextDate.getUTCMonth() + 1;
                const nextYear = nextDate.getUTCFullYear();
                nextDate.setUTCMonth(nextMonth);
                const lastDayOfNextMonth = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
                nextDate.setUTCDate(Math.min(targetDay, lastDayOfNextMonth));
                break;
            default:
                return next(new Error('Invalid recurring interval'));
        }
        this.nextRecurrenceDate = nextDate;
    }

    next();
});