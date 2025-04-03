import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
// import { ConfigModule } from '@nestjs/config';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
    imports: [ConfigModule, ExpensesModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
