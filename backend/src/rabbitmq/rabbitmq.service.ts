import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '../config/config.service';
import { RABBITMQ_QUEUE_NAME } from 'src/constants';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly queueName = RABBITMQ_QUEUE_NAME;
    private readonly url: string;

    constructor(private readonly configService: ConfigService) {
        this.url = this.configService.rabbitMqUrl || 'amqp://localhost:5672';
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.close();
    }

    private async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            this.logger.log(`Connected to RabbitMQ and queue ${this.queueName} asserted`);
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }

    async sendToQueue(payload: Record<string, unknown>) {
        try {
            if (!this.channel) {
                this.logger.warn('Channel not available, attempting to reconnect');
                await this.connect();
            }

            const message = Buffer.from(JSON.stringify(payload));
            await this.channel!.sendToQueue(this.queueName, message, {
                persistent: true,
            });
            this.logger.debug('Message sent to queue', payload);
        } catch (error) {
            this.logger.error('Error sending message to queue', error);
            throw error;
        }
    }

    private async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.logger.log('RabbitMQ channel closed');
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.logger.log('RabbitMQ connection closed');
                this.connection = null;
            }
        } catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error);
        }
    }
}