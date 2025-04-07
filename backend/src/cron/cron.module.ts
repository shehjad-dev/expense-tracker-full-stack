import { Module } from '@nestjs/common';
import { CronJob } from './cron.job';
import { ProducerModule } from 'src/rabbitmq/producer/producer.module';

@Module({
    imports: [ProducerModule],
    providers: [CronJob],
})
export class CronModule { }