import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const port = process.env.NODE_ENV === 'development' ? 5001 : 3000;
    await app.listen(port);
}
bootstrap();
