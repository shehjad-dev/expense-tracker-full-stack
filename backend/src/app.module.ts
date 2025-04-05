import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
// import { ConfigModule } from '@nestjs/config';
import { ExpensesModule } from './expenses/expenses.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from './mongo/mongo.module';
import { CategoriesModule } from './categories/categories.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';

@Module({
    imports: [
        ConfigModule,
        MongoModule,
        ExpensesModule,
        CategoriesModule,
        ScheduleModule.forRoot(),
        CronModule
        // MongooseModule.forRoot(DB_URL),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
