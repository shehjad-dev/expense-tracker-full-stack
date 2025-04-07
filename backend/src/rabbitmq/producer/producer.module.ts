import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq.module';
import { ProducerService } from './producer.service';

@Module({
    imports: [RabbitMQModule],
    providers: [ProducerService],
    exports: [ProducerService],
})
export class ProducerModule { }