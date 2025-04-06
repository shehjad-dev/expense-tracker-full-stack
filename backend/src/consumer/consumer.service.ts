import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '../config/config.service';
import { ExpensesService } from '../expenses/expenses.service'; // Adjust path as needed
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private readonly queueName = 'cron_queue';
    private readonly url: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly expensesService: ExpensesService,
    ) {
        this.url = this.configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
    }

    async onModuleInit() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });

            this.channel.consume(this.queueName, async (message) => {
                if (message) {
                    const payload = JSON.parse(message.content.toString());
                    console.log('Consumer received message:', payload);

                    // Calculate the date range for the previous month in UTC
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();

                    // Start of the previous month (e.g., March 1st, 2025)
                    const startOfLastMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
                    // End of the previous month (e.g., March 31st, 2025)
                    const endOfLastMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

                    console.log(
                        'startOfLastMonth:',
                        startOfLastMonth,
                        'endOfLastMonth:',
                        endOfLastMonth,
                    );

                    // Fetch expenses from MongoDB for the last month based on createdAt
                    const expenses = await this.expensesService.findByDateRange(
                        startOfLastMonth,
                        endOfLastMonth,
                    );

                    console.log('expenses:', expenses);

                    if (expenses.length === 0) {
                        console.log('No expenses found for the last month.');
                        this.channel.ack(message);
                        return;
                    }

                    // Convert expenses to CSV
                    const csv = this.generateCSV(expenses);
                    console.log('Expenses CSV for last month -- :\n', csv, '\n ----- \n');

                    this.channel.ack(message); // Manually acknowledge the message
                }
            });
        } catch (error) {
            console.error('Error initializing consumer:', error);
        }
    }

    async onModuleDestroy() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }

    private generateCSV(expenses: any[]): string {
        // Define CSV headers based on your Expense schema
        const headers = [
            'sl.no',
            'categoryName',
            'name',
            'amount',
            'isRecurring',
            'recurringInterval',
            // 'nextRecurrenceDate',
            // 'isOriginal',
            'createdAt',
            'updatedAt',
        ];

        const records = expenses.map((expense, idx) => [
            idx + 1,
            expense.categoryName,
            expense.name,
            expense.amount,
            expense.isRecurring ? 'true' : 'false', // Convert boolean to string
            expense.recurringInterval || 'n/a', // Handle optional field
            // expense.nextRecurrenceDate ? expense.nextRecurrenceDate.toISOString() : '', // Handle optional Date
            // expense.isOriginal ? 'true' : 'false', // Convert boolean to string
            expense.createdAt.toISOString(),
            expense.updatedAt.toISOString(),
        ]);

        return stringify([headers, ...records], {
            header: false,
            delimiter: ',',
        });
    }
}