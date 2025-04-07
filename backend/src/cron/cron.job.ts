import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronService } from './cron.service';

@Injectable()
export class CronJob {
    constructor(private readonly cronService: CronService) { }

    // @Cron(CronExpression.EVERY_5_SECONDS) || @Cron('0 0 1 * *')
    @Cron('0 0 1 * *')
    async handleCron() {
        await this.cronService.sendMessage();
    }
}