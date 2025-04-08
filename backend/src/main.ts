import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('ExpTracker API Docs')
        .setDescription('The Api Documentation for the best expense tracker ever!')
        .setVersion('1.0')
        .addTag('expense tracker')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs/api', app, documentFactory);

    const port = process.env.NODE_ENV === 'development' ? 5001 : 3000;
    await app.listen(port);
}
bootstrap();
