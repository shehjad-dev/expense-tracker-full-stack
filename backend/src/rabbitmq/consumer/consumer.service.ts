import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { RABBITMQ_QUEUE_NAME } from 'src/constants';
import { ExpensesService } from 'src/expenses/expenses.service';
import { stringify } from 'csv-stringify/sync';

interface Expense {
    categoryName: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface TransformedExpense {
    _id: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringInterval?: 'daily' | 'weekly' | 'monthly';
    nextRecurrenceDate?: Date;
    isOriginal: boolean;
    createdAt: Date;
    updatedAt: Date;
    categoryName: string;
}

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ConsumerService.name);
    private readonly queueName = RABBITMQ_QUEUE_NAME;

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly expensesService: ExpensesService,
    ) { }

    async onModuleInit() {
        try {
            const channel = await this.rabbitMQService.getChannel();
            await channel.assertQueue(this.queueName, { durable: true });
            await channel.consume(
                this.queueName,
                async (message) => {
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

                        const expenses: TransformedExpense[] = await this.expensesService.findByDateRange(
                            startOfLastMonth,
                            endOfLastMonth,
                        );

                        if (expenses.length === 0) {
                            this.logger.log('No expenses found for the last month');
                            channel.ack(message);
                            return;
                        }

                        const csv = this.generateCSV(expenses);
                        this.logger.debug('Generated CSV for last month', csv);
                        channel.ack(message);
                    } catch (error) {
                        this.logger.error('Error processing message', error);
                        channel.nack(message, false, false);
                    }
                },
                { noAck: false },
            );
            this.logger.log(`Started consuming from queue: ${this.queueName}`);
        } catch (error) {
            this.logger.error('Failed to start RabbitMQ consumer', error);
            throw error;
        }
    }

    async onModuleDestroy() {
    }

    private generateCSV(expenses: TransformedExpense[]): string {
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