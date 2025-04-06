import { Module } from '@nestjs/common';
import { CronJob } from './cron.job';
import { CronService } from './cron.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
    imports: [RabbitMQModule],
    providers: [CronJob, CronService],
})
export class CronModule { }