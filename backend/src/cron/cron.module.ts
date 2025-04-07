import { Module } from '@nestjs/common';
import { CronJob } from './cron.job';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
    imports: [RabbitMQModule],
    providers: [CronJob],
})
export class CronModule { }