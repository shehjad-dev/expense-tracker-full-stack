import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronService } from './cron.service';

@Injectable()
export class CronJob {
    private readonly logger = new Logger(CronJob.name);

    constructor(private readonly cronService: CronService) { }

    // @Cron(CronExpression.EVERY_5_SECONDS) || @Cron('0 0 1 * *')
    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCron() {
        this.logger.log('Monthly cron job started');
        try {
            await this.cronService.sendMessage();
            this.logger.log('Monthly cron job completed successfully');
        } catch (error) {
            this.logger.error('Monthly cron job failed', error);
            throw error;
        }
    }
}