import { Module } from '@nestjs/common';
import { CronJob } from './cron.job';
import { CronService } from './cron.service';

@Module({
    providers: [CronJob, CronService],
})
export class CronModule { }