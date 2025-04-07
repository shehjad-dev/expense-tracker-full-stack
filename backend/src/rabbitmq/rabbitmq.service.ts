import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
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
            this.logger.log('Connected to RabbitMQ');
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }

    async getChannel(): Promise<amqp.Channel> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not available');
        }
        return this.channel;
    }

    private async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.logger.log('RabbitMQ channel closed');
            }
            if (this.connection) {
                await this.connection.close();
                this.logger.log('RabbitMQ connection closed');
            }
        } catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error);
        }
    }
}