import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
// import { ConfigModule } from '@nestjs/config';
import { ExpensesModule } from './expenses/expenses.module';
import { MongooseModule } from '@nestjs/mongoose';

const DB_URL = "mongodb+srv://satauswebdev:QITqUg7tUuFm2nbn@expensestracker.5ufqf.mongodb.net/expensesDB";

@Module({
    imports: [
        ConfigModule,
        ExpensesModule,
        MongooseModule.forRoot(DB_URL),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
