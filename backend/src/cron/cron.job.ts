import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProducerService } from 'src/rabbitmq/producer/producer.service';

@Injectable()
export class CronJob {
    private readonly logger = new Logger(CronJob.name);

    constructor(private readonly producerService: ProducerService) { }

    // @Cron('0 0 1 * *') // Runs monthly at 1 AM || @Cron(CronExpression.EVERY_5_SECONDS)
    @Cron('0 0 1 * *', { name: 'monthlyExpenseReportsCron' })
    async handleCron() {
        this.logger.log('Monthly cron job started');
        const msg = {
            id: '2938ta2938923',
            timestamp: new Date().toISOString(),
            text: 'This is a dummy payload',
        };
        try {
            await this.producerService.sendToQueue(msg);
            this.logger.debug('Message successfully sent to RabbitMQ queue');
        } catch (error) {
            this.logger.error('Failed to send message to RabbitMQ', error);
            throw error;
        }
    }
}