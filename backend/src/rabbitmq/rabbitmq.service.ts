import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private readonly queueName = 'cron_queue';
    private readonly url: string;

    constructor(private readonly configService: ConfigService) {
        this.url = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
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
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async sendToQueue(payload: any) {
        try {
            if (!this.channel) {
                await this.connect();
            }
            const message = Buffer.from(JSON.stringify(payload));
            await this.channel.sendToQueue(this.queueName, message, {
                persistent: true,
            });
            console.log('Message sent to queue:', payload);
        } catch (error) {
            console.error('Error sending message to queue:', error);
            throw error;
        }
    }

    async close() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }
}