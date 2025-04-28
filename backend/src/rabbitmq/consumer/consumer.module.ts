import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [RabbitMQModule, ExpensesModule],
  providers: [ConsumerService],
})
export class ConsumerModule {}
