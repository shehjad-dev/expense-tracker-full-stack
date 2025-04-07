import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { stringify } from 'csv-stringify/sync';
import { ConfigService } from 'src/config/config.service';
import { RABBITMQ_QUEUE_NAME } from 'src/constants';
import { ExpensesService } from 'src/expenses/expenses.service';

interface Expense {
    categoryName: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ConsumerService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private readonly queueName = RABBITMQ_QUEUE_NAME;
    private readonly url: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly expensesService: ExpensesService,
    ) {
        this.url = this.configService.rabbitMqUrl || 'amqp://localhost:5672';
    }

    async onModuleInit() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });

            this.logger.log(`Connected to RabbitMQ and listening on queue: ${this.queueName}`);

            await this.channel.consume(this.queueName, async (message) => {
                if (!message) {
                    this.logger.warn('Received null message');
                    return;
                }

                try {
                    const payload = JSON.parse(message.content.toString());
                    this.logger.debug('Received message', payload);

                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();
                    const startOfLastMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
                    const endOfLastMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

                    const expenses = await this.expensesService.findByDateRange(
                        startOfLastMonth,
                        endOfLastMonth,
                    );

                    if (expenses.length === 0) {
                        this.logger.log('No expenses found for the last month');
                        this.channel.ack(message);
                        return;
                    }

                    const csv = this.generateCSV(expenses);
                    this.logger.debug('Generated CSV for last month', csv);

                    this.channel.ack(message);
                } catch (error) {
                    this.logger.error('Error processing message', error);
                    // Optionally nack/requeue based on your needs
                    this.channel.nack(message, false, false); // Reject without requeueing
                }
            }, { noAck: false }); // Ensure manual acknowledgment
        } catch (error) {
            this.logger.error('Failed to initialize RabbitMQ consumer', error);
            throw error;
        }
    }

    async onModuleDestroy() {
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
            this.logger.error('Error during shutdown', error);
        }
    }

    private generateCSV(expenses: Expense[]): string {
        const headers = [
            'sl.no',
            'categoryName',
            'name',
            'amount',
            'isRecurring',
            'recurringInterval',
            'createdAt',
            'updatedAt',
        ];

        const records = expenses.map((expense, idx) => [
            idx + 1,
            expense.categoryName,
            expense.name,
            expense.amount,
            expense.isRecurring ? 'true' : 'false',
            expense.recurringInterval || 'n/a',
            expense.createdAt.toISOString(),
            expense.updatedAt.toISOString(),
        ]);

        return stringify([headers, ...records], {
            header: false,
            delimiter: ',',
        });
    }
}