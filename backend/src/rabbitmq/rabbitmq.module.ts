import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RabbitMQService } from './rabbitmq.service';

@Module({
    imports: [ConfigModule],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule { }