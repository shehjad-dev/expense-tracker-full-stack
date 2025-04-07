import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(private readonly rabbitMQService: RabbitMQService) { }

    async sendMessage() {
        const msg = {
            id: '2938ta2938923',
            timestamp: new Date().toISOString(),
            text: 'This is a dummy payload',
        };

        try {
            this.logger.log('Cron job executed, sending message', msg);
            await this.rabbitMQService.sendToQueue(msg);
            this.logger.debug('Message successfully sent to queue');
        } catch (error) {
            this.logger.error('Failed to send message to RabbitMQ', error);
            throw error;
        }
    }
}