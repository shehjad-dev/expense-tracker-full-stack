import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
// import { ConfigModule } from '@nestjs/config';
import { ExpensesModule } from './expenses/expenses.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from './mongo/mongo.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
    imports: [
        ConfigModule,
        MongoModule,
        ExpensesModule,
        CategoriesModule,
        // MongooseModule.forRoot(DB_URL),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
