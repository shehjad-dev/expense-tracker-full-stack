import { Injectable } from '@nestjs/common';
// import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class CronService {
    //   constructor(private readonly rabbitMQService: RabbitMQService) {}

    async sendMessage() {
        const msg = { id: '2938ta2938923' };
        console.log(msg, "Cron Job Executed!");
        // await this.rabbitMQService.sendMessage(msg);
    }
}