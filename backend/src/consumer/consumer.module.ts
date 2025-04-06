import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConsumerService } from './consumer.service';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
    imports: [ConfigModule, ExpensesModule],
    providers: [ConsumerService],
})
export class ConsumerModule { }