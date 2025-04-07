import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class CronService {
    constructor(private readonly rabbitMQService: RabbitMQService) { }

    async sendMessage() {
        const msg = {
            id: '2938ta2938923',
            timestamp: new Date().toISOString(),
            text: 'This is a dummy payload',
        };
        console.log(msg, "Cron Job Executed!");
        await this.rabbitMQService.sendToQueue(msg);
    }
}