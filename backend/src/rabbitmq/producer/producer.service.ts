import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { RABBITMQ_QUEUE_NAME } from 'src/constants';

@Injectable()
export class ProducerService {
    private readonly logger = new Logger(ProducerService.name);
    private readonly queueName = RABBITMQ_QUEUE_NAME;

    constructor(private readonly rabbitMQService: RabbitMQService) { }

    async sendToQueue(payload: Record<string, unknown>) {
        try {
            const channel = await this.rabbitMQService.getChannel();
            await channel.assertQueue(this.queueName, { durable: true });
            const message = Buffer.from(JSON.stringify(payload));
            await channel.sendToQueue(this.queueName, message, { persistent: true });
            this.logger.debug('Message sent to queue', payload);
        } catch (error) {
            this.logger.error('Error sending message to queue', error);
            throw error;
        }
    }
}