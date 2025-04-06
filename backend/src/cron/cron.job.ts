import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronService } from './cron.service';

@Injectable()
export class CronJob {
    constructor(private readonly cronService: CronService) { }

    // @Cron(CronExpression.EVERY_5_SECONDS) // Run every 5 SECONDS
    @Cron('0 0 1 * *') // Run every month on the 1st day at 00:00
    async handleCron() {
        await this.cronService.sendMessage();
    }
}