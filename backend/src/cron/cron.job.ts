import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class CronJob {
    private readonly logger = new Logger(CronJob.name);

    constructor(private readonly rabbitMQService: RabbitMQService) { }

    // @Cron(CronExpression.EVERY_5_SECONDS) || @Cron('0 0 1 * *')
    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCron() {
        this.logger.log('Monthly cron job started');
        const msg = {
            id: '2938ta2938923',
            timestamp: new Date().toISOString(),
            text: 'This is a dummy payload',
        };

        try {
            await this.rabbitMQService.sendToQueue(msg);
            this.logger.debug('Message successfully sent to RabbitMQ queue');
        } catch (error) {
            this.logger.error('Failed to send message to RabbitMQ', error);
            throw error;
        }
    }
}